const { randomUUID } = require('crypto');
const Tutorial = require('../models/Tutorial');

// @route  GET /api/tutorials?search=&category=&page=&limit=
const getTutorials = async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 12 } = req.query;
    const all = Tutorial.findAll({ search, category });

    const start = (page - 1) * limit;
    const pageItems = all.slice(start, start + Number(limit)).map(Tutorial.withAuthorInfo);

    res.json({
      tutorials: pageItems,
      total: all.length,
      page: Number(page),
      pages: Math.ceil(all.length / limit),
    });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/tutorials/:id
const getTutorialById = async (req, res, next) => {
  try {
    const tutorial = Tutorial.findById(req.params.id);
    if (!tutorial) return res.status(404).json({ message: 'Tutorial not found' });
    res.json(Tutorial.withAuthorInfo(tutorial));
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/tutorials
const createTutorial = async (req, res, next) => {
  try {
    const { title, description, steps, category, difficulty, images } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description and category are required' });
    }

    const tutorial = Tutorial.create({
      title,
      description,
      steps: steps || [],
      category,
      difficulty,
      images: images || [],
      authorId: req.user._id,
    });

    res.status(201).json(Tutorial.withAuthorInfo(tutorial));
  } catch (err) {
    next(err);
  }
};

// @route  PUT /api/tutorials/:id
const updateTutorial = async (req, res, next) => {
  try {
    const tutorial = Tutorial.findById(req.params.id);
    if (!tutorial) return res.status(404).json({ message: 'Tutorial not found' });

    const isOwner = tutorial.author === req.user._id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this tutorial' });
    }

    Object.assign(tutorial, req.body, { author: tutorial.author }); // don't allow author overwrite
    Tutorial.save(tutorial);
    res.json(Tutorial.withAuthorInfo(tutorial));
  } catch (err) {
    next(err);
  }
};

// @route  DELETE /api/tutorials/:id
const deleteTutorial = async (req, res, next) => {
  try {
    const tutorial = Tutorial.findById(req.params.id);
    if (!tutorial) return res.status(404).json({ message: 'Tutorial not found' });

    const isOwner = tutorial.author === req.user._id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this tutorial' });
    }

    Tutorial.remove(tutorial._id);
    res.json({ message: 'Tutorial deleted' });
  } catch (err) {
    next(err);
  }
};

// @route  PUT /api/tutorials/:id/like
const toggleLike = async (req, res, next) => {
  try {
    const tutorial = Tutorial.findById(req.params.id);
    if (!tutorial) return res.status(404).json({ message: 'Tutorial not found' });

    const userId = req.user._id;
    const alreadyLiked = tutorial.likes.includes(userId);

    if (alreadyLiked) {
      tutorial.likes = tutorial.likes.filter((id) => id !== userId);
    } else {
      tutorial.likes.push(userId);
    }
    Tutorial.save(tutorial);

    res.json({ likesCount: tutorial.likes.length, liked: !alreadyLiked });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/tutorials/:id/comments
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const tutorial = Tutorial.findById(req.params.id);
    if (!tutorial) return res.status(404).json({ message: 'Tutorial not found' });

    const comment = { _id: randomUUID(), user: req.user._id, text, createdAt: new Date().toISOString() };
    tutorial.comments.push(comment);
    Tutorial.save(tutorial);

    res.status(201).json({ ...comment, user: { _id: req.user._id, name: req.user.name } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTutorials,
  getTutorialById,
  createTutorial,
  updateTutorial,
  deleteTutorial,
  toggleLike,
  addComment,
};
