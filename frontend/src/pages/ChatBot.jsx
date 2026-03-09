import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Send, 
  Bot, 
  User, 
  AlertTriangle, 
  Phone, 
  Heart,
  Loader2,
  MessageCircle,
  Shield
} from 'lucide-react'
import axios from '../config/axios'
import toast from 'react-hot-toast'

const ChatBot = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [riskLevel, setRiskLevel] = useState('low')
  const [isEscalated, setIsEscalated] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    startNewSession()
  }, [])

  const startNewSession = async () => {
    try {
      const response = await axios.post('/chat/start-session', {
        language: user?.preferences?.language || 'en',
        sessionType: 'general'
      })
      
      setSessionId(response.data.sessionId)
      setMessages([{
        id: Date.now(),
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date()
      }])
    } catch (error) {
      console.error('Failed to start session:', error)
      toast.error('Failed to start chat session')
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await axios.post('/chat/send-message', {
        message: inputMessage,
        sessionId: sessionId
      })

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.data.message,
        messageType: response.data.messageType,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      setRiskLevel(response.data.riskLevel || 'low')
      
      if (response.data.escalationRequired) {
        setIsEscalated(true)
        toast.error('Your message has been escalated to a counselor. Please wait for assistance.')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message. Please try again.')
      
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I'm sorry, I'm having trouble responding right now. Please try again or contact support if the issue persists.",
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const quickReplies = [
    "I'm feeling anxious",
    "I'm having trouble sleeping",
    "I feel overwhelmed",
    "I'm stressed about exams",
    "I feel lonely",
    "I need coping strategies"
  ]

  const handleQuickReply = (reply) => {
    setInputMessage(reply)
  }

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-green-600 bg-green-50 border-green-200'
    }
  }

  const getRiskLevelIcon = (level) => {
    switch (level) {
      case 'high': return <AlertTriangle className="w-4 h-4" />
      case 'medium': return <AlertTriangle className="w-4 h-4" />
      default: return <Heart className="w-4 h-4" />
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">AI Mental Health Assistant</h1>
              <p className="text-sm text-gray-500">Always here to listen and support you</p>
            </div>
          </div>
          
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${getRiskLevelColor(riskLevel)}`}>
            {getRiskLevelIcon(riskLevel)}
            <span className="capitalize">{riskLevel} risk</span>
          </div>
        </div>

        {isEscalated && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-800">
              <Shield className="w-5 h-5" />
              <span className="font-medium">Session Escalated</span>
            </div>
            <p className="text-red-700 text-sm mt-1">
              Your conversation has been escalated to a human counselor. They will reach out to you soon.
            </p>
            <div className="mt-3 flex space-x-2">
              <a
                href="tel:988"
                className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
              >
                <Phone className="w-4 h-4 mr-1" />
                Call 988
              </a>
              <a
                href="tel:100"
                className="inline-flex items-center px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
              >
                <Phone className="w-4 h-4 mr-1" />
                Emergency
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Chat Messages */}
      <div className="card h-96 overflow-y-auto scrollbar-hide">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.role === 'assistant' && (
                    <Bot className="w-4 h-4 mt-1 flex-shrink-0" />
                  )}
                  {message.role === 'user' && (
                    <User className="w-4 h-4 mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4" />
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Replies */}
      {messages.length <= 2 && (
        <div className="card mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Start:</h3>
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => handleQuickReply(reply)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="card mt-4">
        <div className="flex space-x-2">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={2}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>

      {/* Safety Notice */}
      <div className="card mt-4 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-2">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">Safety & Privacy</h3>
            <p className="text-sm text-blue-700 mt-1">
              This is an AI assistant for general mental health support. For crisis situations, 
              please contact emergency services immediately. Your conversations are confidential 
              and secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatBot
