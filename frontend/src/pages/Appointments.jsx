import React from 'react'
import { Calendar, Clock, User, Phone, MapPin } from 'lucide-react'

const Appointments = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Appointment Booking</h1>
        <p className="text-gray-600">
          Schedule confidential appointments with qualified counselors
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Book New Appointment */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Book New Appointment</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Counselor
              </label>
              <select className="input-field">
                <option>Dr. Sarah Johnson</option>
                <option>Dr. Michael Chen</option>
                <option>Dr. Priya Sharma</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Appointment Date
              </label>
              <input type="date" className="input-field" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Times
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
                  9:00 AM
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
                  10:00 AM
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
                  11:00 AM
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mode
              </label>
              <select className="input-field">
                <option>In-Person</option>
                <option>Online</option>
                <option>Phone</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Appointment
              </label>
              <textarea 
                className="input-field" 
                rows={3}
                placeholder="Briefly describe what you'd like to discuss..."
              />
            </div>
            
            <button className="w-full btn-primary">
              Book Appointment
            </button>
          </form>
        </div>

        {/* My Appointments */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Appointments</h2>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">Dr. Sarah Johnson</h3>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Confirmed
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Tomorrow, Dec 15, 2024</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>2:00 PM - 3:00 PM</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Counseling Center, Room 201</span>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">Group Session</h3>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Scheduled
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Friday, Dec 20, 2024</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>4:00 PM - 5:00 PM</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Online Meeting</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Appointments
