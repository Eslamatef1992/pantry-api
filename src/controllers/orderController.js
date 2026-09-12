const { sequelize, Order, OrderItem, Cart, CartItem, Product, Address, PaymentSetting } = require('../models');
const generateOrderNumber = require('../utils/orderNumber');

const DELIVERY_FEE = 1.5; // KWD flat rate placeholder, adjust once business rules are set

const createOrder = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { addressId, paymentMethod, notes } = req.body;

    const setting = await PaymentSetting.findOne({ where: { method: paymentMethod } });
    if (!setting || !setting.isEnabled) {
      await t.rollback();
      return res.status(400).json({ message: `Payment method '${paymentMethod}' is not enabled` });
    }

    const cart = await Cart.findOne({
      where: { userId: req.user.id },
      include: [{ model: CartItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
      transaction: t,
    });
    if (!cart || !cart.items.length) {
      await t.rollback();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let address = null;
    if (addressId) {
      address = await Address.findOne({ where: { id: addressId, userId: req.user.id }, transaction: t });
    }

    const subtotal = cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
    const deliveryFee = DELIVERY_FEE;
    const total = subtotal + deliveryFee;

    const order = await Order.create(
      {
        orderNumber: generateOrderNumber(),
        userId: req.user.id,
        addressId: address ? address.id : null,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
        subtotal,
        deliveryFee,
        total,
        shippingSnapshot: address ? address.toJSON() : null,
        notes,
      },
      { transaction: t }
    );

    for (const item of cart.items) {
      await OrderItem.create(
        {
          orderId: order.id,
          productId: item.productId,
          nameEn: item.product.nameEn,
          nameAr: item.product.nameAr,
          price: item.product.price,
          quantity: item.quantity,
        },
        { transaction: t }
      );
      if (item.product.stock !== null) {
        await item.product.decrement('stock', { by: item.quantity, transaction: t });
      }
    }

    await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });

    await t.commit();

    // NOTE: KNET / Sadad redirect+callback integration goes here once merchant
    // credentials are provided (see PaymentSetting.config). For now the order
    // is created with paymentStatus 'pending' and can be reconciled manually
    // or via a webhook handler added later.

    const full = await Order.findByPk(order.id, { include: [{ model: OrderItem, as: 'items' }] });
    res.status(201).json(full);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// Guest checkout: no account required. The client sends the items directly
// (rather than relying on a server-side Cart, which is tied to a userId) and
// contact + delivery details entered at checkout time. Prices are always
// re-read from the Product table here, never trusted from the client.
const createGuestOrder = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { items, guestName, guestPhone, guestEmail, address, paymentMethod, notes } = req.body;

    if (!guestName || !guestPhone) {
      await t.rollback();
      return res.status(400).json({ message: 'Name and phone are required' });
    }
    if (!Array.isArray(items) || !items.length) {
      await t.rollback();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const setting = await PaymentSetting.findOne({ where: { method: paymentMethod } });
    if (!setting || !setting.isEnabled) {
      await t.rollback();
      return res.status(400).json({ message: `Payment method '${paymentMethod}' is not enabled` });
    }

    const productIds = items.map((i) => i.productId);
    const products = await Product.findAll({ where: { id: productIds }, transaction: t });
    const productMap = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const lineItems = [];
    for (const { productId, quantity } of items) {
      const product = productMap.get(productId);
      const qty = Number(quantity) || 0;
      if (!product || !product.isActive || qty <= 0) {
        await t.rollback();
        return res.status(400).json({ message: 'One or more items are no longer available' });
      }
      if (product.stock !== null && product.stock < qty) {
        await t.rollback();
        return res.status(400).json({ message: `Not enough stock for ${product.nameEn}` });
      }
      subtotal += Number(product.price) * qty;
      lineItems.push({ product, quantity: qty });
    }

    const deliveryFee = DELIVERY_FEE;
    const total = subtotal + deliveryFee;

    const order = await Order.create(
      {
        orderNumber: generateOrderNumber(),
        userId: null,
        guestName,
        guestPhone,
        guestEmail: guestEmail || null,
        addressId: null,
        paymentMethod,
        paymentStatus: 'pending',
        subtotal,
        deliveryFee,
        total,
        shippingSnapshot: address ? { fullName: guestName, phone: guestPhone, ...address } : null,
        notes,
      },
      { transaction: t }
    );

    for (const { product, quantity } of lineItems) {
      await OrderItem.create(
        {
          orderId: order.id,
          productId: product.id,
          nameEn: product.nameEn,
          nameAr: product.nameAr,
          price: product.price,
          quantity,
        },
        { transaction: t }
      );
      if (product.stock !== null) {
        await product.decrement('stock', { by: quantity, transaction: t });
      }
    }

    await t.commit();

    const full = await Order.findByPk(order.id, { include: [{ model: OrderItem, as: 'items' }] });
    res.status(201).json(full);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

const myOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'slug', 'image', 'images'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

const getMyOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'slug', 'image', 'images'] }],
        },
        { model: Address, as: 'address' },
      ],
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// Admin
const listAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = status ? { status } : {};
    const offset = (Number(page) - 1) * Number(limit);
    const { rows, count } = await Order.findAndCountAll({
      where,
      include: [{ model: OrderItem, as: 'items' }],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset,
    });
    res.json({ orders: rows, total: count, page: Number(page), pages: Math.ceil(count / Number(limit)) });
  } catch (err) {
    next(err);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const { status, paymentStatus } = req.body;
    await order.update({
      status: status || order.status,
      paymentStatus: paymentStatus || order.paymentStatus,
    });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  createGuestOrder,
  myOrders,
  getMyOrder,
  listAllOrders,
  updateOrderStatus,
};
