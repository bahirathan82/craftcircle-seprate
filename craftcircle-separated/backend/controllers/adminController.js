const User = require('../models/User');
const Tutorial = require('../models/Tutorial');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @route  GET /api/admin/stats
const getDashboardStats = async (req, res, next) => {
  try {
    res.json({
      userCount: User.findAll().length,
      tutorialCount: Tutorial.findAll().length,
      productCount: Product.findAll({ approvedOnly: false }).length,
      orderCount: Order.findAll().length,
    });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/admin/users
const getAllUsers = async (req, res, next) => {
  try {
    res.json(User.findAll().map(User.toPublic));
  } catch (err) {
    next(err);
  }
};

// @route  PUT /api/admin/users/:id/status  { isActive }
const setUserStatus = async (req, res, next) => {
  try {
    const user = User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isActive = req.body.isActive;
    User.save(user);
    res.json({ _id: user._id, isActive: user.isActive });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/admin/orders  (all orders, any user)
const getAllOrders = async (req, res, next) => {
  try {
    res.json(Order.findAll().map(Order.withUserInfo));
  } catch (err) {
    next(err);
  }
};

// @route  PUT /api/admin/orders/:id/status  { status }
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    Order.save(order);
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// @route  PUT /api/admin/products/:id/approval  { isApproved }
const setProductApproval = async (req, res, next) => {
  try {
    const product = Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.isApproved = req.body.isApproved;
    Product.save(product);
    res.json({ _id: product._id, isApproved: product.isApproved });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  setUserStatus,
  getAllOrders,
  updateOrderStatus,
  setProductApproval,
};
