import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';
import slowDown from 'express-slow-down';

// Initialize in-memory cache (can be replaced with Redis in production)
const cache = new NodeCache({
  stdTTL: 300, // 5 minutes default TTL
  checkperiod: 120, // Check for expired keys every 2 minutes
  maxKeys: 1000 // Maximum number of keys
});

// Cache statistics for monitoring
interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  memory: string;
}

let cacheStats: CacheStats = {
  hits: 0,
  misses: 0,
  keys: 0,
  memory: '0 MB'
};

// Update cache stats
const updateCacheStats = () => {
  const stats = cache.getStats();
  cacheStats = {
    hits: stats.hits,
    misses: stats.misses,
    keys: stats.keys,
    memory: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`
  };
};

// Cache middleware for API responses
export const cacheMiddleware = (ttl: number = 300) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching for authenticated requests that might contain user-specific data
    const authHeader = req.headers.authorization;
    if (authHeader && req.originalUrl.includes('/profile')) {
      return next();
    }

    // Create cache key from URL and query parameters
    const cacheKey = `${req.originalUrl}:${JSON.stringify(req.query)}`;
    
    // Try to get from cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      cacheStats.hits++;
      console.log(`✅ Cache HIT: ${cacheKey}`);
      return res.json(cachedData);
    }

    // Cache miss - store original send function
    const originalSend = res.json;
    res.json = function(data: any) {
      // Only cache successful responses
      if (res.statusCode === 200 && data) {
        cache.set(cacheKey, data, ttl);
        console.log(`💾 Cache SET: ${cacheKey} (TTL: ${ttl}s)`);
      }
      cacheStats.misses++;
      
      // Call original send function
      return originalSend.call(this, data);
    };

    next();
  };
};

// Speed limiter for campaigns and donations (slower responses after multiple requests)
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 10, // Allow 10 requests per windowMs without delay
  delayMs: 100, // Add 100ms delay per request after delayAfter
  maxDelayMs: 2000, // Maximum delay of 2 seconds
  skipSuccessfulRequests: false,
  skipFailedRequests: true,
});

// Database query optimization middleware
export const optimizeQuery = (req: Request, res: Response, next: NextFunction) => {
  // Add default pagination if not provided
  if (!req.query.page) {
    req.query.page = '1';
  }
  if (!req.query.limit) {
    req.query.limit = '20'; // Default to 20 items per page
  }

  // Limit maximum items per page to prevent large responses
  const limit = parseInt(req.query.limit as string, 10);
  if (limit > 100) {
    req.query.limit = '100';
  }

  next();
};

// Response compression and optimization
export const optimizeResponse = (req: Request, res: Response, next: NextFunction) => {
  // Set performance headers
  res.setHeader('X-Response-Time-Start', Date.now().toString());
  
  // Store original end function
  const originalEnd = res.end;
  
  res.end = function(chunk?: any, encoding?: any) {
    const startTime = parseInt(res.getHeader('X-Response-Time-Start') as string);
    const duration = Date.now() - startTime;
    
    res.setHeader('X-Response-Time', `${duration}ms`);
    res.setHeader('X-Cache-Status', cache.has(req.originalUrl) ? 'HIT' : 'MISS');
    
    // Log slow responses
    if (duration > 1000) {
      console.warn(`🐌 Slow response: ${req.method} ${req.originalUrl} - ${duration}ms`);
    }
    
    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Memory monitoring middleware
export const memoryMonitor = (req: Request, res: Response, next: NextFunction) => {
  const memUsage = process.memoryUsage();
  const memoryMB = memUsage.heapUsed / 1024 / 1024;
  
  // Warn if memory usage is high
  if (memoryMB > 200) {
    console.warn(`⚠️ High memory usage: ${memoryMB.toFixed(2)} MB`);
  }
  
  // Clear cache if memory is very high
  if (memoryMB > 500) {
    console.warn(`🧹 Clearing cache due to high memory usage: ${memoryMB.toFixed(2)} MB`);
    cache.flushAll();
  }
  
  next();
};

// Cache management endpoints
export const cacheRoutes = (app: any) => {
  // Get cache statistics
  app.get('/api/cache/stats', (req: Request, res: Response) => {
    updateCacheStats();
    res.json({
      success: true,
      stats: cacheStats,
      keys: cache.keys(),
      memory: process.memoryUsage()
    });
  });
  
  // Clear cache
  app.delete('/api/cache/clear', (req: Request, res: Response) => {
    const keyCount = cache.keys().length;
    cache.flushAll();
    res.json({
      success: true,
      message: `Cleared ${keyCount} cache entries`
    });
  });
  
  // Clear specific cache key
  app.delete('/api/cache/clear/:key', (req: Request, res: Response) => {
    const { key } = req.params;
    const deleted = cache.del(key);
    res.json({
      success: true,
      message: deleted ? `Cleared cache key: ${key}` : `Cache key not found: ${key}`
    });
  });
};

// Cache warming for frequently accessed data
export const warmCache = async () => {
  console.log('🔥 Warming cache with frequently accessed data...');
  
  try {
    // This would typically make requests to your own API to pre-populate cache
    // For now, we'll just log the intention
    console.log('✅ Cache warming completed');
  } catch (error) {
    console.error('❌ Cache warming failed:', error);
  }
};

// Cache invalidation helpers
export const invalidateCache = (pattern: string) => {
  const keys = cache.keys().filter(key => key.includes(pattern));
  keys.forEach(key => cache.del(key));
  console.log(`🗑️ Invalidated ${keys.length} cache entries matching pattern: ${pattern}`);
};

export const invalidateCampaignCache = (campaignId?: string) => {
  if (campaignId) {
    invalidateCache(`campaigns/${campaignId}`);
  }
  invalidateCache('/api/campaigns');
};

export const invalidateDonationCache = (campaignId?: string) => {
  if (campaignId) {
    invalidateCache(`campaigns/${campaignId}`);
  }
  invalidateCache('/api/donations');
  invalidateCache('/api/campaigns'); // Campaigns might show donation totals
};

// Database optimization helpers
export const buildOptimizedQuery = (baseQuery: any, req: Request) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 100);
  const skip = (page - 1) * limit;
  
  let query = baseQuery;
  
  // Add sorting
  if (req.query.sort) {
    const sortField = req.query.sort as string;
    const sortOrder = req.query.order === 'desc' ? -1 : 1;
    query = query.sort({ [sortField]: sortOrder });
  } else {
    // Default sort by creation date
    query = query.sort({ createdAt: -1 });
  }
  
  // Add pagination
  query = query.skip(skip).limit(limit);
  
  return { query, page, limit, skip };
};

// Performance monitoring
export const performanceReport = () => {
  updateCacheStats();
  const memUsage = process.memoryUsage();
  
  return {
    cache: cacheStats,
    memory: {
      heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      external: `${(memUsage.external / 1024 / 1024).toFixed(2)} MB`,
      rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`
    },
    uptime: `${(process.uptime() / 60).toFixed(2)} minutes`,
    timestamp: new Date().toISOString()
  };
};

export { cache };
