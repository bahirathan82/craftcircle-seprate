const { randomUUID } = require('crypto');
const store = require('../data/store');
const User = require('./User');

function create({ userId, items, totalAmount, shippingAddress }) {
  const now = new Date().toISOString();
  const order = {
    _id: randomUUID(),
    user: userId,
    items, // [{ product, name, price, quantity }]
    totalAmount,
    status: 'Pending',
    shippingAddress: shippingAddress || {},
    createdAt: now,
    updatedAt: now,
  };
  store.orders.push(order);
  return order;
}

function findById(id) {
  return store.orders.find((o) => o._id === id);
}

function findByUser(userId) {
  return [...store.orders]
    .filter((o) => o.user === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function findAll() {
  return [...store.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function save(order) {
  order.updatedAt = new Date().toISOString();
  return order;
}

function withUserInfo(order) {
  if (!order) return null;
  const user = User.findById(order.user);
  return { ...order, user: user ? { _id: user._id, name: user.name, email: user.email } : null };
}

module.exports = { create, findById, findByUser, findAll, save, withUserInfo };
