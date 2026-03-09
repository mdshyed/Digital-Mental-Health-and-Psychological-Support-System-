import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  MessageCircle, 
  Calendar, 
  BookOpen, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()

  const quickActions = [
    {
      title: 'Start AI Chat',
      description: 'Get immediate emotional support',
      icon: MessageCircle,
      href: '/chat',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Book Appointment',
      description: 'Schedule with a counselor',
      icon: Calendar,
      href: '/appointments',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Browse Resources',
      description: 'Educational materials & guides',
      icon: BookOpen,
      href: '/resources',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Peer Support',
      description: 'Connect with fellow students',
      icon: Users,
      href: '/peer-support',
      color: 'from-orange-500 to-orange-600'
    }
  ]

  const stats = [
    { label: 'Chat Sessions', value: '12', icon: MessageCircle, color: 'text-blue-600' },
    { label: 'Appointments', value: '3', icon: Calendar, color: 'text-green-600' },
    { label: 'Resources Viewed', value: '8', icon: BookOpen, color: 'text-purple-600' },
    { label: 'Peer Posts', value: '5', icon: Users, color: 'text-orange-600' }
  ]

  const recentActivity = [
    {
      type: 'chat',
      title: 'AI Chat Session',
      description: 'Discussed exam stress management',
      time: '2 hours ago',
      icon: MessageCircle,
      color: 'text-blue-600'
    },
    {
      type: 'appointment',
      title: 'Appointment Scheduled',
      description: 'Meeting with Dr. Smith on Friday',
      time: '1 day ago',
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      type: 'resource',
      title: 'Resource Viewed',
      description: 'Mindfulness Meditation Guide',
      time: '2 days ago',
      icon: BookOpen,
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="card mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-gray-600">
              How are you feeling today? We're here to support your mental wellness journey.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.href}
              className="card hover:shadow-lg transition-shadow duration-300 group"
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {action.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stats */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Activity</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {stats.map((stat, index) => (
              <div key={index} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0`}>
                    <activity.icon className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Mental Health Check */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mental Health Check</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Mood</span>
                <span className="text-sm font-medium text-green-600">Good</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Stress Level</span>
                <span className="text-sm font-medium text-yellow-600">Medium</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sleep Quality</span>
                <span className="text-sm font-medium text-blue-600">Fair</span>
              </div>
            </div>
            <button className="w-full mt-4 btn-primary text-sm">
              Update Assessment
            </button>
          </div>

          {/* Upcoming Appointments */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Dr. Sarah Johnson</p>
                  <p className="text-xs text-gray-600">Tomorrow, 2:00 PM</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Group Session</p>
                  <p className="text-xs text-gray-600">Friday, 4:00 PM</p>
                </div>
              </div>
            </div>
            <Link to="/appointments" className="block w-full mt-4 btn-secondary text-sm text-center">
              View All
            </Link>
          </div>

          {/* Emergency Contacts */}
          <div className="card bg-red-50 border-red-200">
            <h3 className="text-lg font-semibold text-red-900 mb-4">Emergency Contacts</h3>
            <div className="space-y-2">
              <a
                href="tel:988"
                className="flex items-center space-x-2 text-red-700 hover:text-red-800 transition-colors"
              >
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Suicide Prevention: 988</span>
              </a>
              <a
                href="tel:100"
                className="flex items-center space-x-2 text-red-700 hover:text-red-800 transition-colors"
              >
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Emergency: 100</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
