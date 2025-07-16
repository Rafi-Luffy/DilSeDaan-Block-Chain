const crypto = require('crypto');
const jwt = require('jsonwebtoken');

class SecurityMonitoringService {
  constructor() {
    this.suspiciousActivities = new Map();
    this.ipBlacklist = new Set();
    this.rateLimit = new Map();
    this.securityEvents = [];
    this.alertThresholds = {
      failedLoginAttempts: 5,
      suspiciousRequests: 10,
      unusualDonationPatterns: 3
    };
  }

  // Monitor login attempts
  trackLoginAttempt(ip, success, userId = null) {
    const key = `login_${ip}`;
    const now = Date.now();
    
    if (!this.suspiciousActivities.has(key)) {
      this.suspiciousActivities.set(key, []);
    }
    
    const attempts = this.suspiciousActivities.get(key);
    attempts.push({ timestamp: now, success, userId });
    
    // Keep only last 1 hour of attempts
    const oneHourAgo = now - (60 * 60 * 1000);
    this.suspiciousActivities.set(key, 
      attempts.filter(attempt => attempt.timestamp > oneHourAgo)
    );
    
    // Check for suspicious patterns
    const recentFailures = attempts.filter(
      attempt => !attempt.success && attempt.timestamp > (now - 15 * 60 * 1000)
    ).length;
    
    if (recentFailures >= this.alertThresholds.failedLoginAttempts) {
      this.triggerSecurityAlert('MULTIPLE_FAILED_LOGINS', { ip, attempts: recentFailures });
      this.ipBlacklist.add(ip);
    }
    
    return {
      blocked: this.ipBlacklist.has(ip),
      remainingAttempts: Math.max(0, this.alertThresholds.failedLoginAttempts - recentFailures)
    };
  }

  // Monitor donation patterns
  trackDonation(userId, amount, campaignId, ip) {
    const key = `donation_${userId}`;
    const now = Date.now();
    
    if (!this.suspiciousActivities.has(key)) {
      this.suspiciousActivities.set(key, []);
    }
    
    const donations = this.suspiciousActivities.get(key);
    donations.push({ timestamp: now, amount, campaignId, ip });
    
    // Keep only last 24 hours
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    this.suspiciousActivities.set(key, 
      donations.filter(donation => donation.timestamp > oneDayAgo)
    );
    
    // Check for unusual patterns
    const recentDonations = donations.filter(
      donation => donation.timestamp > (now - 60 * 60 * 1000) // Last hour
    );
    
    const suspiciousPatterns = this.detectSuspiciousDonationPatterns(recentDonations);
    
    if (suspiciousPatterns.length > 0) {
      this.triggerSecurityAlert('SUSPICIOUS_DONATION_PATTERN', {
        userId,
        patterns: suspiciousPatterns,
        recentDonations: recentDonations.length
      });
    }
    
    return { flagged: suspiciousPatterns.length > 0, patterns: suspiciousPatterns };
  }

  // Detect suspicious donation patterns
  detectSuspiciousDonationPatterns(donations) {
    const patterns = [];
    
    // Multiple large donations in short time
    const largeDonations = donations.filter(d => d.amount > 10000);
    if (largeDonations.length >= 3) {
      patterns.push('MULTIPLE_LARGE_DONATIONS');
    }
    
    // Rapid successive donations
    if (donations.length >= 5) {
      patterns.push('RAPID_DONATIONS');
    }
    
    // Same amount repeated donations
    const amounts = donations.map(d => d.amount);
    const duplicateAmounts = amounts.filter((amount, index) => 
      amounts.indexOf(amount) !== index
    );
    if (duplicateAmounts.length >= 3) {
      patterns.push('REPEATED_AMOUNTS');
    }
    
    return patterns;
  }

  // Rate limiting
  checkRateLimit(ip, endpoint) {
    const key = `rate_${ip}_${endpoint}`;
    const now = Date.now();
    const windowSize = 60 * 1000; // 1 minute
    const maxRequests = 100; // Adjust based on endpoint
    
    if (!this.rateLimit.has(key)) {
      this.rateLimit.set(key, []);
    }
    
    const requests = this.rateLimit.get(key);
    requests.push(now);
    
    // Remove old requests
    const validRequests = requests.filter(timestamp => 
      now - timestamp < windowSize
    );
    this.rateLimit.set(key, validRequests);
    
    const exceeded = validRequests.length > maxRequests;
    
    if (exceeded) {
      this.triggerSecurityAlert('RATE_LIMIT_EXCEEDED', { ip, endpoint, requests: validRequests.length });
    }
    
    return {
      allowed: !exceeded,
      remaining: Math.max(0, maxRequests - validRequests.length),
      resetTime: now + windowSize
    };
  }

  // Validate request integrity
  validateRequestIntegrity(req) {
    const checks = {
      validUserAgent: this.isValidUserAgent(req.headers['user-agent']),
      validReferer: this.isValidReferer(req.headers.referer),
      noSqlInjection: this.checkSqlInjection(req.query, req.body),
      noXssAttempt: this.checkXssAttempts(req.query, req.body)
    };
    
    const failed = Object.entries(checks).filter(([key, value]) => !value);
    
    if (failed.length > 0) {
      this.triggerSecurityAlert('REQUEST_INTEGRITY_VIOLATION', {
        ip: req.ip,
        failedChecks: failed.map(([key]) => key),
        userAgent: req.headers['user-agent']
      });
    }
    
    return {
      valid: failed.length === 0,
      failedChecks: failed.map(([key]) => key)
    };
  }

