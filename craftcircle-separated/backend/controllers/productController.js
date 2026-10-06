const Product = require('../models/Product');

// @route  GET /api/products?search=&category=&page=&limit=
const getProducts = async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 12 } = req.query;
    const all = Product.findAll({ search, category, approvedOnly: true });

    const start = (page - 1) * limit;
    const pageItems = all.slice(start, start + Number(limit)).map(Product.withSellerInfo);

    res.json({
      products: pageItems,
      total: all.length,
      page: Number(page),
      pages: Math.ceil(all.length / limit),
    });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const product = Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(Product.withSellerInfo(product));
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, stock, images } = req.body;

    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({ message: 'Name, description, price and category are required' });
    }

    const product = Product.create({
      name,
      description,
      price: Number(price),
      category,
      stock: stock !== undefined ? Number(stock) : 1,
      images: images || [],
      sellerId: req.user._id,
    });

    res.status(201).json(Product.withSellerInfo(product));
  } catch (err) {
    next(err);
  }
};

// @route  PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const product = Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const isOwner = product.seller === req.user._id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this product' });
    }

    Object.assign(product, req.body, { seller: product.seller });
    Product.save(product);
    res.json(Product.withSellerInfo(product));
  } catch (err) {
    next(err);
  }
};

// @route  DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const product = Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const isOwner = product.seller === req.user._id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    Product.remove(product._id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
