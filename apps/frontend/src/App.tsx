import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import '@/i18n'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PerformanceMonitor } from '@/components/PerformanceMonitor'
import { HomePage } from '@/pages/HomePage'
import { StoriesPage } from '@/pages/StoriesPage'
import DonatePage from '@/pages/DonatePage'
import { DashboardPage } from '@/pages/DashboardPage'
import UserDashboard from '@/pages/UserDashboard'
import { TransparencyPage } from '@/pages/TransparencyPage'
import { ImpactPage } from '@/pages/ImpactPage'
import { AboutPage } from '@/pages/AboutPage'
import { ContactPage } from '@/pages/ContactPage'
import { VolunteerPage } from '@/pages/VolunteerPage'
import AdminPage from '@/pages/AdminPage'
import { BlockchainPage } from '@/pages/BlockchainPage'
import { AuditPage } from '@/pages/AuditPage'
import { IPFSDocumentsPage } from '@/pages/IPFSDocumentsPage'
import { MilestonePage } from '@/pages/MilestonePage'
import { SmartContractPage } from '@/pages/SmartContractPage'
import { CreateCampaignPageNew } from '@/pages/CreateCampaignPageNew'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { AdvancedSearchPage } from '@/pages/AdvancedSearchPage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { AIFeaturesPage } from '@/pages/AIFeaturesPage'
import { AdvancedFeaturesPage } from '@/pages/AdvancedFeaturesPage'
import { SecurityPage } from '@/pages/SecurityPage'
import { StatusDashboardPage } from '@/pages/StatusDashboardPage'
import SystemHealthPage from '@/pages/SystemHealthPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import FAQPage from '@/pages/FAQPage'
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage'
import TermsOfServicePage from '@/pages/TermsOfServicePage'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import TestAPIPage from '@/pages/TestAPIPage'
import { TrackProgressPage } from '@/pages/TrackProgressPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function App() {
  return (
    <div className="min-h-screen bg-warm-cream">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create-campaign" element={
            <ProtectedRoute>
              <CreateCampaignPageNew />
            </ProtectedRoute>
          } />
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/my-dashboard" element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/transparency" element={<TransparencyPage />} />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/volunteer" element={<VolunteerPage />} />
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminPage />
            </ProtectedRoute>
          } />
          <Route path="/blockchain" element={<BlockchainPage />} />
          <Route path="/audit" element={<AuditPage />} />
          <Route path="/documents" element={<IPFSDocumentsPage />} />
          <Route path="/milestones" element={<MilestonePage />} />
          <Route path="/smart-contracts" element={<SmartContractPage />} />
          <Route path="/analytics" element={
            <ProtectedRoute requiredRole="admin">
              <AnalyticsPage />
            </ProtectedRoute>
          } />
          <Route path="/advanced" element={<AdvancedFeaturesPage />} />
          <Route path="/search" element={<AdvancedSearchPage />} />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          } />
          <Route path="/ai-features" element={
            <ProtectedRoute>
              <AIFeaturesPage />
            </ProtectedRoute>
          } />
          <Route path="/security" element={
            <ProtectedRoute>
              <SecurityPage />
            </ProtectedRoute>
          } />
          <Route path="/status" element={<StatusDashboardPage />} />
          <Route path="/system-health" element={
            <ProtectedRoute requiredRole="admin">
              <SystemHealthPage />
            </ProtectedRoute>
          } />
          <Route path="/test-api" element={<TestAPIPage />} />
          <Route path="/track-progress" element={
            <ProtectedRoute>
              <TrackProgressPage />
            </ProtectedRoute>
          } />
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600 mb-8">Page not found</p>
                <a href="/" className="text-orange-500 hover:text-orange-600 font-medium">
                  Go back home
                </a>
              </div>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}

export default App