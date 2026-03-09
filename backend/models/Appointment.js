const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  counselor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 60, // minutes
    required: true
  },
  type: {
    type: String,
    enum: ['individual', 'group', 'emergency', 'follow-up'],
    default: 'individual'
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  mode: {
    type: String,
    enum: ['in-person', 'online', 'phone'],
    default: 'in-person'
  },
  location: {
    type: String,
    trim: true
  },
  meetingLink: {
    type: String,
    trim: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  concerns: [String],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  notes: {
    student: String,
    counselor: String,
    session: String
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    anonymous: {
      type: Boolean,
      default: true
    }
  },
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push']
    },
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: Date
  }],
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  emergencyEscalated: {
    type: Boolean,
    default: false
  },
  emergencyNotes: String
}, {
  timestamps: true
});

// Index for efficient queries
appointmentSchema.index({ student: 1, appointmentDate: 1 });
appointmentSchema.index({ counselor: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ priority: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
