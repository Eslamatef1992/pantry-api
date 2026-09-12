const { Category, Product } = require('../models');

const slugify = (s) =>
  s.toString().toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const listCategories = async (req, res, next) => {
  try {
    const where = req.query.all === 'true' ? {} : { isActive: true };
    const categories = await Category.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['id', 'ASC']],
      include: req.query.withCounts === 'true' ? [{ model: Product, as: 'products', attributes: ['id'] }] : [],
    });
    const payload = categories.map((c) => {
      const json = c.toJSON();
      if (json.products) {
        json.productCount = json.products.length;
        delete json.products;
      }
      return json;
    });
    res.json(payload);
  } catch (err) {
    next(err);
  }
};

const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ where: { slug: req.params.slug } });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    next(err);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { nameEn, nameAr, image, isActive, sortOrder } = req.body;
    if (!nameEn || !nameAr) return res.status(400).json({ message: 'nameEn and nameAr are required' });
    const slug = slugify(nameEn);
    const category = await Category.create({ nameEn, nameAr, slug, image, isActive, sortOrder });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    const { nameEn, nameAr, image, isActive, sortOrder } = req.body;
    if (nameEn) category.slug = slugify(nameEn);
    await category.update({ nameEn, nameAr, image, isActive, sortOrder });
    res.json(category);
  } catch (err) {
    next(err);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    await category.destroy();
    res.json({ message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listCategories, getCategory, createCategory, updateCategory, deleteCategory };
