// Mobile App Integration Route for React Native and PWA features
const express = require('express');
const router = express.Router();
const { protect: auth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for mobile API
const mobileLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute for mobile
  message: 'Too many mobile requests, please try again later.'
});

// Mobile app configuration
router.get('/config', mobileLimiter, async (req, res) => {
  try {
    const config = {
      appVersion: '1.0.0',
      minSupportedVersion: '1.0.0',
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:5000/api',
      features: {
        pushNotifications: true,
        biometricAuth: true,
        offlineMode: true,
        darkMode: true,
        socialSharing: true,
        qrCodeScanner: true,
        voiceSearch: false,
        augmentedReality: false
      },
      paymentMethods: {
        upi: true,
        cards: true,
        netBanking: true,
        wallets: ['paytm', 'phonepe', 'googlepay'],
        crypto: true
      },
      supportedLanguages: ['en', 'hi'],
      emergencyContact: '+91-9876543210',
      supportEmail: 'support@dilsedaan.org',
      privacyPolicyUrl: 'https://dilsedaan.org/privacy',
      termsOfServiceUrl: 'https://dilsedaan.org/terms'
    };

    res.json({
      success: true,
      data: config
    });

  } catch (error) {
    console.error('Mobile config error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch mobile configuration'
    });
  }
});

// PWA manifest and service worker endpoints
router.get('/manifest', async (req, res) => {
  try {
    const manifest = {
      name: 'DilSeDaan - Charity Platform',
      short_name: 'DilSeDaan',
      description: 'India\'s most trusted charity donation platform',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#1f2937',
      orientation: 'portrait-primary',
      scope: '/',
      lang: 'en',
      icons: [
        {
          src: '/images/icon-72x72.png',
          sizes: '72x72',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/images/icon-96x96.png',
          sizes: '96x96',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/images/icon-128x128.png',
          sizes: '128x128',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/images/icon-144x144.png',
          sizes: '144x144',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/images/icon-152x152.png',
          sizes: '152x152',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/images/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/images/icon-384x384.png',
          sizes: '384x384',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/images/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ],
      categories: ['social', 'finance', 'lifestyle'],
      shortcuts: [
        {
          name: 'Donate Now',
          short_name: 'Donate',
          description: 'Make a quick donation',
          url: '/campaigns',
          icons: [{ src: '/images/donate-icon.png', sizes: '192x192' }]
        },
        {
          name: 'Emergency',
          short_name: 'Emergency',
          description: 'Emergency campaigns',
          url: '/campaigns?category=emergency',
          icons: [{ src: '/images/emergency-icon.png', sizes: '192x192' }]
        },
        {
          name: 'My Donations',
          short_name: 'Donations',
          description: 'View donation history',
          url: '/profile/donations',
          icons: [{ src: '/images/history-icon.png', sizes: '192x192' }]
        }
      ],
      screenshots: [
        {
          src: '/images/screenshot-1.png',
          sizes: '540x720',
          type: 'image/png',
          platform: 'narrow'
        },
        {
          src: '/images/screenshot-2.png',
          sizes: '720x540',
          type: 'image/png',
          platform: 'wide'
        }
      ]
    };

    res.setHeader('Content-Type', 'application/manifest+json');
    res.json(manifest);

  } catch (error) {
    console.error('Manifest error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to generate manifest'
    });
  }
});

// Mobile-optimized campaign list
router.get('/campaigns', auth, mobileLimiter, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category || '';
    const location = req.query.location || '';

    // Mobile-optimized campaign data with smaller image sizes
    const campaigns = [
      {
        _id: '1',
        title: 'Help Raj fight cancer',
        description: 'Urgent medical support needed for cancer treatment...',
        goalAmount: 500000,
        raisedAmount: 125000,
        category: 'medical',
        images: [{ url: '/images/image_1.png', thumbnail: '/images/thumb_1.png' }],
        location: { city: 'Mumbai', state: 'Maharashtra' },
        creator: { name: 'Priya Sharma', verified: true },
        donorCount: 45,
        daysLeft: 25,
        isUrgent: true,
        tags: ['cancer', 'medical', 'urgent']
      }
      // More mobile-optimized campaigns...
    ];

    res.json({
      success: true,
      data: campaigns,
      pagination: {
        currentPage: page,
        totalPages: 5,
        totalResults: 50,
        hasNext: page < 5,
        hasPrev: page > 1
      },
      mobileOptimized: true
    });

  } catch (error) {
    console.error('Mobile campaigns error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch campaigns'
    });
  }
});

