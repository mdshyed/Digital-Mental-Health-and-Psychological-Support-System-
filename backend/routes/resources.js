const express = require('express');
const { body, validationResult } = require('express-validator');
const Resource = require('../models/Resource');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/resources
// @desc    Get all published resources
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      type, 
      language = 'en', 
      difficulty, 
      page = 1, 
      limit = 12,
      search 
    } = req.query;

    const query = { 
      isPublished: true, 
      isApproved: true 
    };

    if (category) query.category = category;
    if (type) query.type = type;
    if (language) query.language = language;
    if (difficulty) query.difficulty = difficulty;

    if (search) {
      query.$text = { $search: search };
    }

    const resources = await Resource.find(query)
      .populate('author', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Resource.countDocuments(query);

    res.json({
      resources,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ message: 'Failed to fetch resources' });
  }
});

// @route   GET /api/resources/:id
// @desc    Get specific resource
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('author', 'firstName lastName');

    if (!resource || !resource.isPublished) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Increment view count
    resource.views += 1;
    await resource.save();

    res.json({ resource });
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({ message: 'Failed to fetch resource' });
  }
});

// @route   POST /api/resources
// @desc    Create new resource (Admin/Counselor only)
// @access  Private
router.post('/', auth, [
  body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('description').trim().isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
  body('type').isIn(['video', 'audio', 'article', 'guide', 'worksheet', 'infographic', 'podcast']).withMessage('Invalid type'),
  body('category').isIn(['anxiety', 'depression', 'stress', 'sleep', 'relationships', 'academic', 'career', 'mindfulness', 'self-care', 'crisis-support']).withMessage('Invalid category')
], async (req, res) => {
  try {
    if (!['admin', 'counselor'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const resourceData = {
      ...req.body,
      author: req.user.id,
      isApproved: req.user.role === 'admin',
      isPublished: req.user.role === 'admin'
    };

    if (req.user.role === 'admin') {
      resourceData.approvedBy = req.user.id;
      resourceData.approvedAt = new Date();
      resourceData.publishedAt = new Date();
    }

    const resource = new Resource(resourceData);
    await resource.save();

    res.status(201).json({
      message: 'Resource created successfully',
      resource
    });
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({ message: 'Failed to create resource' });
  }
});

// @route   POST /api/resources/:id/review
// @desc    Submit review for resource
// @access  Private
router.post('/:id/review', auth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, comment } = req.body;
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check if user already reviewed
    const existingReview = resource.reviews.find(
      review => review.user.toString() === req.user.id
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this resource' });
    }

    const review = {
      user: req.user.id,
      rating,
      comment,
      anonymous: true
    };

    resource.reviews.push(review);

    // Update average rating
    const totalRating = resource.reviews.reduce((sum, review) => sum + review.rating, 0);
    resource.rating.average = totalRating / resource.reviews.length;
    resource.rating.count = resource.reviews.length;

    await resource.save();

    res.json({ message: 'Review submitted successfully' });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ message: 'Failed to submit review' });
  }
});

// @route   GET /api/resources/categories
// @desc    Get resource categories
// @access  Public
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Resource.distinct('category', { isPublished: true });
    const types = await Resource.distinct('type', { isPublished: true });
    const languages = await Resource.distinct('language', { isPublished: true });

    res.json({
      categories,
      types,
      languages
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

module.exports = router;
