import React from 'react'
import { Routes, Route } from 'react-router-dom'

function TestHomePage() {
  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <h1 className="text-4xl font-bold text-blue-600">🏠 Home Page - Test</h1>
      <p className="mt-4 text-gray-700">If you can see this, routing is working!</p>
      <div className="mt-6 space-y-2">
        <p>✅ React Router is functioning</p>
        <p>✅ Home route is accessible</p>
        <p>✅ Basic components are rendering</p>
      </div>
    </div>
  )
}

function TestAboutPage() {
  return (
    <div className="min-h-screen bg-green-50 p-8">
      <h1 className="text-4xl font-bold text-green-600">ℹ️ About Page - Test</h1>
      <p className="mt-4 text-gray-700">About page is working!</p>
    </div>
  )
}

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-red-50 p-8">
      <h1 className="text-4xl font-bold text-red-600">❌ 404 - Page Not Found</h1>
      <p className="mt-4 text-gray-700">The page you're looking for doesn't exist.</p>
    </div>
  )
}

function App() {
  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-sm border-b p-4">
        <div className="flex space-x-4">
          <a href="/" className="text-blue-600 hover:text-blue-800">Home</a>
          <a href="/about" className="text-blue-600 hover:text-blue-800">About</a>
          <a href="/contact" className="text-blue-600 hover:text-blue-800">Contact</a>
        </div>
      </nav>
      
      <Routes>
        <Route path="/" element={<TestHomePage />} />
        <Route path="/about" element={<TestAboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}

export default App
