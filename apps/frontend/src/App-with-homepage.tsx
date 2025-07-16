import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HomePage } from '@/pages/HomePage'

function App() {
  return (
    <div className="min-h-screen bg-warm-cream">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={
            <div className="min-h-screen bg-warm-cream p-8">
              <h1 className="text-4xl font-bold text-orange-600">ℹ️ About DilSeDaan</h1>
              <p className="mt-4 text-gray-700">About our charity platform</p>
            </div>
          } />
          <Route path="*" element={
            <div className="min-h-screen bg-warm-cream p-8">
              <h1 className="text-4xl font-bold text-red-600">❌ 404 - Page Not Found</h1>
              <p className="mt-4 text-gray-700">The page you're looking for doesn't exist.</p>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
