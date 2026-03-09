const express = require('express');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Resource = require('../models/Resource');
const PeerSupport = require('../models/PeerSupport');
const ChatSession = require('../models/ChatSession');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard analytics
// @access  Private (Admin only)
router.get('/dashboard', [auth, authorize('admin')], async (req, res) => {
  try {

    const { period = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // User statistics
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({ createdAt: { $gte: startDate } });
    const activeUsers = await User.countDocuments({ isActive: true });
    const students = await User.countDocuments({ role: 'student' });
    const counselors = await User.countDocuments({ role: 'counselor' });

    // Appointment statistics
    const totalAppointments = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const pendingAppointments = await Appointment.countDocuments({ status: 'scheduled' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });

    // Resource statistics
    const totalResources = await Resource.countDocuments();
    const publishedResources = await Resource.countDocuments({ isPublished: true });
    const pendingResources = await Resource.countDocuments({ isApproved: false });

    // Peer support statistics
    const totalPosts = await PeerSupport.countDocuments();
    const approvedPosts = await PeerSupport.countDocuments({ status: 'approved' });
    const pendingPosts = await PeerSupport.countDocuments({ status: 'pending' });

    // Chat session statistics
    const totalChatSessions = await ChatSession.countDocuments();
    const escalatedSessions = await ChatSession.countDocuments({ status: 'escalated' });

    // Mental health trends
    const mentalHealthStats = await User.aggregate([
      {
        $group: {
          _id: '$mentalHealthProfile.riskLevel',
          count: { $sum: 1 }
        }
      }
    ]);

    // Appointment trends by month
    const appointmentTrends = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Top concerns
    const topConcerns = await Appointment.aggregate([
      {
        $unwind: '$concerns'
      },
      {
        $group: {
          _id: '$concerns',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Counselor performance
    const counselorPerformance = await Appointment.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $group: {
          _id: '$counselor',
          totalAppointments: { $sum: 1 },
          averageRating: { $avg: '$feedback.rating' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'counselorInfo'
        }
      },
      {
        $unwind: '$counselorInfo'
      },
      {
        $project: {
          counselorName: { $concat: ['$counselorInfo.firstName', ' ', '$counselorInfo.lastName'] },
          totalAppointments: 1,
          averageRating: { $round: ['$averageRating', 2] }
        }
      },
      {
        $sort: { averageRating: -1 }
      }
    ]);

    res.json({
      period,
      dateRange: { startDate, endDate: now },
      users: {
        total: totalUsers,
        new: newUsers,
        active: activeUsers,
        students,
        counselors
      },
      appointments: {
        total: totalAppointments,
        completed: completedAppointments,
        pending: pendingAppointments,
        cancelled: cancelledAppointments
      },
      resources: {
        total: totalResources,
        published: publishedResources,
        pending: pendingResources
      },
      peerSupport: {
        total: totalPosts,
        approved: approvedPosts,
        pending: pendingPosts
      },
      chatSessions: {
        total: totalChatSessions,
        escalated: escalatedSessions
      },
      mentalHealthStats,
      appointmentTrends,
      topConcerns,
      counselorPerformance
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Private (Admin only)
router.get('/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { page = 1, limit = 20, role, search } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status
// @access  Private (Admin only)
router.put('/users/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;
    const { isActive, isVerified } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (isActive !== undefined) user.isActive = isActive;
    if (isVerified !== undefined) user.isVerified = isVerified;

    await user.save();

    res.json({
      message: 'User status updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
});

// @route   GET /api/admin/pending-content
// @desc    Get pending content for moderation
// @access  Private (Admin only)
router.get('/pending-content', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const pendingResources = await Resource.find({ isApproved: false })
      .populate('author', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10);

    const pendingPosts = await PeerSupport.find({ status: 'pending' })
      .populate('author', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      pendingResources,
      pendingPosts
    });
  } catch (error) {
    console.error('Get pending content error:', error);
    res.status(500).json({ message: 'Failed to fetch pending content' });
  }
});

module.exports = router;
