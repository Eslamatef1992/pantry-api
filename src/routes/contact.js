const express = require('express');
const { createMessage, listMessages, markRead, deleteMessage } = require('../controllers/contactController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Public: storefront contact form.
router.post('/', createMessage);

// Admin: inbox.
router.get('/admin/all', protect, adminOnly, listMessages);
router.put('/admin/:id/read', protect, adminOnly, markRead);
router.delete('/admin/:id', protect, adminOnly, deleteMessage);

module.exports = router;
