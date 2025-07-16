import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Heart, User, Wallet, ChevronDown, Shield, Search, Bell, Smartphone, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { useWeb3Store } from '@/store/web3Store'
import { useAuthStore } from '@/store/authStore'
import { LoginModal } from '@/components/auth/LoginModal'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { isConnected, account, connectWallet, disconnectWallet, initializeWeb3 } = useWeb3Store()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { t } = useTranslation()
  const location = useLocation()

  // Role-based navigation items
  const getNavItems = () => {
    const baseItems = [
      { href: '/', label: t('navigation.home') },
      { href: '/stories', label: t('navigation.stories') },
      { href: '/campaigns', label: t('navigation.campaigns') },
      { href: '/impact', label: t('navigation.impact') },
      { href: '/transparency', label: t('navigation.transparency') },
      { href: '/contact', label: t('navigation.contact') },
    ]

    if (isAuthenticated && user?.role === 'admin') {
      return [
        ...baseItems,
        { href: '/admin', label: t('navigation.admin') },
        { href: '/volunteer', label: t('navigation.volunteer') },
        { href: '/about', label: t('navigation.about') },
      ]
    } else {
      return [
        ...baseItems,
        { href: '/volunteer', label: t('navigation.volunteer') },
        { href: '/about', label: t('navigation.about') },
      ]
    }
  }

  const navItems = getNavItems()

  // Initialize web3 on component mount
  React.useEffect(() => {
    initializeWeb3()
  }, [initializeWeb3])

  const handleWalletAction = async () => {
    if (isConnected) {
      disconnectWallet()
    } else {
      try {
        await connectWallet()
      } catch (error) {
        console.error('Failed to connect wallet:', error)
      }
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Simple and Clean */}
          <Link to="/" className="flex items-center space-x-2 group flex-shrink-0">
            <div className="h-8 w-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
              <Heart className="h-4 w-4 text-white" fill="currentColor" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-gray-900">DilSeDaan</span>
              <span className="text-xs text-orange-500">दिल से ❤️</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 flex-1 justify-center ml-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-orange-500',
                  location.pathname === item.href
                    ? 'text-orange-500'
                    : 'text-gray-700'
                )}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Advanced Features Link (without Brain icon) */}
            <Link
              to="/advanced"
              className={cn(
                'text-sm font-medium transition-colors hover:text-orange-500',
                location.pathname.startsWith('/advanced') || 
                location.pathname === '/search' ||
                location.pathname === '/notifications' ||
                location.pathname === '/ai-features' ||
                location.pathname === '/mobile' ||
                location.pathname === '/analytics'
                  ? 'text-orange-500'
                  : 'text-gray-700'
              )}
            >
              Advanced
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Authentication */}
            {isAuthenticated ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user?.name?.split(' ')[0] || 'User'}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                      {user?.role === 'admin' ? t('navigation.administrator') : t('navigation.user')}
                    </div>
                    {user?.role !== 'admin' && (
                      <Link
                        to="/my-dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="inline h-4 w-4 mr-2" />
                        My Dashboard
                      </Link>
                    )}
                    {user?.role === 'admin' && (                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Shield className="inline h-4 w-4 mr-2" />
                          {t('navigation.adminPanel')}
                        </Link>
                    )}
                    {user?.role !== 'admin' && (                        <Link
                          to="/create-campaign"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Heart className="inline h-4 w-4 mr-2" />
                          {t('navigation.startCampaign')}
                        </Link>
                    )}
                    <div className="border-t border-gray-100 mt-1"></div>
                    <button
                      onClick={() => {
                        logout()
                        setShowUserMenu(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <X className="inline h-4 w-4 mr-2" />
                      {t('navigation.signOut')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                onClick={() => setShowLoginModal(true)}
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1"
              >
                <User className="h-4 w-4" />
                <span>{t('auth.login.button')}</span>
              </Button>
            )}

            {/* Wallet Connection */}
            <Button
              onClick={handleWalletAction}
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center space-x-2"
            >
              <Wallet className="h-4 w-4" />
              <span className="text-sm">
                {isConnected 
                  ? `${account?.substring(0, 6)}...${account?.substring(account.length - 4)}`
                  : t('auth.wallet.connect')
                }
              </span>
            </Button>

            {/* Donate Button */}
            <Button
              asChild
              className="bg-orange-500 hover:bg-orange-600 text-white"
              size="sm"
            >
              <Link to="/donate">
                <Heart className="h-4 w-4 mr-1" fill="currentColor" />
                {t('navigation.donate')}
              </Link>
            </Button>

            {/* Mobile menu button */}
            <Button
              onClick={() => setIsOpen(!isOpen)}
              variant="ghost"
              size="sm"
              className="md:hidden"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'block px-4 py-3 text-base font-medium rounded-lg transition-colors',
                    location.pathname === item.href
                      ? 'text-orange-500 bg-orange-50'
                      : 'text-gray-700 hover:text-orange-500 hover:bg-gray-50'
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Advanced Features in Mobile (without Brain icon) */}
              <Link
                to="/advanced"
                className={cn(
                  'block px-4 py-3 text-base font-medium rounded-lg transition-colors',
                  location.pathname.startsWith('/advanced') ||
                  location.pathname === '/search' ||
                  location.pathname === '/notifications' ||
                  location.pathname === '/ai-features' ||
                  location.pathname === '/mobile' ||
                  location.pathname === '/analytics'
                    ? 'text-orange-500 bg-orange-50'
                    : 'text-gray-700 hover:text-orange-500 hover:bg-gray-50'
                )}
                onClick={() => setIsOpen(false)}
              >
                Advanced Features
              </Link>
              
              {/* Mobile Actions */}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-2 text-sm text-gray-500">
                      {t('navigation.signedInAs')} {user?.name} ({user?.role === 'admin' ? t('navigation.administrator') : t('navigation.user')})
                    </div>
                    {user?.role !== 'admin' && (
                      <Button
                        asChild
                        variant="outline"
                        className="w-full"
                      >
                        <Link to="/my-dashboard" onClick={() => setIsOpen(false)}>
                          <User className="h-4 w-4 mr-2" />
                          My Dashboard
                        </Link>
                      </Button>
                    )}
                    {user?.role !== 'admin' && (
                      <Button
                        asChild
                        variant="outline"
                        className="w-full"
                      >
                        <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                          <User className="h-4 w-4 mr-2" />
                          {t('navigation.dashboard')}
                        </Link>
                      </Button>
                    )}
                    {user?.role === 'admin' && (
                      <Button
                        asChild
                        variant="outline"
                        className="w-full"
                      >
                        <Link to="/admin" onClick={() => setIsOpen(false)}>
                          <Shield className="h-4 w-4 mr-2" />
                          {t('navigation.adminPanel')}
                        </Link>
                      </Button>
                    )}
                    {user?.role !== 'admin' && (
                      <Button
                        asChild
                        variant="outline"
                        className="w-full"
                      >
                        <Link to="/create-campaign" onClick={() => setIsOpen(false)}>
                          <Heart className="h-4 w-4 mr-2" />
                          {t('navigation.startCampaign')}
                        </Link>
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        logout()
                        setIsOpen(false)
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      <X className="h-4 w-4 mr-2" />
                      {t('navigation.signOut')}
                    </Button>
                  </>
                ) : (                    <Button
                      onClick={() => {
                        setShowLoginModal(true)
                        setIsOpen(false)
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      <User className="h-4 w-4 mr-2" />
                      {t('navigation.signIn')}
                    </Button>
                )}                  <Button
                    onClick={handleWalletAction}
                    variant="outline"
                    className="w-full"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    {isConnected 
                      ? `${account?.substring(0, 6)}...${account?.substring(account.length - 4)}`
                      : t('navigation.connectWallet')
                    }
                  </Button>                  <Button
                    asChild
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Link to="/donate" onClick={() => setIsOpen(false)}>
                      <Heart className="h-4 w-4 mr-2" fill="currentColor" />
                      {t('navigation.donate')}
                    </Link>
                  </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/50">
          <div className="relative w-full max-w-md">
            <LoginModal 
              isOpen={showLoginModal} 
              onClose={() => setShowLoginModal(false)} 
            />
          </div>
        </div>
      )}
    </nav>
  )
}