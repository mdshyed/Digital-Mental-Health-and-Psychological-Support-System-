import React from 'react'
import { Users, Calendar, BookOpen, MessageCircle, TrendingUp, AlertTriangle, Shield } from 'lucide-react'

const AdminDashboard = () => {
  const stats = [
    { label: 'Total Users', value: '1,247', icon: Users, color: 'text-blue-600', change: '+12%' },
    { label: 'Active Sessions', value: '89', icon: MessageCircle, color: 'text-green-600', change: '+5%' },
    { label: 'Appointments', value: '156', icon: Calendar, color: 'text-purple-600', change: '+8%' },
    { label: 'Resources', value: '234', icon: BookOpen, color: 'text-orange-600', change: '+3%' }
  ]

  const recentActivity = [
    { type: 'user', message: 'New student registered', time: '2 minutes ago', icon: Users },
    { type: 'escalation', message: 'Chat session escalated to counselor', time: '15 minutes ago', icon: AlertTriangle },
    { type: 'appointment', message: 'New appointment booked', time: '1 hour ago', icon: Calendar },
    { type: 'resource', message: 'New resource uploaded', time: '2 hours ago', icon: BookOpen }
  ]

  const topConcerns = [
    { concern: 'Exam Stress', count: 45, percentage: 32 },
    { concern: 'Anxiety', count: 38, percentage: 27 },
    { concern: 'Sleep Issues', count: 28, percentage: 20 },
    { concern: 'Depression', count: 19, percentage: 14 },
    { concern: 'Relationships', count: 10, percentage: 7 }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">
              Monitor system activity, user engagement, and mental health trends
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Admin Panel</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-green-600">{stat.change}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'escalation' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    <activity.icon className={`w-4 h-4 ${
                      activity.type === 'escalation' ? 'text-red-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mental Health Trends */}
          <div className="card mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mental Health Trends</h2>
            <div className="space-y-4">
              {topConcerns.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{item.concern}</span>
                    <span className="text-sm text-gray-600">{item.count} cases</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* System Health */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Server Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">AI Service</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Response Time</span>
                <span className="text-sm font-medium text-gray-900">120ms</span>
              </div>
            </div>
          </div>

          {/* Pending Moderation */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Moderation</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Peer Posts</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  12
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Resources</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  5
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Comments</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  8
                </span>
              </div>
            </div>
            <button className="w-full mt-4 btn-primary text-sm">
              Review All
            </button>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full btn-secondary text-sm">
                Generate Report
              </button>
              <button className="w-full btn-secondary text-sm">
                User Management
              </button>
              <button className="w-full btn-secondary text-sm">
                System Settings
              </button>
              <button className="w-full btn-secondary text-sm">
                Backup Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
