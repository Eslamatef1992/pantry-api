const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admin access required' });
};

module.exports = { protect, adminOnly };
