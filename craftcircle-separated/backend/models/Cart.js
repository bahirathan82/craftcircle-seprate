const { randomUUID } = require('crypto');
const store = require('../data/store');
const Product = require('./Product');

function getOrCreate(userId) {
  let cart = store.carts.find((c) => c.user === userId);
  if (!cart) {
    cart = { _id: randomUUID(), user: userId, items: [] }; // items: [{ product, quantity }]
    store.carts.push(cart);
  }
  return cart;
}

function save(cart) {
  return cart;
}

// Resolves each item's product id into the full product object,
// mimicking a Mongoose .populate('items.product') call.
function withProductInfo(cart) {
  return {
    ...cart,
    items: cart.items
      .map((item) => ({ product: Product.findById(item.product), quantity: item.quantity }))
      .filter((item) => item.product), // drop items whose product was deleted
  };
}

module.exports = { getOrCreate, save, withProductInfo };
