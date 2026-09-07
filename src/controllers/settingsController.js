const { PaymentSetting } = require('../models');

// Public: storefront checkout needs to know which methods are currently enabled.
const listPublicPaymentMethods = async (req, res, next) => {
  try {
    const settings = await PaymentSetting.findAll({
      where: { isEnabled: true },
      attributes: ['method', 'displayNameEn', 'displayNameAr'],
    });
    res.json(settings);
  } catch (err) {
    next(err);
  }
};

// Admin: full list + toggles.
const listPaymentSettings = async (req, res, next) => {
  try {
    const settings = await PaymentSetting.findAll();
    res.json(settings);
  } catch (err) {
    next(err);
  }
};

const updatePaymentSetting = async (req, res, next) => {
  try {
    const setting = await PaymentSetting.findOne({ where: { method: req.params.method } });
    if (!setting) return res.status(404).json({ message: 'Payment method not found' });
    const { isEnabled, displayNameEn, displayNameAr, config } = req.body;
    await setting.update({
      isEnabled: typeof isEnabled === 'boolean' ? isEnabled : setting.isEnabled,
      displayNameEn: displayNameEn ?? setting.displayNameEn,
      displayNameAr: displayNameAr ?? setting.displayNameAr,
      config: config ?? setting.config,
    });
    res.json(setting);
  } catch (err) {
    next(err);
  }
};

module.exports = { listPublicPaymentMethods, listPaymentSettings, updatePaymentSetting };
