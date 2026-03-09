const Resource = require('../models/Resource');

// @desc    Get all resources
// @route   GET /api/resources
exports.getAllResources = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { isApproved: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const resources = await Resource.find(query)
      .populate('author', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(resources);
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ message: 'Failed to fetch resources' });
  }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
exports.getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('author', 'firstName lastName');
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (!resource.isApproved && resource.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Resource not approved yet' });
    }

    res.json(resource);
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({ message: 'Failed to fetch resource' });
  }
};

// @desc    Create new resource
// @route   POST /api/resources
exports.createResource = async (req, res) => {
  try {
    const { title, description, content, category, tags } = req.body;

    const resource = new Resource({
      title,
      description,
      content,
      category,
      tags,
      author: req.user.id,
      isApproved: req.user.role === 'admin' || req.user.role === 'counselor'
    });

    await resource.save();

    res.status(201).json({
      message: resource.isApproved ? 'Resource created successfully' : 'Resource submitted for approval',
      resource
    });
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({ message: 'Failed to create resource' });
  }
};

// @desc    Update resource
// @route   PUT /api/resources/:id
exports.updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this resource' });
    }

    const allowedUpdates = ['title', 'description', 'content', 'category', 'tags'];
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        resource[key] = req.body[key];
      }
    });

    // Reset approval status if content is modified by non-admin
    if (req.user.role !== 'admin') {
      resource.isApproved = false;
    }

    await resource.save();

    res.json({
      message: 'Resource updated successfully',
      resource
    });
  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({ message: 'Failed to update resource' });
  }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this resource' });
    }

    await resource.remove();

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({ message: 'Failed to delete resource' });
  }
};

// @desc    Get resource categories
// @route   GET /api/resources/meta/categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Resource.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};