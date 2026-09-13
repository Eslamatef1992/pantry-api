const express = require('express');
const {
  getPublicSeo,
  updateSeoMeta,
  listPixels,
  getPixel,
  createPixel,
  updatePixel,
  deletePixel,
} = require('../controllers/seoController');
const { protect, superAdminOnly } = require('../middleware/auth');

const router = express.Router();

// Public - the storefront fetches this once on load to set meta tags and
// inject active pixels/scripts.
router.get('/public', getPublicSeo);

// Super admin only - manage SEO meta + pixels from the admin panel.
router.put('/meta', protect, superAdminOnly, updateSeoMeta);
router.get('/pixels', protect, superAdminOnly, listPixels);
router.post('/pixels', protect, superAdminOnly, createPixel);
router.get('/pixels/:id', protect, superAdminOnly, getPixel);
router.put('/pixels/:id', protect, superAdminOnly, updatePixel);
router.delete('/pixels/:id', protect, superAdminOnly, deletePixel);

module.exports = router;
