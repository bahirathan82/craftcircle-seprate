require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const seed = require('./data/seed');

const authRoutes = require('./routes/authRoutes');
const tutorialRoutes = require('./routes/tutorialRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(cors()); // allows the separately-hosted frontend to call this API
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'CraftCircle API is running', docs: '/api/*' });
});

// Module routes
app.use('/api/auth', authRoutes);         // User Management
app.use('/api/tutorials', tutorialRoutes); // DIY Tutorial Management
app.use('/api/products', productRoutes);   // Marketplace
app.use('/api/cart', cartRoutes);          // Shopping Cart
app.use('/api/orders', orderRoutes);       // Order Management
app.use('/api/admin', adminRoutes);        // Admin Panel

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

seed()
  .catch((err) => console.error('Seeding failed:', err))
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`CraftCircle API running at http://localhost:${PORT}`);
      console.log('Data is in-memory only — it resets whenever the server restarts.');
    });
  });
