const { Banner } = require('../models');

const listPublicBanners = async (req, res, next) => {
  try {
    const banners = await Banner.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC'], ['id', 'ASC']],
    });
    res.json(banners);
  } catch (err) {
    next(err);
  }
};

const listAllBanners = async (req, res, next) => {
  try {
    const banners = await Banner.findAll({ order: [['sortOrder', 'ASC'], ['id', 'ASC']] });
    res.json(banners);
  } catch (err) {
    next(err);
  }
};

const createBanner = async (req, res, next) => {
  try {
    const { titleEn, titleAr, subtitleEn, subtitleAr, image, linkUrl, isActive, sortOrder } = req.body;
    if (!image) return res.status(400).json({ message: 'image is required' });
    const banner = await Banner.create({ titleEn, titleAr, subtitleEn, subtitleAr, image, linkUrl, isActive, sortOrder });
    res.status(201).json(banner);
  } catch (err) {
    next(err);
  }
};

const updateBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    await banner.update(req.body);
    res.json(banner);
  } catch (err) {
    next(err);
  }
};

const deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    await banner.destroy();
    res.json({ message: 'Banner deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listPublicBanners, listAllBanners, createBanner, updateBanner, deleteBanner };
