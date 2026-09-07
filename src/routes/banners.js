const express = require('express');
const {
  listPublicBanners,
  listAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} = require('../controllers/bannerController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', listPublicBanners);
router.get('/admin/all', protect, adminOnly, listAllBanners);
router.post('/', protect, adminOnly, createBanner);
router.put('/:id', protect, adminOnly, updateBanner);
router.delete('/:id', protect, adminOnly, deleteBanner);

module.exports = router;
