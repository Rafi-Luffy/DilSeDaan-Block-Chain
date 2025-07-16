const express = require('express');
const router = express.Router();
const securityMonitoring = require('../services/securityMonitoringService');
const { protect: auth } = require('../middleware/auth');

// Security middleware for all routes
router.use((req, res, next) => {
  // Rate limiting check
  const rateLimitResult = securityMonitoring.checkRateLimit(req.ip, req.path);
  
  if (!rateLimitResult.allowed) {
    return res.status(429).json({
      success: false,
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
    });
  }
  
  // Request integrity check
  const integrityResult = securityMonitoring.validateRequestIntegrity(req);
  
  if (!integrityResult.valid) {
    return res.status(400).json({
      success: false,
      message: 'Invalid request detected',
      failedChecks: integrityResult.failedChecks
    });
  }
  
  // Add rate limit headers
  res.set({
    'X-RateLimit-Remaining': rateLimitResult.remaining,
    'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
  });
  
  next();
});

// Get security dashboard (admin only)
router.get('/dashboard', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const dashboard = securityMonitoring.getSecurityDashboard();
    
    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    console.error('Error fetching security dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security dashboard'
    });
  }
});

// Get security events (admin only)
router.get('/events', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const { page = 1, limit = 50, severity, type, since } = req.query;
    const dashboard = securityMonitoring.getSecurityDashboard();
    
    let events = [...securityMonitoring.securityEvents];
    
    // Filter by severity
    if (severity) {
      events = events.filter(event => event.severity === severity.toUpperCase());
    }
    
    // Filter by type
    if (type) {
      events = events.filter(event => event.type === type);
    }
    
    // Filter by time
    if (since) {
      const sinceDate = new Date(since);
      events = events.filter(event => new Date(event.timestamp) >= sinceDate);
    }
    
    // Sort by timestamp (newest first)
    events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedEvents = events.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        events: paginatedEvents,
        pagination: {
          total: events.length,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(events.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching security events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security events'
    });
  }
});

// Unblock IP address (admin only)
router.post('/unblock-ip', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const { ip } = req.body;
    
    if (!ip) {
      return res.status(400).json({
        success: false,
        message: 'IP address is required'
      });
    }
    
    securityMonitoring.unblockIP(ip);
    
    // Log the action
    securityMonitoring.triggerSecurityAlert('IP_UNBLOCKED', {
      unblockedIP: ip,
      adminUser: req.user.id,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: `IP address ${ip} has been unblocked`
    });
  } catch (error) {
    console.error('Error unblocking IP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unblock IP address'
    });
  }
});

// Reset user security data (admin only)
router.post('/reset-user-security', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    securityMonitoring.resetUserSecurity(userId);
    
    // Log the action
    securityMonitoring.triggerSecurityAlert('USER_SECURITY_RESET', {
      targetUserId: userId,
      adminUser: req.user.id,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: `Security data for user ${userId} has been reset`
    });
  } catch (error) {
    console.error('Error resetting user security:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset user security data'
    });
  }
});

// Test security alert (admin only, for testing)
router.post('/test-alert', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const { type = 'TEST_ALERT', details = {} } = req.body;
    
    const alert = securityMonitoring.triggerSecurityAlert(type, {
      ...details,
      testMode: true,
      adminUser: req.user.id,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Test alert triggered successfully',
      alert
    });
  } catch (error) {
    console.error('Error triggering test alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger test alert'
    });
  }
});

// Get blocked IPs (admin only)
router.get('/blocked-ips', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const dashboard = securityMonitoring.getSecurityDashboard();
    
    res.json({
      success: true,
      data: {
        blockedIPs: dashboard.blockedIPs,
        count: dashboard.blockedIPs.length
      }
    });
  } catch (error) {
    console.error('Error fetching blocked IPs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blocked IPs'
    });
  }
});

// Security health check
router.get('/health', (req, res) => {
  const dashboard = securityMonitoring.getSecurityDashboard();
  
  res.json({
    success: true,
    data: {
      status: dashboard.systemStatus,
      threatLevel: dashboard.systemStatus.threatLevel,
      monitoring: dashboard.systemStatus.monitoring,
      lastUpdate: dashboard.systemStatus.lastUpdate
    }
  });
});

module.exports = router;
