const express = require('express');
const { body, validationResult } = require('express-validator');
const PeerSupport = require('../models/PeerSupport');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/peer-support
// @desc    Get peer support posts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      language = 'en', 
      page = 1, 
      limit = 10,
      sortBy = 'recent' 
    } = req.query;

    const query = { 
      status: 'approved',
      visibility: { $in: ['public', 'community'] }
    };

    if (category) query.category = category;
    if (language) query.language = language;

    let sort = {};
    switch (sortBy) {
      case 'popular':
        sort = { 'engagement.likes': -1 };
        break;
      case 'recent':
      default:
        sort = { createdAt: -1 };
        break;
    }

    const posts = await PeerSupport.find(query)
      .populate('author', 'firstName lastName')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PeerSupport.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get peer support posts error:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

// @route   POST /api/peer-support
// @desc    Create new peer support post
// @access  Private
router.post('/', auth, [
  body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('content').trim().isLength({ min: 20 }).withMessage('Content must be at least 20 characters'),
  body('category').isIn(['anxiety', 'depression', 'stress', 'academic-pressure', 'relationships', 'family', 'career', 'self-esteem', 'sleep', 'eating', 'addiction', 'grief', 'trauma', 'general-support', 'success-story', 'tips']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, category, tags = [], isAnonymous = true, visibility = 'community' } = req.body;

    const post = new PeerSupport({
      title,
      content,
      category,
      tags,
      author: req.user.id,
      isAnonymous,
      visibility,
      language: req.user.preferences?.language || 'en'
    });

    await post.save();

    res.status(201).json({
      message: 'Post created successfully and is pending moderation',
      post: {
        id: post._id,
        title: post.title,
        category: post.category,
        status: post.status,
        createdAt: post.createdAt
      }
    });
  } catch (error) {
    console.error('Create peer support post error:', error);
    res.status(500).json({ message: 'Failed to create post' });
  }
});

// @route   GET /api/peer-support/:id
// @desc    Get specific peer support post
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const post = await PeerSupport.findById(req.params.id)
      .populate('author', 'firstName lastName')
      .populate('comments.author', 'firstName lastName');

    if (!post || post.status !== 'approved') {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count
    post.engagement.views += 1;
    await post.save();

    res.json({ post });
  } catch (error) {
    console.error('Get peer support post error:', error);
    res.status(500).json({ message: 'Failed to fetch post' });
  }
});

// @route   POST /api/peer-support/:id/comment
// @desc    Add comment to peer support post
// @access  Private
router.post('/:id/comment', auth, [
  body('content').trim().isLength({ min: 5 }).withMessage('Comment must be at least 5 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, isAnonymous = true } = req.body;
    const post = await PeerSupport.findById(req.params.id);

    if (!post || post.status !== 'approved') {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      author: req.user.id,
      content,
      isAnonymous
    };

    post.comments.push(comment);
    post.engagement.comments += 1;
    await post.save();

    res.json({
      message: 'Comment added successfully',
      comment: {
        id: comment._id,
        content: comment.content,
        isAnonymous: comment.isAnonymous,
        createdAt: comment.createdAt
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Failed to add comment' });
  }
});

// @route   POST /api/peer-support/:id/like
// @desc    Like/unlike peer support post
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await PeerSupport.findById(req.params.id);

    if (!post || post.status !== 'approved') {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Simple like implementation (in production, you'd want to track individual likes)
    post.engagement.likes += 1;
    await post.save();

    res.json({
      message: 'Post liked successfully',
      likes: post.engagement.likes
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Failed to like post' });
  }
});

module.exports = router;
