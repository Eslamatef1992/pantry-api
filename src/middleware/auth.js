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

// Restricts to admins whose adminRole is 'super_admin'. Use this for managing
// other admin accounts and store-wide Rules (delivery fee, minimum order, etc).
// Legacy admins created before adminRole existed (adminRole === null) are treated
// as super_admin so no existing admin loses access after this migration.
const superAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin' && (req.user.adminRole === 'super_admin' || !req.user.adminRole)) {
    return next();
  }
  return res.status(403).json({ message: 'Super admin access required' });
};

module.exports = { protect, adminOnly, superAdminOnly };
