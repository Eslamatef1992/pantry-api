const express = require('express');
const upload = require('../middleware/upload');
const { uploadImage } = require('../controllers/uploadController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, adminOnly, upload.single('image'), uploadImage);

module.exports = router;
