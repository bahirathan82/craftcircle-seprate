// Populates the in-memory store with demo data so the prototype isn't empty
// on first load. Runs once at server startup.

const User = require('../models/User');
const Tutorial = require('../models/Tutorial');
const Product = require('../models/Product');

async function seed() {
  const admin = await User.create({ name: 'Admin', email: 'admin@craftcircle.test', password: 'admin123' });
  admin.role = 'admin';
  User.save(admin);

  const maya = await User.create({ name: 'Maya Fields', email: 'maya@craftcircle.test', password: 'password123' });
  const sam = await User.create({ name: 'Sam Rivera', email: 'sam@craftcircle.test', password: 'password123' });

  Tutorial.create({
    title: 'Hand-Knit Chunky Scarf',
    description: 'A beginner-friendly chunky knit scarf using just two needles and a simple garter stitch.',
    steps: [
      'Cast on 20 stitches using chunky yarn.',
      'Knit every row (garter stitch) until the scarf reaches 60 inches.',
      'Bind off and weave in the loose ends.',
    ],
    category: 'Knitting',
    difficulty: 'Beginner',
    authorId: maya._id,
  });

  Tutorial.create({
    title: 'Simple Wooden Plant Stand',
    description: 'Build a minimalist wooden plant stand with basic tools — perfect for a first woodworking project.',
    steps: [
      'Cut four legs to equal length and sand the edges.',
      'Attach the legs to a square top piece with wood glue and screws.',
      'Finish with wood stain or oil.',
    ],
    category: 'Woodwork',
    difficulty: 'Intermediate',
    authorId: sam._id,
  });

  Product.create({
    name: 'Chunky Knit Scarf — Oat',
    description: 'Hand-knit from soft chunky wool in a warm oat color. One size fits all.',
    price: 38,
    category: 'Knitting',
    stock: 5,
    sellerId: maya._id,
  });

  Product.create({
    name: 'Handmade Walnut Plant Stand',
    description: 'Solid walnut plant stand, oil-finished, holds pots up to 10 inches.',
    price: 64,
    category: 'Woodwork',
    stock: 3,
    sellerId: sam._id,
  });

  console.log('Demo data seeded.');
  console.log('  Admin login -> admin@craftcircle.test / admin123');
  console.log('  User login  -> maya@craftcircle.test / password123');
}

module.exports = seed;
