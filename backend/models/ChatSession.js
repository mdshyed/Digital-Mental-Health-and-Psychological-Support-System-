const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    messageType: {
      type: String,
      enum: ['text', 'quick-reply', 'resource-suggestion', 'escalation'],
      default: 'text'
    },
    metadata: {
      confidence: Number,
      suggestedActions: [String],
      resourceId: mongoose.Schema.Types.ObjectId,
      escalationReason: String
    }
  }],
  context: {
    currentMood: String,
    concerns: [String],
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    },
    language: {
      type: String,
      default: 'en'
    },
    sessionType: {
      type: String,
      enum: ['general', 'crisis', 'follow-up', 'assessment'],
      default: 'general'
    }
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'escalated', 'completed'],
    default: 'active'
  },
  escalatedTo: {
    counselor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    escalatedAt: Date,
    reason: String
  },
  analytics: {
    messageCount: {
      type: Number,
      default: 0
    },
    sessionDuration: Number, // in minutes
    satisfactionRating: Number,
    resourcesShared: [mongoose.Schema.Types.ObjectId],
    copingStrategiesSuggested: [String]
  },
  privacy: {
    anonymous: {
      type: Boolean,
      default: true
    },
    dataRetention: {
      type: Number,
      default: 30 // days
    }
  }
}, {
  timestamps: true
});

// Define single compound index for user sessions
chatSessionSchema.index({ user: 1, createdAt: -1 });

// Clear any old/duplicate indexes
chatSessionSchema.on('index', function(err) {
  if (err) console.error('Error building indexes:', err);
});
chatSessionSchema.index({ sessionId: 1 });
chatSessionSchema.index({ status: 1 });
chatSessionSchema.index({ 'context.riskLevel': 1 });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
