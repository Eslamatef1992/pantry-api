const { Op } = require('sequelize');
const { Product, Category, Brand } = require('../models');

const slugify = (s) =>
  s.toString().toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const listProducts = async (req, res, next) => {
  try {
    const {
      category,
      brand,
      search,
      featured,
      bestSeller,
      newArrival,
      bundle,
      onOffer,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
      all,
    } = req.query;
    const where = {};
    if (all !== 'true') where.isActive = true;
    if (featured === 'true') where.isFeatured = true;
    if (bestSeller === 'true') where.isBestSeller = true;
    if (newArrival === 'true') where.isNewArrival = true;
    if (bundle === 'true') where.isBundle = true;
    if (onOffer === 'true') {
      where.compareAtPrice = { [Op.not]: null, [Op.gt]: { [Op.col]: 'price' } };
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined && minPrice !== '') where.price[Op.gte] = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== '') where.price[Op.lte] = Number(maxPrice);
    }
    if (search) {
      where[Op.or] = [
        { nameEn: { [Op.like]: `%${search}%` } },
        { nameAr: { [Op.like]: `%${search}%` } },
      ];
    }
    const include = [
      { model: Category, as: 'category', attributes: ['id', 'nameEn', 'nameAr', 'slug'] },
      { model: Brand, as: 'brand', attributes: ['id', 'nameEn', 'nameAr', 'slug'] },
    ];
    if (category) {
      include[0].where = { slug: category };
    }
    if (brand) {
      include[1].where = { slug: brand };
      include[1].required = true;
    }
    const offset = (Number(page) - 1) * Number(limit);
    const { rows, count } = await Product.findAndCountAll({
      where,
      include,
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true,
    });
    res.json({ products: rows, total: count, page: Number(page), pages: Math.ceil(count / Number(limit)) });
  } catch (err) {
    next(err);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      where: { slug: req.params.slug },
      include: [
        { model: Category, as: 'category' },
        { model: Brand, as: 'brand' },
      ],
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const body = req.body;
    if (!body.nameEn || !body.nameAr || !body.price || !body.categoryId) {
      return res.status(400).json({ message: 'nameEn, nameAr, price and categoryId are required' });
    }
    const slug = slugify(body.nameEn) + '-' + Date.now().toString().slice(-5);
    const product = await Product.create({ ...body, slug });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await product.update(req.body);
    res.json(product);
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await product.destroy();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
