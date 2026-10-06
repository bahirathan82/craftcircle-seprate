const { randomUUID } = require('crypto');
const store = require('../data/store');
const User = require('./User');

function create({ title, description, steps, category, difficulty, images, authorId }) {
  const now = new Date().toISOString();
  const tutorial = {
    _id: randomUUID(),
    title,
    description,
    steps: steps || [],
    category,
    difficulty: difficulty || 'Beginner',
    images: images || [],
    author: authorId,
    likes: [], // array of user ids
    comments: [], // { _id, user, text, createdAt }
    createdAt: now,
    updatedAt: now,
  };
  store.tutorials.push(tutorial);
  return tutorial;
}

function findById(id) {
  return store.tutorials.find((t) => t._id === id);
}

function findAll({ search, category } = {}) {
  let results = store.tutorials;

  if (category) {
    results = results.filter((t) => t.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }
  return [...results].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function save(tutorial) {
  tutorial.updatedAt = new Date().toISOString();
  return tutorial;
}

function remove(id) {
  const idx = store.tutorials.findIndex((t) => t._id === id);
  if (idx !== -1) store.tutorials.splice(idx, 1);
}

// Attaches { name, avatarUrl } author info and resolves comment authors,
// mimicking the fields a Mongoose .populate() call would have provided.
function withAuthorInfo(tutorial) {
  if (!tutorial) return null;
  const author = User.findById(tutorial.author);
  return {
    ...tutorial,
    author: author ? { _id: author._id, name: author.name, avatarUrl: author.avatarUrl } : null,
    comments: tutorial.comments.map((c) => {
      const commenter = User.findById(c.user);
      return {
        ...c,
        user: commenter ? { _id: commenter._id, name: commenter.name, avatarUrl: commenter.avatarUrl } : null,
      };
    }),
  };
}

module.exports = { create, findById, findAll, save, remove, withAuthorInfo };
