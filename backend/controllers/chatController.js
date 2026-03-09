const ChatSession = require('../models/ChatSession');
const { validationResult } = require('express-validator');

// Utility function to analyze message for risk level
const analyzeMessageRisk = (content) => {
  const highRiskKeywords = ['suicide', 'kill myself', 'end my life', 'die'];
  const mediumRiskKeywords = ['depressed', 'anxious', 'hopeless', 'worthless'];
  
  const contentLower = content.toLowerCase();
  
  if (highRiskKeywords.some(keyword => contentLower.includes(keyword))) {
    return 'high';
  }
  if (mediumRiskKeywords.some(keyword => contentLower.includes(keyword))) {
    return 'medium';
  }
  return 'low';
};

// @desc    Start a new chat session
// @route   POST /api/chat/start-session
exports.startSession = async (req, res) => {
  try {
    const { language = 'en', sessionType = 'general' } = req.body;

    const session = new ChatSession({
      user: req.user.id,
      sessionId: `${req.user.id}-${Date.now()}`,
      messages: [{
        role: 'system',
        content: 'Welcome to the mental health support chat. How can I help you today?'
      }],
      context: {
        language,
        sessionType,
        currentMood: req.body.currentMood,
        concerns: req.body.concerns || []
      },
      status: 'active',
      privacy: {
        anonymous: req.body.anonymous !== false,
        dataRetention: 30 // days
      }
    });

    await session.save();

    // Initialize analytics
    session.analytics = {
      messageCount: 1,
      sessionDuration: 0,
      copingStrategiesSuggested: []
    };

    res.status(201).json(session);
  } catch (error) {
    console.error('Start chat session error:', error);
    res.status(500).json({ message: 'Failed to start chat session' });
  }
};

// @desc    Send message in chat session
// @route   POST /api/chat/session/:sessionId/message
exports.sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, metadata } = req.body;
    const session = await ChatSession.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    if (session.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this chat session' });
    }

    if (session.status !== 'active') {
      return res.status(400).json({ message: 'This chat session is no longer active' });
    }

    // Analyze message for risk level
    const riskLevel = analyzeMessageRisk(message);
    if (riskLevel === 'high' && session.context.riskLevel !== 'high') {
      session.status = 'escalated';
      session.escalatedTo = {
        reason: 'High risk content detected in user message',
        escalatedAt: new Date()
      };
    }

    // Update session context
    session.context.riskLevel = riskLevel;
    
    // Add user message
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
      messageType: 'text',
      metadata: metadata || {}
    });

    // Update analytics
    session.analytics.messageCount += 1;
    session.analytics.sessionDuration = 
      (new Date() - session.createdAt) / 1000 / 60; // in minutes

    // If session is escalated, notify counselor
    if (session.status === 'escalated') {
      // TODO: Implement counselor notification
      session.messages.push({
        role: 'system',
        content: 'I notice you might be going through a very difficult time. I\'m connecting you with a counselor who can provide better support. Please stay with us.',
        messageType: 'escalation',
        timestamp: new Date()
      });
    } else {
      // Here you would integrate with your AI service
      // For this example, we'll use a simple response system
      const response = await generateAIResponse(message, session.context);
      session.messages.push({
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        messageType: response.type || 'text',
        metadata: response.metadata || {}
      });

      // Update context based on AI response
      if (response.suggestedCopingStrategies) {
        session.analytics.copingStrategiesSuggested.push(
          ...response.suggestedCopingStrategies
        );
      }

      if (response.suggestedResources) {
        session.analytics.resourcesShared.push(
          ...response.suggestedResources
        );
      }
    }

    await session.save();
    res.json(session);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

// Helper function to generate AI response
// This would be replaced with your actual AI service integration
async function generateAIResponse(message, context) {
  // Placeholder for AI service integration
  return {
    message: "I hear you and I'm here to help. Can you tell me more about what you're experiencing?",
    type: 'text',
    metadata: {
      confidence: 0.95
    },
    suggestedCopingStrategies: ['deep-breathing', 'mindfulness'],
    suggestedResources: []
  };
}

// @desc    Get user's chat sessions
// @route   GET /api/chat/sessions
exports.getSessions = async (req, res) => {
  try {
    const { 
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query;

    let query = { user: req.user.id };

    if (status) {
      query.status = status;
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const sessions = await ChatSession.find(query)
      .select('-messages') // Exclude messages for list view
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ChatSession.countDocuments(query);

    res.json({
      sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({ message: 'Failed to fetch chat sessions' });
  }
};

// @desc    Get specific chat session
// @route   GET /api/chat/session/:sessionId
exports.getSession = async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    // Check authorization
    const isAuthorized = 
      session.user.toString() === req.user.id ||
      (req.user.role === 'counselor' && session.escalatedTo?.counselor?.toString() === req.user.id) ||
      req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to access this chat session' });
    }

    // Update session if counselor is viewing
    if (req.user.role === 'counselor' && session.status === 'escalated') {
      session.escalatedTo.counselor = req.user.id;
      session.escalatedTo.viewedAt = new Date();
      await session.save();
    }

    res.json(session);
  } catch (error) {
    console.error('Get chat session error:', error);
    res.status(500).json({ message: 'Failed to fetch chat session' });
  }
};

// @desc    Update chat session status
// @route   PUT /api/chat/session/:sessionId/status
exports.updateSessionStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const session = await ChatSession.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    // Verify user has permission to update
    const isAuthorized = 
      session.user.toString() === req.user.id ||
      (req.user.role === 'counselor' && session.escalatedTo?.counselor?.toString() === req.user.id) ||
      req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to update this session' });
    }

    // Update session
    session.status = status;
    if (notes) {
      session.messages.push({
        role: req.user.role,
        content: notes,
        timestamp: new Date(),
        messageType: 'system-note'
      });
    }

    if (status === 'completed') {
      session.analytics.sessionDuration = 
        (new Date() - session.createdAt) / 1000 / 60; // in minutes
    }

    await session.save();

    res.json({
      message: 'Chat session status updated successfully',
      session
    });
  } catch (error) {
    console.error('Update session status error:', error);
    res.status(500).json({ message: 'Failed to update session status' });
  }
};