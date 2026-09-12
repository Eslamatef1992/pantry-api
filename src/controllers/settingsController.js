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

// Admin (any role): store contact info shown in the storefront footer / contact page.
const updateSiteSettings = async (req, res, next) => {
  try {
    const [settings] = await SiteSetting.findOrCreate({ where: { id: 1 }, defaults: { id: 1 } });
    const { phone1, phone2, email } = req.body;
    await settings.update({
      phone1: phone1 !== undefined ? phone1 : settings.phone1,
      phone2: phone2 !== undefined ? phone2 : settings.phone2,
      email: email !== undefined ? email : settings.email,
    });
    res.json(settings);
  } catch (err) {
    next(err);
  }
};

// Super admin only: store-wide delivery/order Rules. Kept as a separate endpoint
// (rather than folding into updateSiteSettings) so a non-super-admin calling the
// contact-info endpoint can never smuggle in changes to these fields.
const updateOrderRules = async (req, res, next) => {
  try {
    const [settings] = await SiteSetting.findOrCreate({ where: { id: 1 }, defaults: { id: 1 } });
    const { minOrderAmount, deliveryFee, freeDeliveryThreshold } = req.body;
    await settings.update({
      minOrderAmount: minOrderAmount !== undefined ? Number(minOrderAmount) : settings.minOrderAmount,
      deliveryFee: deliveryFee !== undefined ? Number(deliveryFee) : settings.deliveryFee,
      freeDeliveryThreshold:
        freeDeliveryThreshold !== undefined && freeDeliveryThreshold !== ''
          ? Number(freeDeliveryThreshold)
          : freeDeliveryThreshold === ''
          ? null
          : settings.freeDeliveryThreshold,
    });
    res.json(settings);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  updateOrderRules,
  listPublicPaymentMethods,
  listPaymentSettings,
  updatePaymentSetting,
  getSiteSettings,
  updateSiteSettings,
};
