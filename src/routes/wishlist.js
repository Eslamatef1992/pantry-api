const express = require('express');
const { myWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.get('/', myWishlist);
router.post('/', addToWishlist);
router.delete('/:productId', removeFromWishlist);

module.exports = router;
