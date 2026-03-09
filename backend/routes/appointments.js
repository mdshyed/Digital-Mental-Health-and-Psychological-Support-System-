const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const {
  bookAppointment,
  getMyAppointments,
  getCounselorAppointments,
  updateAppointmentStatus,
  getAvailableSlots,
  getCounselors,
  getAppointmentById
} = require('../controllers/appointmentController');

const router = express.Router();

// @route   POST /api/appointments/book
// @desc    Book a new appointment
// @access  Private
router.post('/book', auth, [
  body('counselorId').isMongoId().withMessage('Valid counselor ID is required'),
  body('appointmentDate').isISO8601().withMessage('Valid appointment date is required'),
  body('appointmentTime').notEmpty().withMessage('Appointment time is required'),
  body('reason').trim().isLength({ min: 10 }).withMessage('Reason must be at least 10 characters'),
  body('mode').optional().isIn(['in-person', 'online', 'phone']).withMessage('Invalid mode')
], bookAppointment);

// @route   GET /api/appointments/my-appointments
// @desc    Get user's appointments
// @access  Private
router.get('/my-appointments', auth, getMyAppointments);

// @route   GET /api/appointments/counselor-appointments
// @desc    Get counselor's appointments
// @access  Private (Counselors only)
router.get('/counselor-appointments', [auth, authorize('counselor')], getCounselorAppointments);

// @route   PUT /api/appointments/:id/status
// @desc    Update appointment status
// @access  Private
router.put('/:id/status', auth, [
  body('status').isIn(['scheduled', 'completed', 'cancelled', 'missed']).withMessage('Invalid status')
], updateAppointmentStatus);

// @route   GET /api/appointments/available-slots/:counselorId
// @desc    Get available slots for a counselor
// @access  Private
router.get('/available-slots/:counselorId', auth, getAvailableSlots);

// @route   GET /api/appointments/counselors
// @desc    Get all counselors
// @access  Private
router.get('/counselors', auth, getCounselors);

// @route   GET /api/appointments/:id
// @desc    Get appointment by ID
// @access  Private
router.get('/:id', auth, getAppointmentById);

module.exports = router;