const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { User, Order } = require('../models');

const publicAdmin = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  adminRole: user.adminRole,
  isActive: user.isActive,
  createdAt: user.createdAt,
});

// Admin: list all registered customers (role='customer'), with search + pagination.
const listCustomers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const where = { role: 'customer' };
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }
    const offset = (Number(page) - 1) * Number(limit);
    const { rows, count } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset,
    });
    // Order count per customer, for a quick "orders placed" column.
    const ids = rows.map((u) => u.id);
    const orderCounts = ids.length
      ? await Order.findAll({
          where: { userId: ids },
          attributes: ['userId', [Order.sequelize.fn('COUNT', Order.sequelize.col('id')), 'orderCount']],
          group: ['userId'],
          raw: true,
        })
      : [];
    const countMap = new Map(orderCounts.map((o) => [o.userId, Number(o.orderCount)]));
    const items = rows.map((u) => ({ ...u.toJSON(), orderCount: countMap.get(u.id) || 0 }));
    res.json({ items, total: count, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

// Admin: toggle a customer's active status (block/unblock), no deletion of order history.
const setCustomerActive = async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.params.id, role: 'customer' } });
    if (!user) return res.status(404).json({ message: 'Customer not found' });
    const { isActive } = req.body;
    await user.update({ isActive: !!isActive });
    res.json(publicAdmin(user));
  } catch (err) {
    next(err);
  }
};

// Admin: edit a customer's own contact details (name/email/phone).
const updateCustomer = async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.params.id, role: 'customer' } });
    if (!user) return res.status(404).json({ message: 'Customer not found' });
    const { name, email, phone } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    if (email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) return res.status(400).json({ message: 'Email already registered' });
    }
    await user.update({ name, email, phone: phone !== undefined ? phone : user.phone });
    res.json(publicAdmin(user));
  } catch (err) {
    next(err);
  }
};

// Super admin: list all admin accounts.
const listAdmins = async (req, res, next) => {
  try {
    const { search } = req.query;
    const where = { role: 'admin' };
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }
    const admins = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'ASC']],
    });
    res.json(admins.map(publicAdmin));
  } catch (err) {
    next(err);
  }
};

// Super admin: create a new admin account (super_admin or staff).
const createAdmin = async (req, res, next) => {
  try {
    const { name, email, phone, password, adminRole } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (!['super_admin', 'staff'].includes(adminRole)) {
      return res.status(400).json({ message: 'adminRole must be super_admin or staff' });
    }
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const admin = await User.create({
      name,
      email,
      phone,
      password: hashed,
      role: 'admin',
      adminRole,
    });
    res.status(201).json(publicAdmin(admin));
  } catch (err) {
    next(err);
  }
};

// Super admin: update an admin's details/role/active state, or reset their password.
const updateAdmin = async (req, res, next) => {
  try {
    const admin = await User.findOne({ where: { id: req.params.id, role: 'admin' } });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const { name, phone, adminRole, isActive, password } = req.body;
    if (adminRole && !['super_admin', 'staff'].includes(adminRole)) {
      return res.status(400).json({ message: 'adminRole must be super_admin or staff' });
    }
    if (admin.id === req.user.id && adminRole && adminRole !== 'super_admin') {
      return res.status(400).json({ message: 'You cannot demote your own account' });
    }
    if (admin.id === req.user.id && isActive === false) {
      return res.status(400).json({ message: 'You cannot deactivate your own account' });
    }

    const updates = {
      name: name !== undefined ? name : admin.name,
      phone: phone !== undefined ? phone : admin.phone,
      adminRole: adminRole !== undefined ? adminRole : admin.adminRole,
      isActive: isActive !== undefined ? !!isActive : admin.isActive,
    };
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      updates.password = await bcrypt.hash(password, 10);
    }
    await admin.update(updates);
    res.json(publicAdmin(admin));
  } catch (err) {
    next(err);
  }
};

// Super admin: remove an admin account (cannot delete yourself).
const deleteAdmin = async (req, res, next) => {
  try {
    if (Number(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    const admin = await User.findOne({ where: { id: req.params.id, role: 'admin' } });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    await admin.destroy();
    res.json({ message: 'Admin removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listCustomers,
  setCustomerActive,
  updateCustomer,
  listAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
};
