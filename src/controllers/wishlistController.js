const { Wishlist, Product, Category } = require('../models');

const myWishlist = async (req, res, next) => {
  try {
    const items = await Wishlist.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product, as: 'product', include: [{ model: Category, as: 'category' }] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId is required' });
    const [item] = await Wishlist.findOrCreate({
      where: { userId: req.user.id, productId },
      defaults: { userId: req.user.id, productId },
    });
    const full = await Wishlist.findByPk(item.id, {
      include: [{ model: Product, as: 'product', include: [{ model: Category, as: 'category' }] }],
    });
    res.status(201).json(full);
  } catch (err) {
    next(err);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    await Wishlist.destroy({ where: { userId: req.user.id, productId: req.params.productId } });
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    next(err);
  }
};

module.exports = { myWishlist, addToWishlist, removeFromWishlist };
