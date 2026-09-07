const { Address } = require('../models');

const listAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.findAll({ where: { userId: req.user.id }, order: [['isDefault', 'DESC']] });
    res.json(addresses);
  } catch (err) {
    next(err);
  }
};

const createAddress = async (req, res, next) => {
  try {
    const address = await Address.create({ ...req.body, userId: req.user.id });
    res.status(201).json(address);
  } catch (err) {
    next(err);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!address) return res.status(404).json({ message: 'Address not found' });
    await address.update(req.body);
    res.json(address);
  } catch (err) {
    next(err);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!address) return res.status(404).json({ message: 'Address not found' });
    await address.destroy();
    res.json({ message: 'Address deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listAddresses, createAddress, updateAddress, deleteAddress };
