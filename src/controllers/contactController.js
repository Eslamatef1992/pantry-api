const { ContactMessage } = require('../models');

// Public: storefront "Contact Us" form submission.
const createMessage = async (req, res, next) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email and message are required' });
    }
    const created = await ContactMessage.create({ name, email, phone: phone || null, message });
    res.status(201).json({ message: 'Message sent', id: created.id });
  } catch (err) {
    next(err);
  }
};

// Admin: inbox listing, newest first.
const listMessages = async (req, res, next) => {
  try {
    const { unreadOnly, page = 1, limit = 20 } = req.query;
    const where = unreadOnly === 'true' ? { isRead: false } : {};
    const offset = (Number(page) - 1) * Number(limit);
    const { rows, count } = await ContactMessage.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset,
    });
    res.json({ items: rows, total: count });
  } catch (err) {
    next(err);
  }
};

const markRead = async (req, res, next) => {
  try {
    const msg = await ContactMessage.findByPk(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    await msg.update({ isRead: req.body.isRead !== undefined ? !!req.body.isRead : true });
    res.json(msg);
  } catch (err) {
    next(err);
  }
};

const deleteMessage = async (req, res, next) => {
  try {
    const msg = await ContactMessage.findByPk(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    await msg.destroy();
    res.json({ message: 'Message deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createMessage, listMessages, markRead, deleteMessage };
