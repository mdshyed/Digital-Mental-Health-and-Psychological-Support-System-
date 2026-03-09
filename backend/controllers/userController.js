const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get all users (admin only)
// @route   GET /api/users
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { role, isActive, isVerified, sort = '-createdAt', page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (typeof isActive === 'boolean') query.isActive = isActive;
    if (typeof isVerified === 'boolean') query.isVerified = isVerified;

    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
exports.updateUserProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const allowedUpdates = [
      'firstName', 'lastName', 'phone', 'dateOfBirth',
      'gender', 'department', 'year', 'emergencyContact',
      'preferences', 'profilePicture'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Special handling for preferences
    if (updates.preferences) {
      user.preferences = {
        ...user.preferences,
        ...updates.preferences
      };
      delete updates.preferences;
    }

    // Update other fields
    Object.assign(user, updates);
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// @desc    Get all counselors
// @route   GET /api/users/counselors
exports.getCounselors = async (req, res) => {
  try {
    const { department, available } = req.query;
    let query = { 
      role: 'counselor',
      isActive: true,
      isVerified: true 
    };

    if (department) {
      query.department = department;
    }

    const counselors = await User.find(query)
      .select('firstName lastName email department profilePicture')
      .sort('firstName lastName');

    res.json(counselors);
  } catch (error) {
    console.error('Get counselors error:', error);
    res.status(500).json({ message: 'Failed to fetch counselors' });
  }
};

// @desc    Get counselor availability
// @route   GET /api/users/counselors/:id/availability
exports.getCounselorAvailability = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const counselor = await User.findOne({ 
      _id: req.params.id,
      role: 'counselor',
      isActive: true,
      isVerified: true
    });

    if (!counselor) {
      return res.status(404).json({ message: 'Counselor not found' });
    }

    // Get booked appointments
    const appointments = await Appointment.find({
      counselor: counselor._id,
      appointmentDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      status: { $nin: ['cancelled', 'no-show'] }
    }).select('appointmentDate duration');

    // Generate available slots
    const availableSlots = generateAvailableSlots(startDate, endDate, appointments);

    res.json(availableSlots);
  } catch (error) {
    console.error('Get counselor availability error:', error);
    res.status(500).json({ message: 'Failed to fetch counselor availability' });
  }
};