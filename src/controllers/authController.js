const bcrypt = require('bcryptjs');
const { User, Cart } = require('../models');
const generateToken = require('../utils/generateToken');

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
});

const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, phone, password: hashed });
    await Cart.create({ userId: user.id });
    res.status(201).json({ user: publicUser(user), token: generateToken(user.id) });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account disabled' });
    }
    res.json({ user: publicUser(user), token: generateToken(user.id) });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res) => {
  res.json({ user: publicUser(req.user) });
};

module.exports = { register, login, me };
