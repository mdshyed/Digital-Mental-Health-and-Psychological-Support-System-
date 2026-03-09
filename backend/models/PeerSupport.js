const mongoose = require('mongoose');

const peerSupportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: [
      'anxiety', 'depression', 'stress', 'academic-pressure', 
      'relationships', 'family', 'career', 'self-esteem',
      'sleep', 'eating', 'addiction', 'grief', 'trauma',
      'general-support', 'success-story', 'tips'
    ],
    required: true
  },
  tags: [String],
  isAnonymous: {
    type: Boolean,
    default: true
  },
  visibility: {
    type: String,
    enum: ['public', 'community', 'private'],
    default: 'community'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  moderationNotes: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  riskAssessment: {
    level: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    },
    flags: [String],
    escalated: {
      type: Boolean,
      default: false
    },
    escalatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    escalatedAt: Date
  },
  engagement: {
    likes: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    }
  },
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    isAnonymous: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    moderatedAt: Date,
    likes: {
      type: Number,
      default: 0
    },
    replies: [{
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true,
        trim: true
      },
      isAnonymous: {
        type: Boolean,
        default: true
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  resources: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  }],
  language: {
    type: String,
    enum: ['en', 'hi', 'ta', 'te', 'bn', 'gu', 'mr', 'pa'],
    default: 'en'
  },
  ageGroup: {
    type: String,
    enum: ['18-22', '22-25', '25+', 'all'],
    default: 'all'
  },
  followUp: {
    required: {
      type: Boolean,
      default: false
    },
    scheduledDate: Date,
    completed: {
      type: Boolean,
      default: false
    },
    notes: String
  }
}, {
  timestamps: true
});

// Indexes
peerSupportSchema.index({ category: 1, status: 1 });
peerSupportSchema.index({ author: 1, createdAt: -1 });
peerSupportSchema.index({ 'riskAssessment.level': 1 });
peerSupportSchema.index({ tags: 1 });
peerSupportSchema.index({ language: 1 });
peerSupportSchema.index({ 'engagement.likes': -1 });

// Text search index
peerSupportSchema.index({
  title: 'text',
  content: 'text',
  tags: 'text'
});

module.exports = mongoose.model('PeerSupport', peerSupportSchema);
