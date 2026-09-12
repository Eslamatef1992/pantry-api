const { PaymentSetting, SiteSetting } = require('../models');

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

// Public: footer contact info (phone/email). Any blank field is simply omitted by the client.
const getSiteSettings = async (req, res, next) => {
  try {
    const [settings] = await SiteSetting.findOrCreate({ where: { id: 1 }, defaults: { id: 1 } });
    res.json(settings);
  } catch (err) {
    next(err);
  }
};

const updateSiteSettings = async (req, res, next) => {
  try {
    const [settings] = await SiteSetting.findOrCreate({ where: { id: 1 }, defaults: { id: 1 } });
    const { phone1, phone2, email } = req.body;
    await settings.update({ phone1, phone2, email });
    res.json(settings);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listPublicPaymentMethods,
  listPaymentSettings,
  updatePaymentSetting,
  getSiteSettings,
  updateSiteSettings,
};
