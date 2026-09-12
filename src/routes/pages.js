const express = require('express');
const {
  listPages,
  getPage,
  createPage,
  updatePage,
  deletePage,
} = require('../controllers/staticPageController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', listPages);
router.get('/:slug', getPage);
router.post('/', protect, adminOnly, createPage);
router.put('/:id', protect, adminOnly, updatePage);
router.delete('/:id', protect, adminOnly, deletePage);

module.exports = router;
