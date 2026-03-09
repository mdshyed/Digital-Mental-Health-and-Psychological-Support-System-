const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Book a new appointment
// @route   POST /api/appointments/book
exports.bookAppointment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      counselorId, 
      appointmentDate,
      appointmentTime,
      duration = 60,
      type = 'individual',
      mode = 'in-person',
      reason,
      concerns = []
    } = req.body;

    // Validate counselor exists
    const counselor = await User.findOne({ 
      _id: counselorId, 
      role: 'counselor',
      isActive: true,
      isVerified: true
    });

    if (!counselor) {
      return res.status(404).json({ message: 'Counselor not found or unavailable' });
    }

    // Check for appointment conflicts
    const hasConflict = await checkAppointmentConflict(counselorId, appointmentDate, duration);
    if (hasConflict) {
      return res.status(400).json({ message: 'Selected time slot is not available' });
    }

    const appointment = new Appointment({
      student: req.user.id,
      counselor: counselorId,
      appointmentDate,
      appointmentTime,
      duration,
      type,
      mode,
      reason,
      concerns,
      status: 'scheduled',
      location: mode === 'in-person' ? counselor.department : undefined,
      reminders: [
        { type: 'email', sent: false },
        { type: 'push', sent: false }
      ]
    });

    await appointment.save();

    // Populate appointment details for response
    await appointment.populate([
      { path: 'student', select: 'firstName lastName email' },
      { path: 'counselor', select: 'firstName lastName email department' }
    ]);

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ message: 'Failed to book appointment' });
  }
};

// Utility function to check for appointment conflicts
const checkAppointmentConflict = async (counselorId, appointmentDate, duration) => {
  const startTime = new Date(appointmentDate);
  const endTime = new Date(startTime.getTime() + duration * 60000);

  const existingAppointment = await Appointment.findOne({
    counselor: counselorId,
    status: { $nin: ['cancelled', 'no-show'] },
    $or: [
      {
        appointmentDate: {
          $gte: startTime,
          $lt: endTime
        }
      },
      {
        $and: [
          { appointmentDate: { $lte: startTime } },
          {
            $expr: {
              $gt: [
                { $add: ['$appointmentDate', { $multiply: ['$duration', 60000] }] },
                startTime.getTime()
              ]
            }
          }
        ]
      }
    ]
  });

  return existingAppointment;
};

