const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @route  POST /api/orders  { shippingAddress }
// Checks out the current cart into an order
const createOrder = async (req, res, next) => {
  try {
    const cart = Cart.getOrCreate(req.user._id);
    const populatedCart = Cart.withProductInfo(cart);

    if (!populatedCart.items.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of populatedCart.items) {
      const product = item.product;
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });
      totalAmount += product.price * item.quantity;

      product.stock -= item.quantity;
      Product.save(product);
    }

    const order = Order.create({
      userId: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress: req.body.shippingAddress,
    });

    cart.items = [];
    Cart.save(cart);

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/orders  (current user's own orders)
const getMyOrders = async (req, res, next) => {
  try {
    res.json(Order.findByUser(req.user._id));
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/orders/:id
const getOrderById = async (req, res, next) => {
  try {
    const order = Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isOwner = order.user === req.user._id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(Order.withUserInfo(order));
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getMyOrders, getOrderById };
