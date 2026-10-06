const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @route  GET /api/cart
const getCart = async (req, res, next) => {
  try {
    const cart = Cart.getOrCreate(req.user._id);
    res.json(Cart.withProductInfo(cart));
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/cart  { productId, quantity }
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }

    const cart = Cart.getOrCreate(req.user._id);
    const existingItem = cart.items.find((item) => item.product === productId);

    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      cart.items.push({ product: productId, quantity: Number(quantity) });
    }

    Cart.save(cart);
    res.status(201).json(Cart.withProductInfo(cart));
  } catch (err) {
    next(err);
  }
};

// @route  PUT /api/cart/:productId  { quantity }
const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = Cart.getOrCreate(req.user._id);

    const item = cart.items.find((i) => i.product === req.params.productId);
    if (!item) return res.status(404).json({ message: 'Item not in cart' });

    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.product !== req.params.productId);
    } else {
      item.quantity = Number(quantity);
    }

    Cart.save(cart);
    res.json(Cart.withProductInfo(cart));
  } catch (err) {
    next(err);
  }
};

// @route  DELETE /api/cart/:productId
const removeCartItem = async (req, res, next) => {
  try {
    const cart = Cart.getOrCreate(req.user._id);
    cart.items = cart.items.filter((i) => i.product !== req.params.productId);
    Cart.save(cart);
    res.json(Cart.withProductInfo(cart));
  } catch (err) {
    next(err);
  }
};

// @route  DELETE /api/cart
const clearCart = async (req, res, next) => {
  try {
    const cart = Cart.getOrCreate(req.user._id);
    cart.items = [];
    Cart.save(cart);
    res.json(Cart.withProductInfo(cart));
  } catch (err) {
    next(err);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
