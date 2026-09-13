const { SeoSetting, TrackingPixel } = require('../models');

const PIXEL_ID_RE = /^[A-Za-z0-9_-]{2,60}$/;
const KNOWN_TYPES = ['gtm', 'ga4', 'snap_pixel', 'facebook_pixel', 'tiktok_pixel', 'custom'];

const publicPixel = (p) => ({ id: p.id, type: p.type, pixelId: p.pixelId, code: p.type === 'custom' ? p.code : undefined });

// Public: everything the storefront needs to render meta tags + inject active
// pixels on load. Also read by the admin SEO page to pre-fill the meta form.
const getPublicSeo = async (req, res, next) => {
  try {
    const [meta] = await SeoSetting.findOrCreate({ where: { id: 1 }, defaults: { id: 1 } });
    const pixels = await TrackingPixel.findAll({ where: { isActive: true }, order: [['createdAt', 'ASC']] });
    res.json({ meta, pixels: pixels.map(publicPixel) });
  } catch (err) {
    next(err);
  }
};

// Super admin: site-wide SEO meta tags (title/description/keywords).
const updateSeoMeta = async (req, res, next) => {
  try {
    const [meta] = await SeoSetting.findOrCreate({ where: { id: 1 }, defaults: { id: 1 } });
    const { metaTitleEn, metaTitleAr, metaDescriptionEn, metaDescriptionAr, metaKeywords } = req.body;
    await meta.update({
      metaTitleEn: metaTitleEn !== undefined ? metaTitleEn : meta.metaTitleEn,
      metaTitleAr: metaTitleAr !== undefined ? metaTitleAr : meta.metaTitleAr,
      metaDescriptionEn: metaDescriptionEn !== undefined ? metaDescriptionEn : meta.metaDescriptionEn,
      metaDescriptionAr: metaDescriptionAr !== undefined ? metaDescriptionAr : meta.metaDescriptionAr,
      metaKeywords: metaKeywords !== undefined ? metaKeywords : meta.metaKeywords,
    });
    res.json(meta);
  } catch (err) {
    next(err);
  }
};

// Super admin: full pixel list (including inactive) for the admin table.
const listPixels = async (req, res, next) => {
  try {
    const pixels = await TrackingPixel.findAll({ order: [['createdAt', 'DESC']] });
    res.json(pixels);
  } catch (err) {
    next(err);
  }
};

const getPixel = async (req, res, next) => {
  try {
    const pixel = await TrackingPixel.findByPk(req.params.id);
    if (!pixel) return res.status(404).json({ message: 'Pixel not found' });
    res.json(pixel);
  } catch (err) {
    next(err);
  }
};

const validatePixelBody = (body) => {
  const { type, label, pixelId, code } = body;
  if (!KNOWN_TYPES.includes(type)) return 'Invalid pixel type';
  if (!label || !label.trim()) return 'Label is required';
  if (type === 'custom') {
    if (!code || !code.trim()) return 'Code is required for a custom script';
    if (code.length > 20000) return 'Code is too long (max 20000 characters)';
  } else {
    if (!pixelId || !PIXEL_ID_RE.test(pixelId.trim())) {
      return 'Pixel / container ID must be 2-60 letters, numbers, - or _';
    }
  }
  return null;
};

// Super admin: add a new pixel/script. Active immediately -- picked up by the
// storefront on its next load via getPublicSeo.
const createPixel = async (req, res, next) => {
  try {
    const error = validatePixelBody(req.body);
    if (error) return res.status(400).json({ message: error });
    const { type, label, pixelId, code, isActive } = req.body;
    const pixel = await TrackingPixel.create({
      type,
      label: label.trim(),
      pixelId: type === 'custom' ? null : pixelId.trim(),
      code: type === 'custom' ? code : null,
      isActive: isActive !== undefined ? !!isActive : true,
    });
    res.status(201).json(pixel);
  } catch (err) {
    next(err);
  }
};

const updatePixel = async (req, res, next) => {
  try {
    const pixel = await TrackingPixel.findByPk(req.params.id);
    if (!pixel) return res.status(404).json({ message: 'Pixel not found' });
    const error = validatePixelBody({ ...pixel.toJSON(), ...req.body });
    if (error) return res.status(400).json({ message: error });
    const { type, label, pixelId, code, isActive } = req.body;
    await pixel.update({
      type: type !== undefined ? type : pixel.type,
      label: label !== undefined ? label.trim() : pixel.label,
      pixelId: (type || pixel.type) === 'custom' ? null : pixelId !== undefined ? pixelId.trim() : pixel.pixelId,
      code: (type || pixel.type) === 'custom' ? (code !== undefined ? code : pixel.code) : null,
      isActive: isActive !== undefined ? !!isActive : pixel.isActive,
    });
    res.json(pixel);
  } catch (err) {
    next(err);
  }
};

const deletePixel = async (req, res, next) => {
  try {
    const pixel = await TrackingPixel.findByPk(req.params.id);
    if (!pixel) return res.status(404).json({ message: 'Pixel not found' });
    await pixel.destroy();
    res.json({ message: 'Pixel removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPublicSeo,
  updateSeoMeta,
  listPixels,
  getPixel,
  createPixel,
  updatePixel,
  deletePixel,
};