  // Check for valid user agent
  isValidUserAgent(userAgent) {
    if (!userAgent) return false;
    
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /hack/i,
      /test/i
    ];
    
    return !suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  // Check for valid referer
  isValidReferer(referer) {
    if (!referer) return true; // Allow empty referer
    
    const allowedDomains = [
      'localhost',
      'dilsedaan.com',
      'www.dilsedaan.com'
    ];
    
    try {
      const url = new URL(referer);
      return allowedDomains.includes(url.hostname);
    } catch {
      return false;
    }
  }

  // Check for SQL injection attempts
  checkSqlInjection(query, body) {
    const sqlPatterns = [
      /(\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b|\bunion\b)/i,
      /(\bor\b|\band\b)\s+\d+\s*=\s*\d+/i,
      /['"]\s*(or|and)\s*['"]\s*=\s*['"]|['"]\s*(or|and)\s*\d+\s*=\s*\d+/i,
      /(exec|execute)\s*\(/i
    ];
    
    const allParams = { ...query, ...body };
    
    for (const [key, value] of Object.entries(allParams)) {
      if (typeof value === 'string') {
        if (sqlPatterns.some(pattern => pattern.test(value))) {
          return false;
        }
      }
    }
    
    return true;
  }

  // Check for XSS attempts
  checkXssAttempts(query, body) {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<img[^>]*onerror[^>]*>/gi
    ];
    
    const allParams = { ...query, ...body };
    
    for (const [key, value] of Object.entries(allParams)) {
      if (typeof value === 'string') {
        if (xssPatterns.some(pattern => pattern.test(value))) {
          return false;
        }
      }
    }
    
    return true;
  }

  // Trigger security alert
  triggerSecurityAlert(type, details) {
    const alert = {
      id: crypto.randomUUID(),
      type,
      details,
      timestamp: new Date().toISOString(),
      severity: this.getAlertSeverity(type)
    };
    
    this.securityEvents.push(alert);
    
    // Keep only last 1000 events
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(-1000);
    }
    
    // Send to monitoring service (webhook, email, etc.)
    this.sendAlertNotification(alert);
    
    return alert;
  }

  // Get alert severity
  getAlertSeverity(type) {
    const severityMap = {
      'MULTIPLE_FAILED_LOGINS': 'HIGH',
      'SUSPICIOUS_DONATION_PATTERN': 'MEDIUM',
      'RATE_LIMIT_EXCEEDED': 'MEDIUM',
      'REQUEST_INTEGRITY_VIOLATION': 'HIGH',
      'UNAUTHORIZED_ACCESS_ATTEMPT': 'HIGH'
    };
    
    return severityMap[type] || 'LOW';
  }

  // Send alert notification
  async sendAlertNotification(alert) {
    try {
      // In production, send to monitoring service
      console.log(`🚨 Security Alert [${alert.severity}]: ${alert.type}`, alert.details);
      
      // Could send to:
      // - Slack webhook
      // - Email notification
      // - PagerDuty
      // - Telegram bot
      // - SMS service
      
    } catch (error) {
      console.error('Failed to send security alert:', error);
    }
  }

  // Get security dashboard data
  getSecurityDashboard() {
    const now = Date.now();
    const lastHour = now - (60 * 60 * 1000);
    const last24Hours = now - (24 * 60 * 60 * 1000);
    
    const recentEvents = this.securityEvents.filter(
      event => new Date(event.timestamp).getTime() > lastHour
    );
    
    const dailyEvents = this.securityEvents.filter(
      event => new Date(event.timestamp).getTime() > last24Hours
    );
    
    return {
      summary: {
        totalEvents: this.securityEvents.length,
        recentEvents: recentEvents.length,
        dailyEvents: dailyEvents.length,
        blockedIPs: this.ipBlacklist.size,
        highSeverityEvents: recentEvents.filter(e => e.severity === 'HIGH').length
      },
      recentAlerts: recentEvents.slice(-10),
      eventsByType: this.groupEventsByType(dailyEvents),
      blockedIPs: Array.from(this.ipBlacklist),
      systemStatus: {
        monitoring: 'ACTIVE',
        lastUpdate: new Date().toISOString(),
        threatLevel: this.calculateThreatLevel(recentEvents)
      }
    };
  }

  // Group events by type
  groupEventsByType(events) {
    const grouped = {};
    events.forEach(event => {
      grouped[event.type] = (grouped[event.type] || 0) + 1;
    });
    return grouped;
  }

  // Calculate current threat level
  calculateThreatLevel(recentEvents) {
    const highSeverity = recentEvents.filter(e => e.severity === 'HIGH').length;
    const mediumSeverity = recentEvents.filter(e => e.severity === 'MEDIUM').length;
    
    if (highSeverity >= 3) return 'CRITICAL';
    if (highSeverity >= 1 || mediumSeverity >= 5) return 'HIGH';
    if (mediumSeverity >= 2) return 'MEDIUM';
    return 'LOW';
  }

  // Clear blocked IP
  unblockIP(ip) {
    this.ipBlacklist.delete(ip);
    this.suspiciousActivities.delete(`login_${ip}`);
  }

  // Reset user security data
  resetUserSecurity(userId) {
    this.suspiciousActivities.delete(`donation_${userId}`);
  }
}

module.exports = new SecurityMonitoringService();
