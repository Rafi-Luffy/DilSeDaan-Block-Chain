import React from 'react'

// Google Pay Icon Component - Using SVG representation of the actual logo
export const GooglePayIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 48 48" className={className}>
    <rect width="48" height="48" rx="8" fill="white"/>
    <g transform="translate(6, 12)">
      <path d="M17.76 17.66A7.58 7.58 0 0 1 12 21c-4.42 0-8-3.58-8-8s3.58-8 8-8c2.06 0 3.81.74 5.21 2.06l-2.12 2.12A5.01 5.01 0 0 0 12 7c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.22 0 4.15-1.2 5.18-2.99H12v-2.82h8.93c.08.42.12.86.12 1.32 0 3.31-1.33 6.28-3.47 8.15z" fill="#4285f4"/>
      <path d="M32 17h-3v-3h-2v3h-3v2h3v3h2v-3h3v-2z" fill="#34a853"/>
      <path d="M24 9c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" fill="#ea4335"/>
      <path d="M33 21c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2s2 .9 2 2v8c0 1.1-.9 2-2 2z" fill="#fbbc05"/>
    </g>
  </svg>
)

// PhonePe Icon Component - Using actual PhonePe logo colors and style
export const PhonePeIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 48 48" className={className}>
    <rect width="48" height="48" rx="8" fill="#5f259f"/>
    <g transform="translate(8, 8)">
      <path d="M0 24V8h8c5.33 0 9.33 4 9.33 9.33S13.33 26.67 8 26.67H4V32H0zm4-6.67h4c2.67 0 4.67-2 4.67-4.67S10.67 8 8 8H4v9.33z" fill="white"/>
      <circle cx="22" cy="16" r="3" fill="white"/>
      <path d="M28 20l-4 4 4 4 4-4-4-4z" fill="white"/>
    </g>
  </svg>
)

// Paytm Icon Component - Using actual Paytm logo design
export const PaytmIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 48 48" className={className}>
    <rect width="48" height="48" rx="8" fill="#00baf2"/>
    <g transform="translate(8, 12)">
      <text x="16" y="6" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial">Paytm</text>
      <rect x="2" y="10" width="28" height="2" fill="white"/>
      <rect x="2" y="14" width="28" height="2" fill="white"/>
      <rect x="2" y="18" width="20" height="2" fill="white"/>
      <circle cx="26" cy="19" r="3" fill="white"/>
    </g>
  </svg>
)

// Amazon Pay Icon Component - Using actual Amazon Pay logo design
export const AmazonPayIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 48 48" className={className}>
    <rect width="48" height="48" rx="8" fill="#ff9900"/>
    <g transform="translate(4, 12)">
      <text x="20" y="8" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="Arial">amazon</text>
      <text x="20" y="20" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold" fontFamily="Arial">Pay</text>
      <path d="M8 22c8 4 24 4 32 0" stroke="white" strokeWidth="2" fill="none"/>
    </g>
  </svg>
)

// BHIM Icon Component - Using actual BHIM logo design
export const BHIMIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 48 48" className={className}>
    <defs>
      <linearGradient id="bhimGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff6b35"/>
        <stop offset="50%" stopColor="#f7931e"/>
        <stop offset="100%" stopColor="#fff200"/>
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="8" fill="url(#bhimGradient)"/>
    <g transform="translate(8, 8)">
      <text x="16" y="8" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial">BHIM</text>
      <rect x="4" y="12" width="24" height="12" rx="3" fill="white"/>
      <circle cx="10" cy="18" r="2" fill="#ff6b35"/>
      <circle cx="22" cy="18" r="2" fill="#ff6b35"/>
      <path d="M6 26h20" stroke="#ff6b35" strokeWidth="2"/>
    </g>
  </svg>
)

// MobiKwik Icon Component - Using actual MobiKwik logo design
export const MobiKwikIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 48 48" className={className}>
    <rect width="48" height="48" rx="8" fill="#2e75b6"/>
    <g transform="translate(6, 12)">
      <text x="18" y="8" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold" fontFamily="Arial">mobikwik</text>
      <rect x="4" y="12" width="28" height="8" rx="4" fill="white"/>
      <circle cx="12" cy="16" r="1.5" fill="#2e75b6"/>
      <circle cx="18" cy="16" r="1.5" fill="#2e75b6"/>
      <circle cx="24" cy="16" r="1.5" fill="#2e75b6"/>
      <text x="18" y="26" textAnchor="middle" fill="white" fontSize="4" fontWeight="bold" fontFamily="Arial">Wallet</text>
    </g>
  </svg>
)

// Freecharge Icon Component - Using actual Freecharge logo design
export const FreechargeIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 48 48" className={className}>
    <rect width="48" height="48" rx="8" fill="#7b68ee"/>
    <g transform="translate(6, 12)">
      <text x="18" y="8" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold" fontFamily="Arial">Freecharge</text>
      <path d="M8 14l20-3v4l-20 3zm20 4l-20 3v4l20-3z" fill="white"/>
      <circle cx="18" cy="22" r="2" fill="white"/>
    </g>
  </svg>
)

// CRED Icon Component - Using actual CRED logo design
export const CREDIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 48 48" className={className}>
    <rect width="48" height="48" rx="8" fill="#0a0a0a"/>
    <g transform="translate(8, 12)">
      <text x="16" y="10" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial">CRED</text>
      <rect x="6" y="14" width="20" height="8" rx="4" fill="#00ff88"/>
      <text x="16" y="19" textAnchor="middle" fill="black" fontSize="5" fontWeight="bold" fontFamily="Arial">PAY</text>
    </g>
  </svg>
)

// Slice Icon Component - Using actual Slice logo design
export const SliceIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 48 48" className={className}>
    <defs>
      <linearGradient id="sliceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1"/>
        <stop offset="100%" stopColor="#8b5cf6"/>
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="8" fill="url(#sliceGradient)"/>
    <g transform="translate(8, 12)">
      <text x="16" y="10" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial">slice</text>
      <path d="M4 14h24l-6 8H10z" fill="white"/>
      <circle cx="16" cy="18" r="1.5" fill="#6366f1"/>
    </g>
  </svg>
)

// Jupiter Icon Component - Adding popular UPI app
export const JupiterIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 48 48" className={className}>
    <rect width="48" height="48" rx="8" fill="#ff6b35"/>
    <g transform="translate(8, 12)">
      <circle cx="16" cy="12" r="8" fill="white"/>
      <circle cx="16" cy="12" r="4" fill="#ff6b35"/>
      <text x="16" y="22" textAnchor="middle" fill="white" fontSize="5" fontWeight="bold" fontFamily="Arial">Jupiter</text>
    </g>
  </svg>
)

// More Apps Icon with additional popular apps
export const MoreAppsIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 48 48" className={className}>
    <rect width="48" height="48" rx="8" fill="#6b7280"/>
    <g transform="translate(8, 8)">
      <circle cx="6" cy="6" r="3" fill="white"/>
      <circle cx="26" cy="6" r="3" fill="white"/>
      <circle cx="6" cy="26" r="3" fill="white"/>
      <circle cx="26" cy="26" r="3" fill="white"/>
      <circle cx="16" cy="16" r="3" fill="white"/>
      <text x="16" y="30" textAnchor="middle" fill="white" fontSize="5" fontWeight="bold" fontFamily="Arial">+50 More</text>
    </g>
  </svg>
)
