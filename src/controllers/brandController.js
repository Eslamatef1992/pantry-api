const { Brand } = require('../models');

const slugify = (s) =>
  s.toString().toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const listBrands = async (req, res, next) => {
  try {
    const where = req.query.all === 'true' ? {} : { isActive: true };
    const brands = await Brand.findAll({ where, order: [['sortOrder', 'ASC'], ['id', 'ASC']] });
    res.json(brands);
  } catch (err) {
    next(err);
  }
};

const getBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findOne({ where: { slug: req.params.slug } });
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.json(brand);
  } catch (err) {
    next(err);
  }
};

const createBrand = async (req, res, next) => {
  try {
    const { nameEn, nameAr, image, isActive, sortOrder } = req.body;
    if (!nameEn || !nameAr) return res.status(400).json({ message: 'nameEn and nameAr are required' });
    const slug = slugify(nameEn);
    const brand = await Brand.create({ nameEn, nameAr, slug, image, isActive, sortOrder });
    res.status(201).json(brand);
  } catch (err) {
    next(err);
  }
};

const updateBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    const { nameEn, nameAr, image, isActive, sortOrder } = req.body;
    if (nameEn) brand.slug = slugify(nameEn);
    await brand.update({ nameEn, nameAr, image, isActive, sortOrder });
    res.json(brand);
  } catch (err) {
    next(err);
  }
};

const deleteBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    await brand.destroy();
    res.json({ message: 'Brand deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listBrands, getBrand, createBrand, updateBrand, deleteBrand };