// Mobile payment initialization
router.post('/payment/init', auth, async (req, res) => {
  try {
    const { campaignId, amount, paymentMethod } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!campaignId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid campaign ID and amount are required'
      });
    }

    // Mobile-specific payment configuration
    const paymentConfig = {
      orderId: `mob_${Date.now()}_${userId}`,
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${campaignId}_${Date.now()}`,
      payment_capture: 1,
      notes: {
        campaignId,
        userId,
        source: 'mobile_app',
        paymentMethod
      }
    };

    // Mobile-optimized response
    res.json({
      success: true,
      data: {
        paymentConfig,
        razorpayKey: process.env.RAZORPAY_KEY_ID,
        mobileConfig: {
          theme: {
            color: '#1f2937',
            backdrop_color: 'rgba(0,0,0,0.7)'
          },
          modal: {
            confirm_close: true,
            ondismiss: 'close'
          },
          external: {
            wallets: ['paytm', 'phonepe', 'googlepay']
          }
        }
      }
    });

  } catch (error) {
    console.error('Mobile payment init error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to initialize payment'
    });
  }
});

// Mobile biometric authentication setup
router.post('/auth/biometric', auth, async (req, res) => {
  try {
    const { biometricData, deviceId } = req.body;
    const userId = req.user.id;

    // In a real implementation, store biometric template securely
    // For now, just return success
    res.json({
      success: true,
      message: 'Biometric authentication setup successful',
      data: {
        biometricId: `bio_${userId}_${deviceId}`,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });

  } catch (error) {
    console.error('Biometric setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to setup biometric authentication'
    });
  }
});

// Mobile offline sync
router.post('/sync', auth, async (req, res) => {
  try {
    const { offlineActions, lastSyncTime } = req.body;
    const userId = req.user.id;

    const syncResults = [];
    
    // Process offline actions
    for (const action of offlineActions || []) {
      try {
        // Process based on action type
        switch (action.type) {
          case 'bookmark_campaign':
            // Add to bookmarks
            syncResults.push({ 
              id: action.id, 
              status: 'success', 
              message: 'Campaign bookmarked' 
            });
            break;
          case 'share_campaign':
            // Log share action
            syncResults.push({ 
              id: action.id, 
              status: 'success', 
              message: 'Share tracked' 
            });
            break;
          default:
            syncResults.push({ 
              id: action.id, 
              status: 'skipped', 
              message: 'Unknown action type' 
            });
        }
      } catch (actionError) {
        syncResults.push({ 
          id: action.id, 
          status: 'failed', 
          message: actionError.message 
        });
      }
    }

    // Return updated data since last sync
    const updatedData = {
      campaigns: [], // New/updated campaigns
      notifications: [], // New notifications
      userProfile: {}, // Updated profile data
      settings: {} // Updated settings
    };

    res.json({
      success: true,
      data: {
        syncResults,
        updatedData,
        syncTime: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Mobile sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to sync offline data'
    });
  }
});

// Mobile app analytics
router.post('/analytics', auth, async (req, res) => {
  try {
    const { events } = req.body;
    const userId = req.user.id;

    // Process analytics events from mobile app
    for (const event of events || []) {
      console.log(`Mobile Analytics - User: ${userId}, Event: ${event.name}, Data:`, event.data);
      
      // In a real implementation, store in analytics database
      // await AnalyticsEvent.create({
      //   userId,
      //   eventName: event.name,
      //   eventData: event.data,
      //   timestamp: event.timestamp || new Date(),
      //   source: 'mobile_app'
      // });
    }

    res.json({
      success: true,
      message: 'Analytics events processed'
    });

  } catch (error) {
    console.error('Mobile analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to process analytics'
    });
  }
});

// Mobile device registration
router.post('/device/register', auth, async (req, res) => {
  try {
    const { deviceInfo } = req.body;
    const userId = req.user.id;

    // Store device information for user
    const deviceData = {
      userId,
      deviceId: deviceInfo.deviceId,
      platform: deviceInfo.platform,
      version: deviceInfo.version,
      model: deviceInfo.model,
      pushToken: deviceInfo.pushToken,
      registeredAt: new Date()
    };

    // In a real implementation, store in database
    // await UserDevice.create(deviceData);

    res.json({
      success: true,
      message: 'Device registered successfully',
      data: {
        deviceId: deviceData.deviceId,
        supportedFeatures: {
          pushNotifications: true,
          biometricAuth: deviceInfo.platform !== 'web',
          camera: deviceInfo.platform !== 'web',
          location: true,
          contacts: deviceInfo.platform !== 'web'
        }
      }
    });

  } catch (error) {
    console.error('Device registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to register device'
    });
  }
});

// Mobile app update check
router.get('/update', async (req, res) => {
  try {
    const currentVersion = req.query.version || '1.0.0';
    const platform = req.query.platform || 'android';

    const updateInfo = {
      latestVersion: '1.0.0',
      updateAvailable: false,
      isRequired: false,
      updateUrl: '',
      releaseNotes: [],
      features: []
    };

    // Check if update is available
    if (currentVersion < updateInfo.latestVersion) {
      updateInfo.updateAvailable = true;
      updateInfo.updateUrl = platform === 'ios' 
        ? 'https://apps.apple.com/app/dilsedaan'
        : 'https://play.google.com/store/apps/details?id=org.dilsedaan.app';
      
      updateInfo.releaseNotes = [
        'Improved donation flow',
        'New emergency campaign alerts',
        'Better offline support',
        'Performance improvements'
      ];
    }

    res.json({
      success: true,
      data: updateInfo
    });

  } catch (error) {
    console.error('Update check error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to check for updates'
    });
  }
});

// Mobile emergency contacts
router.get('/emergency', async (req, res) => {
  try {
    const emergencyContacts = [
      {
        name: 'DilSeDaan Support',
        phone: '+91-9876543210',
        email: 'support@dilsedaan.org',
        type: 'support'
      },
      {
        name: 'Emergency Helpline',
        phone: '112',
        type: 'emergency'
      },
      {
        name: 'Women Helpline',
        phone: '1091',
        type: 'emergency'
      },
      {
        name: 'Child Helpline',
        phone: '1098',
        type: 'emergency'
      }
    ];

    res.json({
      success: true,
      data: emergencyContacts
    });

  } catch (error) {
    console.error('Emergency contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch emergency contacts'
    });
  }
});

module.exports = router;
