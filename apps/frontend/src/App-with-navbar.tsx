import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'

// Simple test components first
function SimpleHomePage() {
  return (
    <div className="min-h-screen bg-warm-cream p-8">
      <h1 className="text-4xl font-bold text-orange-600">🏠 DilSeDaan - Home</h1>
      <p className="mt-4 text-gray-700">Welcome to DilSeDaan Charity Platform</p>
      <div className="mt-6 space-y-2">
        <p>✅ Home page working</p>
        <p>✅ Real Navbar component loaded</p>
        <p>✅ Basic styling working</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <div className="min-h-screen bg-warm-cream">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<SimpleHomePage />} />
          <Route path="/about" element={<SimpleHomePage />} />
          <Route path="/campaigns" element={<SimpleHomePage />} />
          <Route path="/contact" element={<SimpleHomePage />} />
          <Route path="*" element={
            <div className="min-h-screen bg-warm-cream p-8">
              <h1 className="text-4xl font-bold text-red-600">❌ 404 - Page Not Found</h1>
              <p className="mt-4 text-gray-700">The page you're looking for doesn't exist.</p>
            </div>
          } />
        </Routes>
      </main>
    </div>
  )
}

export default App
