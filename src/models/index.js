const sequelize = require('../config/db');
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Address = require('./Address');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const PaymentSetting = require('./PaymentSetting');

// Category <-> Product
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// User <-> Cart
User.hasOne(Cart, { foreignKey: 'userId', as: 'cart' });
Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Cart <-> CartItem <-> Product
Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items', onDelete: 'CASCADE' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId', as: 'cart' });
CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// User <-> Address
User.hasMany(Address, { foreignKey: 'userId', as: 'addresses' });
Address.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> Order
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Order.belongsTo(Address, { foreignKey: 'addressId', as: 'address' });

// Order <-> OrderItem <-> Product
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  Cart,
  CartItem,
  Address,
  Order,
  OrderItem,
  PaymentSetting,
};
