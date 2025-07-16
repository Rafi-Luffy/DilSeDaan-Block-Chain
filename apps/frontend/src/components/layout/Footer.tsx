import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Shield, Users, Globe } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white relative">
      {/* Subtle gradient line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-green-500 to-orange-500"></div>
      
      <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="currentColor" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold">DilSeDaan</h3>
                <p className="text-xs sm:text-sm text-gray-400">Empowering Change Through Transparency</p>
              </div>
            </div>
            
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              A blockchain-powered charity platform built for transparency, trust, and real impact. 
              Every donation is tracked, every story matters, every rupee counts.
            </p>
            
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Platform</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/campaigns" className="text-gray-300 hover:text-white transition-colors">
                  Browse Campaigns
                </Link>
              </li>
              <li>
                <Link to="/create-campaign" className="text-gray-300 hover:text-white transition-colors">
                  Start a Campaign
                </Link>
              </li>
              <li>
                <Link to="/impact" className="text-gray-300 hover:text-white transition-colors">
                  Impact Reports
                </Link>
              </li>
              <li>
                <Link to="/transparency" className="text-gray-300 hover:text-white transition-colors">
                  Transparency Center
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  Donor Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Trust */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Get in Touch</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-orange-500" />
                <span className="text-gray-300">dilsedaan.charity@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-orange-500" />
                <span className="text-gray-300">+91 7671966605</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-orange-500" />
                <span className="text-gray-300">Mumbai, Maharashtra, India</span>
              </div>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                <Shield className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Blockchain Secured</p>
                  <p className="text-xs text-gray-400">Transparent & Immutable</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Government Compliant</p>
                  <p className="text-xs text-gray-400">80G Tax Benefits Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 sm:mt-12 lg:mt-16 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <p className="text-gray-400 text-xs sm:text-sm">
                © 2025 DilSeDaan. All rights reserved.
              </p>
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-green-500" />
                <span className="text-xs sm:text-sm text-gray-400">Made in India with ❤️</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-6 text-xs sm:text-sm text-gray-400">
              <span>ISO 27001 Compliant</span>
              <span className="hidden sm:inline">•</span>
              <span>GDPR Ready</span>
              <span className="hidden sm:inline">•</span>
              <span>PCI DSS Level 1</span>
            </div>
          </div>
          
          {/* Mission Statement */}
          <div className="text-center mt-8 p-6 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg">
            <p className="text-gray-300 italic">
              "Bridging the gap between generosity and genuine need through technology, transparency, and trust."
            </p>
            <p className="text-gray-400 text-sm mt-2">- DilSeDaan Mission</p>
          </div>
        </div>
      </div>
    </footer>
  )
}