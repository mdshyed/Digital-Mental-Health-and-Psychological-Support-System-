import React from 'react'
import { Play, Download, Star, Eye, Filter } from 'lucide-react'

const Resources = () => {
  const resources = [
    {
      id: 1,
      title: 'Managing Exam Stress',
      type: 'video',
      category: 'stress',
      duration: '15 min',
      rating: 4.8,
      views: 1250,
      thumbnail: '/api/placeholder/300/200',
      description: 'Learn effective techniques to manage stress during exam periods.'
    },
    {
      id: 2,
      title: 'Mindfulness Meditation Guide',
      type: 'audio',
      category: 'mindfulness',
      duration: '20 min',
      rating: 4.9,
      views: 2100,
      thumbnail: '/api/placeholder/300/200',
      description: 'Guided meditation sessions for beginners and advanced practitioners.'
    },
    {
      id: 3,
      title: 'Building Healthy Relationships',
      type: 'article',
      category: 'relationships',
      duration: '10 min read',
      rating: 4.7,
      views: 890,
      thumbnail: '/api/placeholder/300/200',
      description: 'Essential tips for maintaining healthy relationships in college.'
    },
    {
      id: 4,
      title: 'Sleep Hygiene Worksheet',
      type: 'worksheet',
      category: 'sleep',
      duration: '5 min',
      rating: 4.6,
      views: 650,
      thumbnail: '/api/placeholder/300/200',
      description: 'Interactive worksheet to improve your sleep habits.'
    }
  ]

  const categories = ['All', 'Stress', 'Anxiety', 'Depression', 'Sleep', 'Relationships', 'Mindfulness', 'Self-Care']

  return (
    <div className="max-w-7xl mx-auto">
      <div className="card mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Mental Health Resources</h1>
        <p className="text-gray-600">
          Access educational materials, videos, guides, and worksheets to support your mental wellness journey.
        </p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  index === 0 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <div key={resource.id} className="card hover:shadow-lg transition-shadow duration-300">
            <div className="relative mb-4">
              <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                <Play className="w-12 h-12 text-gray-400" />
              </div>
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
                  {resource.type}
                </span>
              </div>
              <div className="absolute bottom-2 left-2">
                <span className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
                  {resource.duration}
                </span>
              </div>
            </div>
            
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {resource.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {resource.description}
              </p>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span>{resource.rating}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{resource.views}</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button className="flex-1 btn-primary text-sm">
                <Play className="w-4 h-4 mr-1" />
                View
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-8">
        <button className="btn-secondary">
          Load More Resources
        </button>
      </div>
    </div>
  )
}

export default Resources
