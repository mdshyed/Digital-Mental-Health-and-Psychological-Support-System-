const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { body, validationResult } = require('express-validator');
const ChatSession = require('../models/ChatSession');
const Resource = require('../models/Resource');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Updated to a current, supported model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Mental health context and safety guidelines
const MENTAL_HEALTH_CONTEXT = `
You are a compassionate AI mental health assistant designed to help college students. Your role is to:

1. Provide immediate emotional support and coping strategies
2. Offer evidence-based mental health information
3. Recognize when to escalate to human professionals
4. Maintain a warm, non-judgmental, and culturally sensitive approach

IMPORTANT SAFETY GUIDELINES:
- Always prioritize user safety
- If user mentions self-harm, suicide, or severe crisis, immediately suggest contacting emergency services
- Provide crisis hotline numbers: National Suicide Prevention Lifeline: 988
- Never provide medical diagnoses or replace professional therapy
- Always encourage professional help for serious concerns
- Be culturally sensitive to Indian context and languages
- Respect privacy and maintain confidentiality

RESPONSE GUIDELINES:
- Keep responses concise but supportive (2-3 sentences)
- Use "I" statements and avoid clinical language
- Offer practical coping strategies
- Suggest relevant resources when appropriate
- End with open-ended questions to encourage continued conversation
`;

// @route   POST /api/chat/start-session
// @desc    Start a new chat session
// @access  Private
router.post('/start-session', auth, async (req, res) => {
  try {
    const { language = 'en', sessionType = 'general' } = req.body;
    
    const sessionId = `session_${Date.now()}_${req.user.id}`;
    
    const chatSession = new ChatSession({
      user: req.user.id,
      sessionId,
      context: {
        language,
        sessionType,
        riskLevel: 'low'
      }
    });

    await chatSession.save();

    // Initial greeting message
    const greetingMessages = {
      en: "Hello! I'm here to listen and support you. How are you feeling today?",
      hi: "नमस्ते! मैं आपकी सुनने और सहायता करने के लिए यहाँ हूँ। आज आप कैसा महसूस कर रहे हैं?",
      ta: "வணக்கம்! நான் உங்களைக் கேட்டு ஆதரிக்க இங்கே இருக்கிறேன். இன்று நீங்கள் எப்படி உணருகிறீர்கள்?",
      te: "నమస్కారం! నేను మిమ్మల్ని వినడానికి మరియు మద్దతు ఇవ్వడానికి ఇక్కడ ఉన్నాను. ఈరోజు మీరు ఎలా అనుభవిస్తున్నారు?"
    };

    const greeting = greetingMessages[language] || greetingMessages.en;

    chatSession.messages.push({
      role: 'assistant',
      content: greeting,
      messageType: 'text'
    });

    await chatSession.save();

    res.json({
      sessionId,
      message: greeting,
      session: {
        id: chatSession._id,
        sessionId: chatSession.sessionId,
        status: chatSession.status,
        context: chatSession.context
      }
    });
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ message: 'Failed to start chat session' });
  }
});

