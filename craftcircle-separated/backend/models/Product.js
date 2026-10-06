const { randomUUID } = require('crypto');
const store = require('../data/store');
const User = require('./User');

function create({ name, description, price, category, stock, images, sellerId }) {
  const now = new Date().toISOString();
  const product = {
    _id: randomUUID(),
    name,
    description,
    price,
    category,
    stock: stock ?? 1,
    images: images || [],
    seller: sellerId,
    isApproved: true,
    createdAt: now,
    updatedAt: now,
  };
  store.products.push(product);
  return product;
}

function findById(id) {
  return store.products.find((p) => p._id === id);
}

function findAll({ search, category, approvedOnly = true } = {}) {
  let results = store.products;

  if (approvedOnly) results = results.filter((p) => p.isApproved);
  if (category) results = results.filter((p) => p.category === category);
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }
  return [...results].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function save(product) {
  product.updatedAt = new Date().toISOString();
  return product;
}

function remove(id) {
  const idx = store.products.findIndex((p) => p._id === id);
  if (idx !== -1) store.products.splice(idx, 1);
}

function withSellerInfo(product) {
  if (!product) return null;
  const seller = User.findById(product.seller);
  return {
    ...product,
    seller: seller ? { _id: seller._id, name: seller.name, avatarUrl: seller.avatarUrl } : null,
  };
}

module.exports = { create, findById, findAll, save, remove, withSellerInfo };
