const { Op } = require('sequelize');
const { sequelize, Product, OrderItem, Order } = require('../models');

// Admin: every product with its current stock level and how many times /
// how many units it has been ordered. Backs the "Product Stock" module.
const productStock = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const where = {};
    if (search) {
      where[Op.or] = [
        { nameEn: { [Op.like]: `%${search}%` } },
        { nameAr: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } },
      ];
    }
    const offset = (Number(page) - 1) * Number(limit);
    const { rows, count } = await Product.findAndCountAll({
      where,
      attributes: ['id', 'nameEn', 'nameAr', 'sku', 'stock', 'image', 'price'],
      order: [['nameEn', 'ASC']],
      limit: Number(limit),
      offset,
    });

    const ids = rows.map((p) => p.id);
    const agg = ids.length
      ? await OrderItem.findAll({
          where: { productId: ids },
          attributes: [
            'productId',
            [sequelize.fn('COUNT', sequelize.col('id')), 'timesOrdered'],
            [sequelize.fn('SUM', sequelize.col('quantity')), 'unitsSold'],
          ],
          group: ['productId'],
          raw: true,
        })
      : [];
    const aggMap = new Map(agg.map((a) => [a.productId, a]));

    const items = rows.map((p) => {
      const a = aggMap.get(p.id);
      return {
        ...p.toJSON(),
        timesOrdered: a ? Number(a.timesOrdered) : 0,
        unitsSold: a ? Number(a.unitsSold) : 0,
      };
    });

    res.json({ items, total: count, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

// Admin: revenue + order-count-by-status + top-selling products over an
// optional date range (defaults to all time). Backs the "Reports" module.
const summary = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const dateWhere = {};
    if (from) dateWhere[Op.gte] = new Date(from);
    if (to) dateWhere[Op.lte] = new Date(`${to}T23:59:59.999Z`);
    const where = Object.keys(dateWhere).length ? { createdAt: dateWhere } : {};

    const orders = await Order.findAll({ where, attributes: ['id', 'status', 'paymentStatus', 'total', 'createdAt'] });
    const totalOrders = orders.length;
    const totalRevenue = orders.filter((o) => o.paymentStatus === 'paid').reduce((s, o) => s + Number(o.total), 0);

    const byStatus = {};
    for (const o of orders) {
      byStatus[o.status] = (byStatus[o.status] || 0) + 1;
    }

    const orderIds = orders.map((o) => o.id);
    const topProducts = orderIds.length
      ? await OrderItem.findAll({
          where: { orderId: orderIds },
          attributes: [
            'productId',
            'nameEn',
            'nameAr',
            [sequelize.fn('SUM', sequelize.col('quantity')), 'unitsSold'],
          ],
          group: ['productId', 'nameEn', 'nameAr'],
          order: [[sequelize.literal('unitsSold'), 'DESC']],
          limit: 10,
          raw: true,
        })
      : [];

    res.json({
      totalOrders,
      totalRevenue,
      byStatus,
      topProducts: topProducts.map((p) => ({ ...p, unitsSold: Number(p.unitsSold) })),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { productStock, summary };