// @route   POST /api/chat/send-message
// @desc    Send a message to AI and get response
// @access  Private
router.post('/send-message', auth, [
  body('message').trim().isLength({ min: 1 }).withMessage('Message cannot be empty'),
  body('sessionId').notEmpty().withMessage('Session ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, sessionId } = req.body;

    // Find the chat session
    const chatSession = await ChatSession.findOne({ 
      sessionId, 
      user: req.user.id 
    });

    if (!chatSession) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    // Add user message
    chatSession.messages.push({
      role: 'user',
      content: message,
      messageType: 'text'
    });

    // Check for crisis keywords
    const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'not worth living', 'self harm', 'cut myself'];
    const hasCrisisContent = crisisKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    if (hasCrisisContent) {
      chatSession.context.riskLevel = 'high';
      chatSession.status = 'escalated';
      
      const crisisResponse = {
        role: 'assistant',
        content: `I'm really concerned about what you're sharing. Your safety is the most important thing right now. Please reach out to someone immediately:

🚨 **Emergency Contacts:**
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741
- Your campus counseling center
- A trusted friend or family member

You don't have to go through this alone. There are people who care about you and want to help.`,
        messageType: 'escalation',
        metadata: {
          escalationReason: 'crisis_content_detected',
          confidence: 0.9
        }
      };

      chatSession.messages.push(crisisResponse);
      await chatSession.save();

      return res.json({
        message: crisisResponse.content,
        messageType: 'escalation',
        riskLevel: 'high',
        escalationRequired: true
      });
    }

    // Prepare context for AI
    const recentMessages = chatSession.messages.slice(-10); // Last 10 messages for context
    const conversationHistory = recentMessages.map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n');

    const prompt = `${MENTAL_HEALTH_CONTEXT}

Current conversation:
${conversationHistory}

User's latest message: ${message}

Please respond as a supportive mental health assistant. Keep your response helpful, empathetic, and culturally sensitive. If the user seems to need professional help, gently suggest reaching out to a counselor.`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiResponse = response.text();

      // Add AI response to session
      chatSession.messages.push({
        role: 'assistant',
        content: aiResponse,
        messageType: 'text',
        metadata: {
          confidence: 0.8
        }
      });

      // Update analytics
      chatSession.analytics.messageCount += 1;

      await chatSession.save();

      res.json({
        message: aiResponse,
        messageType: 'text',
        riskLevel: chatSession.context.riskLevel
      });

    } catch (aiError) {
      console.error('AI generation error:', aiError);

      // More varied, empathetic fallback responses when Gemini is unavailable
      const genericResponses = [
        "Thank you for sharing that with me. It sounds like you're dealing with something important, and I'm here to listen.",
        "I hear that this is a lot to carry. You're not alone in this, and we can explore it together at your pace.",
        "It takes courage to talk about how you're feeling. I'm here to support you as you work through this."
      ];

      const index = Math.abs((message || '').length + Date.now()) % genericResponses.length;
      const base = genericResponses[index];
      const followUp = " Could you tell me a bit more about what's going on, or what feels hardest right now?";
      const fallbackResponse = base + followUp;

      chatSession.messages.push({
        role: 'assistant',
        content: fallbackResponse,
        messageType: 'text'
      });

      await chatSession.save();

      res.json({
        message: fallbackResponse,
        messageType: 'text',
        riskLevel: chatSession.context.riskLevel,
        usingFallback: true
      });
    }

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Failed to process message' });
  }
});

// @route   GET /api/chat/sessions
// @desc    Get user's chat sessions
// @access  Private
router.get('/sessions', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const sessions = await ChatSession.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('sessionId status context createdAt analytics');

    const total = await ChatSession.countDocuments({ user: req.user.id });

    res.json({
      sessions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ message: 'Failed to fetch sessions' });
  }
});

// @route   GET /api/chat/session/:sessionId
// @desc    Get specific chat session
// @access  Private
router.get('/session/:sessionId', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await ChatSession.findOne({ 
      sessionId, 
      user: req.user.id 
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json({ session });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ message: 'Failed to fetch session' });
  }
});

// @route   POST /api/chat/escalate
// @desc    Escalate chat session to human counselor
// @access  Private
router.post('/escalate', auth, [
  body('sessionId').notEmpty().withMessage('Session ID is required'),
  body('reason').trim().isLength({ min: 10 }).withMessage('Reason must be at least 10 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sessionId, reason } = req.body;

    const chatSession = await ChatSession.findOne({ 
      sessionId, 
      user: req.user.id 
    });

    if (!chatSession) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Find available counselor
    const counselor = await User.findOne({ 
      role: 'counselor', 
      isActive: true 
    });

    if (!counselor) {
      return res.status(503).json({ 
        message: 'No counselors available at the moment. Please try again later.' 
      });
    }

    // Update session
    chatSession.status = 'escalated';
    chatSession.escalatedTo.counselor = counselor._id;
    chatSession.escalatedTo.escalatedAt = new Date();
    chatSession.escalatedTo.reason = reason;

    await chatSession.save();

    res.json({
      message: 'Session escalated successfully',
      counselor: {
        id: counselor._id,
        name: `${counselor.firstName} ${counselor.lastName}`,
        email: counselor.email
      }
    });
  } catch (error) {
    console.error('Escalate error:', error);
    res.status(500).json({ message: 'Failed to escalate session' });
  }
});

// @route   POST /api/chat/feedback
// @desc    Provide feedback on chat session
// @access  Private
router.post('/feedback', auth, [
  body('sessionId').notEmpty().withMessage('Session ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comments').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sessionId, rating, comments } = req.body;

    const chatSession = await ChatSession.findOne({ 
      sessionId, 
      user: req.user.id 
    });

    if (!chatSession) {
      return res.status(404).json({ message: 'Session not found' });
    }

    chatSession.analytics.satisfactionRating = rating;
    if (comments) {
      chatSession.messages.push({
        role: 'system',
        content: `User feedback: ${comments}`,
        messageType: 'text'
      });
    }

    await chatSession.save();

    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ message: 'Failed to submit feedback' });
  }
});

module.exports = router;
