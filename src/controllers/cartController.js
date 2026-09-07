const { Cart, CartItem, Product } = require('../models');

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ where: { userId } });
  if (!cart) cart = await Cart.create({ userId });
  return cart;
};

const includeItems = [{ model: CartItem, as: 'items', include: [{ model: Product, as: 'product' }] }];

const getCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    const full = await Cart.findByPk(cart.id, { include: includeItems });
    res.json(full);
  } catch (err) {
    next(err);
  }
};

const addItem = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const cart = await getOrCreateCart(req.user.id);
    let item = await CartItem.findOne({ where: { cartId: cart.id, productId } });
    if (item) {
      item.quantity += Number(quantity);
      await item.save();
    } else {
      item = await CartItem.create({ cartId: cart.id, productId, quantity });
    }
    const full = await Cart.findByPk(cart.id, { include: includeItems });
    res.status(201).json(full);
  } catch (err) {
    next(err);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await getOrCreateCart(req.user.id);
    const item = await CartItem.findOne({ where: { id: req.params.itemId, cartId: cart.id } });
    if (!item) return res.status(404).json({ message: 'Cart item not found' });
    if (quantity <= 0) {
      await item.destroy();
    } else {
      item.quantity = quantity;
      await item.save();
    }
    const full = await Cart.findByPk(cart.id, { include: includeItems });
    res.json(full);
  } catch (err) {
    next(err);
  }
};

const removeItem = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    await CartItem.destroy({ where: { id: req.params.itemId, cartId: cart.id } });
    const full = await Cart.findByPk(cart.id, { include: includeItems });
    res.json(full);
  } catch (err) {
    next(err);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    await CartItem.destroy({ where: { cartId: cart.id } });
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCart, addItem, updateItem, removeItem, clearCart, getOrCreateCart, includeItems };
