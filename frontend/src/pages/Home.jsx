import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { testApiConnection } from '../utils/apiTest'
import toast from 'react-hot-toast'
import { 
  Heart, 
  MessageCircle, 
  Calendar, 
  BookOpen, 
  Users, 
  Shield,
  Brain,
  Phone,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react'

const Home = () => {
  const { isAuthenticated } = useAuth()
  const [testing, setTesting] = useState(false)

  const handleTestConnection = async () => {
    setTesting(true)
    try {
      const result = await testApiConnection()
      if (result) {
        toast.success('Successfully connected to backend!')
      } else {
        toast.error('Failed to connect to backend. Check if the server is running on port 8008.')
      }
    } catch (error) {
      toast.error('Connection test failed: ' + (error?.response?.data?.message || error.message))
    } finally {
      setTesting(false)
    }
  }

  const features = [
    {
      icon: MessageCircle,
      title: 'AI-Guided Support',
      description: 'Get immediate emotional support and coping strategies from our AI assistant.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Calendar,
      title: 'Confidential Booking',
      description: 'Schedule appointments with qualified counselors in a safe, confidential environment.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: BookOpen,
      title: 'Resource Hub',
      description: 'Access educational materials, videos, and guides in multiple languages.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Users,
      title: 'Peer Support',
      description: 'Connect with fellow students in moderated peer-to-peer support forums.',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your data is protected with industry-standard security and privacy measures.',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: Brain,
      title: 'Crisis Support',
      description: '24/7 crisis intervention and emergency escalation when needed.',
      color: 'from-indigo-500 to-indigo-600'
    }
  ]

  const stats = [
    { number: '1000+', label: 'Students Helped' },
    { number: '50+', label: 'Counselors Available' },
    { number: '24/7', label: 'AI Support' },
    { number: '95%', label: 'Satisfaction Rate' }
  ]

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Computer Science Student',
      content: 'The AI chat helped me through a difficult time. It was always there when I needed someone to talk to.',
      rating: 5
    },
    {
      name: 'Arjun Patel',
      role: 'Engineering Student',
      content: 'Booking appointments was so easy and confidential. The counselor was really helpful.',
      rating: 5
    },
    {
      name: 'Sneha Reddy',
      role: 'Medical Student',
      content: 'The peer support community made me feel less alone. Great platform!',
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-bg py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Mental Health
              <span className="text-gradient block">Matters</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              A comprehensive digital platform providing confidential, accessible, and culturally-sensitive 
              mental health support for students in higher education.
            </p>
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="inline-flex items-center gap-2 rounded-full bg-white/80 px-5 py-2 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-white hover:shadow-md hover:text-indigo-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {testing ? (
                <>
                  <Shield className="animate-spin h-4 w-4 text-indigo-600" />
                  <span>Testing backend connection...</span>
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 text-indigo-600" />
                  <span>Test backend connection</span>
                </>
              )}
            </button>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="btn-primary text-lg px-10 py-3 inline-flex items-center justify-center rounded-full shadow-lg shadow-blue-500/20"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link
                    to="/chat"
                    className="btn-secondary text-lg px-8 py-3 inline-flex items-center justify-center rounded-full"
                  >
                    <MessageCircle className="mr-2 w-5 h-5" />
                    Start Chat
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-primary text-lg px-10 py-3 inline-flex items-center justify-center rounded-full shadow-lg shadow-blue-500/20"
                  >
                    Get started
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="btn-secondary text-lg px-8 py-3 rounded-full"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Mental Health Support
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform offers multiple pathways to mental wellness, designed specifically for students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card hover:shadow-lg transition-shadow duration-300">
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Crisis Support Section */}
      <section className="py-16 bg-red-50 border-y border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Need Immediate Help?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              If you're experiencing a mental health crisis, please reach out to emergency services immediately.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:988"
                className="btn-danger text-lg px-8 py-3 inline-flex items-center justify-center"
              >
                <Phone className="mr-2 w-5 h-5" />
                Call 988 (Suicide Prevention)
              </a>
              <a
                href="tel:100"
                className="btn-secondary text-lg px-8 py-3 inline-flex items-center justify-center"
              >
                <Phone className="mr-2 w-5 h-5" />
                Emergency: 100
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Students Say
            </h2>
            <p className="text-xl text-gray-600">
              Real feedback from students who have used our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Take Control of Your Mental Health?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have found support, guidance, and community through our platform.
          </p>
          
          {!isAuthenticated ? (
            <Link
              to="/register"
              className="btn-primary text-lg px-8 py-3 inline-flex items-center justify-center"
            >
              Start Your Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          ) : (
            <Link
              to="/chat"
              className="btn-primary text-lg px-8 py-3 inline-flex items-center justify-center"
            >
              <MessageCircle className="mr-2 w-5 h-5" />
              Chat with AI Assistant
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
