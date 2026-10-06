const { randomUUID } = require('crypto');
const bcrypt = require('bcryptjs');
const store = require('../data/store');

async function create({ name, email, password }) {
  const now = new Date().toISOString();
  const user = {
    _id: randomUUID(),
    name,
    email: email.toLowerCase().trim(),
    password: await bcrypt.hash(password, 10),
    role: 'user',
    bio: '',
    avatarUrl: '',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
  store.users.push(user);
  return user;
}

function findByEmail(email) {
  return store.users.find((u) => u.email === email.toLowerCase().trim());
}

function findById(id) {
  return store.users.find((u) => u._id === id);
}

function findAll() {
  return store.users;
}

async function comparePassword(user, candidatePassword) {
  return bcrypt.compare(candidatePassword, user.password);
}

function save(user) {
  user.updatedAt = new Date().toISOString();
  return user;
}

// Strip the password hash before sending a user object to the client
function toPublic(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

module.exports = { create, findByEmail, findById, findAll, comparePassword, save, toPublic };
