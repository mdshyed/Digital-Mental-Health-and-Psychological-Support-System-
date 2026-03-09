const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['video', 'audio', 'article', 'guide', 'worksheet', 'infographic', 'podcast'],
    required: true
  },
  category: {
    type: String,
    enum: [
      'anxiety', 'depression', 'stress', 'sleep', 'relationships', 
      'academic', 'career', 'mindfulness', 'self-care', 'crisis-support'
    ],
    required: true
  },
  language: {
    type: String,
    enum: ['en', 'hi', 'ta', 'te', 'bn', 'gu', 'mr', 'pa'],
    default: 'en'
  },
  content: {
    url: String,
    filePath: String,
    duration: Number, // for videos/audio in minutes
    transcript: String,
    subtitles: [{
      language: String,
      url: String
    }]
  },
  thumbnail: {
    type: String,
    default: ''
  },
  tags: [String],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  ageGroup: {
    type: String,
    enum: ['18-22', '22-25', '25+', 'all'],
    default: 'all'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    anonymous: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  accessibility: {
    hasSubtitles: Boolean,
    hasAudioDescription: Boolean,
    hasTranscript: Boolean,
    fontSize: String,
    colorContrast: String
  },
  metadata: {
    fileSize: Number,
    format: String,
    resolution: String,
    lastModified: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient searching
resourceSchema.index({ category: 1, type: 1 });
resourceSchema.index({ language: 1 });
resourceSchema.index({ tags: 1 });
resourceSchema.index({ isPublished: 1, isApproved: 1 });
resourceSchema.index({ 'rating.average': -1 });
resourceSchema.index({ views: -1 });

// Text search index
resourceSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
});

module.exports = mongoose.model('Resource', resourceSchema);
