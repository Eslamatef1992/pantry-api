require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');
const { User, Category, Product, Cart, PaymentSetting, Banner } = require('../models');

const run = async () => {
  await sequelize.sync({ force: false });

  // Admin user
  const adminEmail = 'admin@makanifoods.com';
  const existingAdmin = await User.findOne({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash('ChangeMe123!', 10);
    const admin = await User.create({
      name: 'Pantry Foods Admin',
      email: adminEmail,
      password: hashed,
      role: 'admin',
    });
    await Cart.create({ userId: admin.id });
    console.log(`Created admin user: ${adminEmail} / ChangeMe123! (change this immediately)`);
  }

  // Payment methods
  const methods = [
    { method: 'knet', displayNameEn: 'KNET', displayNameAr: 'كي نت', isEnabled: false },
    { method: 'sadad', displayNameEn: 'Sadad', displayNameAr: 'سداد', isEnabled: false },
    { method: 'cod', displayNameEn: 'Cash on Delivery', displayNameAr: 'الدفع عند الاستلام', isEnabled: true },
  ];
  for (const m of methods) {
    await PaymentSetting.findOrCreate({ where: { method: m.method }, defaults: m });
  }

  // Sample categories (safe to edit/delete from the admin panel later)
  const [staples] = await Category.findOrCreate({
    where: { slug: 'pantry-staples' },
    defaults: { nameEn: 'Pantry Staples', nameAr: 'أساسيات المطبخ', slug: 'pantry-staples', sortOrder: 1 },
  });
  const [beverages] = await Category.findOrCreate({
    where: { slug: 'beverages' },
    defaults: { nameEn: 'Beverages', nameAr: 'مشروبات', slug: 'beverages', sortOrder: 2 },
  });
  const [snacks] = await Category.findOrCreate({
    where: { slug: 'snacks' },
    defaults: { nameEn: 'Snacks', nameAr: 'وجبات خفيفة', slug: 'snacks', sortOrder: 3 },
  });

  // Sample products covering Offers (compareAtPrice > price), Best Sellers, and New Arrivals
  const sampleProducts = [
    {
      nameEn: 'Basmati Rice 5kg',
      nameAr: 'أرز بسمتي 5 كجم',
      descriptionEn: 'Premium long-grain basmati rice.',
      descriptionAr: 'أرز بسمتي فاخر طويل الحبة.',
      price: 6.5,
      stock: 100,
      unit: 'bag',
      categoryId: staples.id,
      isBestSeller: true,
    },
    {
      nameEn: 'Extra Virgin Olive Oil 1L',
      nameAr: 'زيت زيتون بكر ممتاز 1 لتر',
      descriptionEn: 'Cold-pressed extra virgin olive oil.',
      descriptionAr: 'زيت زيتون بكر ممتاز معصور على البارد.',
      price: 4.25,
      compareAtPrice: 5.5,
      stock: 60,
      unit: 'bottle',
      categoryId: staples.id,
      isBestSeller: true,
    },
    {
      nameEn: 'Organic Honey 500g',
      nameAr: 'عسل عضوي 500 جم',
      descriptionEn: 'Pure organic honey, cold-extracted.',
      descriptionAr: 'عسل عضوي نقي مستخلص على البارد.',
      price: 5.0,
      compareAtPrice: 6.25,
      stock: 40,
      unit: 'jar',
      categoryId: staples.id,
      isFeatured: true,
    },
    {
      nameEn: 'Sparkling Water 6-Pack',
      nameAr: 'مياه غازية عبوة 6',
      descriptionEn: 'Naturally sparkling mineral water, pack of 6.',
      descriptionAr: 'مياه معدنية غازية طبيعية، عبوة من 6.',
      price: 2.75,
      stock: 80,
      unit: 'pack',
      categoryId: beverages.id,
      isNewArrival: true,
    },
    {
      nameEn: 'Arabic Coffee 250g',
      nameAr: 'قهوة عربية 250 جم',
      descriptionEn: 'Freshly roasted Arabic coffee with cardamom.',
      descriptionAr: 'قهوة عربية محمصة طازجة بالهيل.',
      price: 3.9,
      stock: 55,
      unit: 'bag',
      categoryId: beverages.id,
      isNewArrival: true,
      isBestSeller: true,
    },
    {
      nameEn: 'Mixed Nuts 400g',
      nameAr: 'مكسرات مشكلة 400 جم',
      descriptionEn: 'Roasted and lightly salted mixed nuts.',
      descriptionAr: 'مكسرات مشكلة محمصة ومملحة قليلاً.',
      price: 4.5,
      compareAtPrice: 5.75,
      stock: 70,
      unit: 'pack',
      categoryId: snacks.id,
      isFeatured: true,
    },
    {
      nameEn: 'Dark Chocolate Bar 100g',
      nameAr: 'شوكولاتة داكنة 100 جم',
      descriptionEn: '70% cocoa dark chocolate bar.',
      descriptionAr: 'شوكولاتة داكنة بنسبة 70% كاكاو.',
      price: 1.75,
      stock: 120,
      unit: 'pc',
      categoryId: snacks.id,
      isNewArrival: true,
    },
  ];
  for (const p of sampleProducts) {
    const slug = p.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    await Product.findOrCreate({ where: { slug }, defaults: { ...p, slug } });
  }

  // Sample homepage banners (edit image/links from the admin panel any time)
  const sampleBanners = [
    {
      titleEn: 'Fresh Pantry Essentials',
      titleAr: 'أساسيات المطبخ الطازجة',
      subtitleEn: 'Delivered across Kuwait in minutes',
      subtitleAr: 'توصيل لكل الكويت في دقائق',
      image: '/placeholder-banner-1.svg',
      linkUrl: '/shop',
      sortOrder: 1,
    },
    {
      titleEn: 'This Week’s Offers',
      titleAr: 'عروض هذا الأسبوع',
      subtitleEn: 'Save on selected pantry favorites',
      subtitleAr: 'وفر على أفضل المنتجات المختارة',
      image: '/placeholder-banner-2.svg',
      linkUrl: '/shop',
      sortOrder: 2,
    },
  ];
  for (const b of sampleBanners) {
    await Banner.findOrCreate({ where: { titleEn: b.titleEn }, defaults: b });
  }

  console.log('Seed complete.');
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
