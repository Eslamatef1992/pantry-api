require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');
const { User, Category, Product, Cart, PaymentSetting } = require('../models');

const run = async () => {
  await sequelize.sync({ force: false });

  // Admin user
  const adminEmail = 'admin@makanifoods.com';
  const existingAdmin = await User.findOne({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash('ChangeMe123!', 10);
    const admin = await User.create({
      name: 'Makani Foods Admin',
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

  // Sample category + products (safe to delete from the admin panel later)
  const [category] = await Category.findOrCreate({
    where: { slug: 'pantry-staples' },
    defaults: { nameEn: 'Pantry Staples', nameAr: 'أساسيات المطبخ', slug: 'pantry-staples', sortOrder: 1 },
  });

  const sampleProducts = [
    {
      nameEn: 'Basmati Rice 5kg',
      nameAr: 'أرز بسمتي 5 كجم',
      descriptionEn: 'Premium long-grain basmati rice.',
      descriptionAr: 'أرز بسمتي فاخر طويل الحبة.',
      price: 6.5,
      stock: 100,
      unit: 'bag',
      categoryId: category.id,
    },
    {
      nameEn: 'Extra Virgin Olive Oil 1L',
      nameAr: 'زيت زيتون بكر ممتاز 1 لتر',
      descriptionEn: 'Cold-pressed extra virgin olive oil.',
      descriptionAr: 'زيت زيتون بكر ممتاز معصور على البارد.',
      price: 4.25,
      stock: 60,
      unit: 'bottle',
      categoryId: category.id,
    },
  ];
  for (const p of sampleProducts) {
    const slug = p.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    await Product.findOrCreate({ where: { slug }, defaults: { ...p, slug } });
  }

  console.log('Seed complete.');
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
