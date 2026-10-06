const jwt = require('jsonwebtoken');

// Prototype fallback secret so the app runs with zero setup (no .env needed).
// Replace JWT_SECRET in a real .env before using this anywhere but locally.
const SECRET = process.env.JWT_SECRET || 'craftcircle-prototype-dev-secret';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = { generateToken, SECRET };