// @desc    Get user's appointments
// @route   GET /api/appointments/my-appointments
exports.getMyAppointments = async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;
    
    let query = req.user.role === 'counselor' 
      ? { counselor: req.user.id }
      : { student: req.user.id };

    if (status) {
      query.status = status;
    }

    if (startDate && endDate) {
      query.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const appointments = await Appointment.find(query)
      .populate('student', 'firstName lastName email profilePicture')
      .populate('counselor', 'firstName lastName email profilePicture department')
      .sort({ appointmentDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(query);

    // Group appointments by date for better UI organization
    const grouped = appointments.reduce((acc, apt) => {
      const date = new Date(apt.appointmentDate).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(apt);
      return acc;
    }, {});

    res.json({
      appointments: grouped,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
};

// @desc    Get counselor's appointments
// @route   GET /api/appointments/counselor-appointments
exports.getCounselorAppointments = async (req, res) => {
  try {
    if (req.user.role !== 'counselor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status, date, page = 1, limit = 10 } = req.query;
    
    let query = { counselor: req.user.id };

    if (status) {
      query.status = status;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query.appointmentDate = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    const appointments = await Appointment.find(query)
      .populate('student', 'firstName lastName email profilePicture studentId')
      .sort({ appointmentDate: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(query);

    // Get appointment statistics
    const stats = await Appointment.aggregate([
      { $match: { counselor: req.user._id } },
      { $group: {
        _id: '$status',
        count: { $sum: 1 }
      }}
    ]);

    const statistics = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    res.json({
      appointments,
      statistics,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get counselor appointments error:', error);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
};

// @desc    Get counselor's appointments
// @route   GET /api/appointments/counselor-appointments
exports.getCounselorAppointments = async (req, res) => {
  try {
    if (req.user.role !== 'counselor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const appointments = await Appointment.find({ counselor: req.user.id })
      .populate('student', 'firstName lastName email')
      .sort({ appointmentDate: -1 });

    res.json(appointments);
  } catch (error) {
    console.error('Get counselor appointments error:', error);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
};

// @desc    Create new appointment
// @route   POST /api/appointments
exports.createAppointment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      counselorId, 
      appointmentDate, 
      duration = 60,
      type = 'individual',
      mode = 'in-person',
      reason,
      concerns,
      priority = 'medium'
    } = req.body;

    // Validate counselor exists and is available
    const counselor = await User.findOne({ 
      _id: counselorId, 
      role: 'counselor',
      isActive: true,
      isVerified: true
    });

    if (!counselor) {
      return res.status(404).json({ message: 'Counselor not found or unavailable' });
    }

    // Check for appointment conflicts
    const conflictingAppointment = await checkAppointmentConflict(
      counselorId,
      appointmentDate,
      duration
    );

    if (conflictingAppointment) {
      return res.status(400).json({ message: 'Time slot is already booked' });
    }

    // Create appointment
    const appointment = new Appointment({
      student: req.user.id,
      counselor: counselorId,
      appointmentDate,
      appointmentTime: new Date(appointmentDate).toLocaleTimeString(),
      duration,
      type,
      mode,
      reason,
      concerns,
      priority,
      status: 'scheduled',
      location: mode === 'in-person' ? counselor.department : undefined,
      reminders: [
        { type: 'email', sent: false },
        { type: 'push', sent: false }
      ]
    });

    await appointment.save();

    // Populate appointment with user details for response
    await appointment.populate([
      { path: 'student', select: 'firstName lastName email profilePicture' },
      { path: 'counselor', select: 'firstName lastName email profilePicture department' }
    ]);

    // TODO: Send notification to counselor
    // TODO: Schedule reminders

    res.status(201).json({
      message: 'Appointment scheduled successfully',
      appointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Failed to schedule appointment' });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, notes } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate('student', 'firstName lastName email')
      .populate('counselor', 'firstName lastName email');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify user has permission to update
    if (
      req.user.role !== 'admin' &&
      appointment.counselor._id.toString() !== req.user.id &&
      appointment.student._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Not authorized to update this appointment' });
    }

    // Validate status transition
    const validTransitions = {
      scheduled: ['confirmed', 'cancelled'],
      confirmed: ['in-progress', 'cancelled', 'no-show'],
      'in-progress': ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
      'no-show': []
    };

    if (!validTransitions[appointment.status].includes(status)) {
      return res.status(400).json({
        message: `Cannot change status from ${appointment.status} to ${status}`
      });
    }

    // Update appointment
    appointment.status = status;
    if (notes) {
      if (req.user.role === 'counselor') {
        appointment.notes.counselor = notes;
      } else if (req.user.id === appointment.student._id.toString()) {
        appointment.notes.student = notes;
      }
    }

    // Handle special status updates
    if (status === 'completed') {
      appointment.notes.session = notes;
      appointment.followUpRequired = req.body.followUpRequired || false;
      if (appointment.followUpRequired) {
        appointment.followUpDate = req.body.followUpDate;
      }
    }

    await appointment.save();

    // Send notifications based on status change
    if (status === 'confirmed') {
      // TODO: Send confirmation email to student
    } else if (status === 'cancelled') {
      // TODO: Send cancellation notification to affected party
    } else if (status === 'completed') {
      // TODO: Send feedback request to student
    }

    res.json({
      message: 'Appointment status updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ message: 'Failed to update appointment status' });
  }
};

// @desc    Submit appointment feedback
// @route   POST /api/appointments/:id/feedback
exports.submitFeedback = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, comments, anonymous = true } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify user is the student who had the appointment
    if (appointment.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to submit feedback for this appointment' });
    }

    // Verify appointment is completed
    if (appointment.status !== 'completed') {
      return res.status(400).json({ message: 'Can only submit feedback for completed appointments' });
    }

    // Verify feedback hasn't already been submitted
    if (appointment.feedback && appointment.feedback.rating) {
      return res.status(400).json({ message: 'Feedback has already been submitted' });
    }

    appointment.feedback = {
      rating,
      comments,
      anonymous
    };

    await appointment.save();

    res.json({
      message: 'Feedback submitted successfully',
      appointment
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ message: 'Failed to submit feedback' });
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('student', 'firstName lastName email profilePicture studentId')
      .populate('counselor', 'firstName lastName email profilePicture department');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check authorization - only student, counselor, and admin can view
    if (
      req.user.role !== 'admin' &&
      appointment.student._id.toString() !== req.user.id &&
      appointment.counselor._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Not authorized to view this appointment' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ message: 'Failed to fetch appointment' });
  }
};

// @desc    Get all counselors
// @route   GET /api/appointments/counselors
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
      .select('firstName lastName email department profilePicture');

    res.json(counselors);
  } catch (error) {
    console.error('Get counselors error:', error);
    res.status(500).json({ message: 'Failed to fetch counselors' });
  }
};

// @desc    Get available slots for a counselor
// @route   GET /api/appointments/available-slots/:counselorId
exports.getAvailableSlots = async (req, res) => {
  try {
    const { counselorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    // Validate counselor exists and is available
    const counselor = await User.findOne({ 
      _id: counselorId, 
      role: 'counselor',
      isActive: true,
      isVerified: true
    });

    if (!counselor) {
      return res.status(404).json({ message: 'Counselor not found or unavailable' });
    }

    // Get booked appointments for the date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      counselor: counselorId,
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $nin: ['cancelled', 'no-show'] }
    }).select('appointmentDate duration');

    // Generate available slots
    const workingHours = {
      start: 9, // 9 AM
      end: 17   // 5 PM
    };

    const slots = [];
    const slotDuration = 60; // minutes

    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotTime = new Date(date);
        slotTime.setHours(hour, minute, 0, 0);
        
        // Check if slot conflicts with any booked appointment
        const isBooked = bookedAppointments.some(apt => {
          const aptStart = new Date(apt.appointmentDate);
          const aptEnd = new Date(aptStart.getTime() + apt.duration * 60000);
          return slotTime >= aptStart && slotTime < aptEnd;
        });

        if (!isBooked) {
          slots.push({
            time: slotTime.toISOString(),
            formatted: slotTime.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })
          });
        }
      }
    }

    res.json({
      counselor: {
        id: counselor._id,
        name: `${counselor.firstName} ${counselor.lastName}`,
        department: counselor.department
      },
      date: startOfDay.toISOString().split('T')[0],
      slots
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ message: 'Failed to fetch available slots' });
  }
};