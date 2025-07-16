import React from 'react'
import { Routes, Route } from 'react-router-dom'

// Simple test components first
function SimpleHomePage() {
  return (
    <div className="min-h-screen bg-warm-cream p-8">
      <h1 className="text-4xl font-bold text-orange-600">🏠 DilSeDaan - Home</h1>
      <p className="mt-4 text-gray-700">Welcome to DilSeDaan Charity Platform</p>
      <div className="mt-6 space-y-2">
        <p>✅ Home page working</p>
        <p>✅ Basic styling working</p>
        <p>✅ Ready to add more components</p>
      </div>
    </div>
  )
}

function SimpleAboutPage() {
  return (
    <div className="min-h-screen bg-warm-cream p-8">
      <h1 className="text-4xl font-bold text-orange-600">ℹ️ About DilSeDaan</h1>
      <p className="mt-4 text-gray-700">About our charity platform</p>
    </div>
  )
}

function App() {
  return (
    <div className="min-h-screen bg-warm-cream">
      {/* Simple navbar for now */}
      <nav className="bg-white shadow-sm border-b p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">❤️</span>
            <span className="text-xl font-bold text-orange-600">DilSeDaan</span>
          </div>
          <div className="flex space-x-6">
            <a href="/" className="text-gray-700 hover:text-orange-600">Home</a>
            <a href="/about" className="text-gray-700 hover:text-orange-600">About</a>
            <a href="/campaigns" className="text-gray-700 hover:text-orange-600">Campaigns</a>
            <a href="/contact" className="text-gray-700 hover:text-orange-600">Contact</a>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<SimpleHomePage />} />
          <Route path="/about" element={<SimpleAboutPage />} />
          <Route path="/campaigns" element={<SimpleAboutPage />} />
          <Route path="/contact" element={<SimpleAboutPage />} />
          <Route path="*" element={
            <div className="min-h-screen bg-warm-cream p-8">
              <h1 className="text-4xl font-bold text-red-600">❌ 404 - Page Not Found</h1>
              <p className="mt-4 text-gray-700">The page you're looking for doesn't exist.</p>
            </div>
          } />
        </Routes>
      </main>

      {/* Simple footer */}
      <footer className="bg-gray-900 text-white p-6 text-center">
        <p>&copy; 2025 DilSeDaan - Making a difference together</p>
      </footer>
    </div>
  )
}

export default App
