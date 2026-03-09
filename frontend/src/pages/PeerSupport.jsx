import React from 'react'
import { MessageCircle, Heart, Share2, MoreHorizontal, Send } from 'lucide-react'

const PeerSupport = () => {
  const posts = [
    {
      id: 1,
      title: 'Feeling overwhelmed with final exams',
      content: 'I\'m struggling to manage my stress levels as finals approach. Anyone else feeling this way? Looking for study tips and stress management techniques.',
      author: 'Anonymous Student',
      category: 'academic-pressure',
      likes: 24,
      comments: 8,
      timeAgo: '2 hours ago',
      isAnonymous: true
    },
    {
      id: 2,
      title: 'Success story: Overcoming social anxiety',
      content: 'I wanted to share my journey of overcoming social anxiety. It took time and effort, but joining study groups and gradually pushing my comfort zone really helped.',
      author: 'Anonymous Student',
      category: 'success-story',
      likes: 45,
      comments: 12,
      timeAgo: '1 day ago',
      isAnonymous: true
    },
    {
      id: 3,
      title: 'Sleep schedule tips that actually work',
      content: 'After struggling with irregular sleep for months, I found a routine that works. Here are the tips that helped me get better sleep...',
      author: 'Anonymous Student',
      category: 'tips',
      likes: 18,
      comments: 5,
      timeAgo: '3 days ago',
      isAnonymous: true
    }
  ]

  const categories = ['All', 'Anxiety', 'Depression', 'Stress', 'Academic', 'Relationships', 'Success Stories', 'Tips']

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Peer Support Community</h1>
        <p className="text-gray-600">
          Connect with fellow students, share experiences, and find support in a safe, moderated environment.
        </p>
      </div>

      {/* Create Post */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Share Your Experience</h2>
        <form className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="What's on your mind?"
              className="input-field"
            />
          </div>
          <div>
            <textarea
              placeholder="Share your thoughts, experiences, or ask for advice..."
              className="input-field"
              rows={4}
            />
          </div>
          <div className="flex items-center justify-between">
            <select className="input-field w-auto">
              <option>Select Category</option>
              <option>Anxiety</option>
              <option>Depression</option>
              <option>Stress</option>
              <option>Academic Pressure</option>
              <option>Relationships</option>
              <option>Success Story</option>
              <option>Tips</option>
            </select>
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked />
                <span className="text-sm text-gray-600">Post anonymously</span>
              </label>
              <button className="btn-primary">
                <Send className="w-4 h-4 mr-1" />
                Post
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Categories */}
      <div className="card mb-6">
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

      {/* Posts */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {post.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{post.author}</h3>
                  <p className="text-sm text-gray-500">{post.timeAgo}</p>
                </div>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded-full">
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {post.title}
              </h2>
              <p className="text-gray-700">
                {post.content}
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">{post.likes}</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">{post.comments}</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500 transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm">Share</span>
                </button>
              </div>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {post.category.replace('-', ' ')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-8">
        <button className="btn-secondary">
          Load More Posts
        </button>
      </div>
    </div>
  )
}

export default PeerSupport
