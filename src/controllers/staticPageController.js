const { StaticPage } = require('../models');

const listPages = async (req, res, next) => {
  try {
    const where = req.query.all === 'true' ? {} : { isActive: true };
    const pages = await StaticPage.findAll({ where, order: [['id', 'ASC']] });
    res.json(pages);
  } catch (err) {
    next(err);
  }
};

const getPage = async (req, res, next) => {
  try {
    const page = await StaticPage.findOne({ where: { slug: req.params.slug } });
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.json(page);
  } catch (err) {
    next(err);
  }
};

const createPage = async (req, res, next) => {
  try {
    const { slug, titleEn, titleAr, contentEn, contentAr, isActive } = req.body;
    if (!slug || !titleEn || !titleAr) {
      return res.status(400).json({ message: 'slug, titleEn and titleAr are required' });
    }
    const page = await StaticPage.create({ slug, titleEn, titleAr, contentEn, contentAr, isActive });
    res.status(201).json(page);
  } catch (err) {
    next(err);
  }
};

const updatePage = async (req, res, next) => {
  try {
    const page = await StaticPage.findByPk(req.params.id);
    if (!page) return res.status(404).json({ message: 'Page not found' });
    const { titleEn, titleAr, contentEn, contentAr, isActive } = req.body;
    await page.update({ titleEn, titleAr, contentEn, contentAr, isActive });
    res.json(page);
  } catch (err) {
    next(err);
  }
};

const deletePage = async (req, res, next) => {
  try {
    const page = await StaticPage.findByPk(req.params.id);
    if (!page) return res.status(404).json({ message: 'Page not found' });
    await page.destroy();
    res.json({ message: 'Page deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listPages, getPage, createPage, updatePage, deletePage };
