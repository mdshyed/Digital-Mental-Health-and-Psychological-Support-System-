import React from 'react'
import { User, Mail, Phone, Calendar, MapPin, Shield, Settings } from 'lucide-react'

const Profile = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">
          Manage your personal information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input type="text" className="input-field" defaultValue="John" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input type="text" className="input-field" defaultValue="Doe" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input type="email" className="input-field" defaultValue="john.doe@university.edu" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input type="tel" className="input-field" defaultValue="+1 (555) 123-4567" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input type="text" className="input-field" defaultValue="Computer Science" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <select className="input-field">
                    <option>3rd Year</option>
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>4th Year</option>
                    <option>Graduate</option>
                  </select>
                </div>
              </div>
              
              <button className="btn-primary">
                Update Information
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input type="password" className="input-field" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input type="password" className="input-field" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input type="password" className="input-field" />
              </div>
              
              <button className="btn-primary">
                Change Password
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="card text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">JD</span>
            </div>
            <button className="btn-secondary text-sm">
              Change Photo
            </button>
          </div>

          {/* Privacy Settings */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input type="checkbox" defaultChecked />
                <span className="text-sm text-gray-700">Anonymous mode in peer support</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" defaultChecked />
                <span className="text-sm text-gray-700">Email notifications</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" />
                <span className="text-sm text-gray-700">SMS notifications</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" defaultChecked />
                <span className="text-sm text-gray-700">Push notifications</span>
              </label>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
            <form className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input type="text" className="input-field" defaultValue="Jane Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship
                </label>
                <input type="text" className="input-field" defaultValue="Mother" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input type="tel" className="input-field" defaultValue="+1 (555) 987-6543" />
              </div>
              <button className="w-full btn-secondary text-sm">
                Update Contact
              </button>
            </form>
          </div>

          {/* Account Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
            <div className="space-y-2">
              <button className="w-full btn-secondary text-sm">
                Export Data
              </button>
              <button className="w-full btn-secondary text-sm">
                Download Activity Report
              </button>
              <button className="w-full btn-danger text-sm">
                Deactivate Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
