/**
 * Rate Limiting Middleware
 * Prevents brute force attacks by limiting request frequency
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { createHash } from 'crypto';

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blockedUntil?: number;
}

// In-memory store (in production, use Redis or database)
const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  blockDurationMs?: number; // How long to block after exceeding limit
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  keyGenerator?: (req: VercelRequest) => string; // Custom key generator
}

/**
 * Default configuration for authentication endpoints
 */
export const authRateLimitConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per window
  blockDurationMs: 30 * 60 * 1000, // Block for 30 minutes after exceeding
  skipSuccessfulRequests: true,
};

/**
 * Aggressive rate limit for failed login attempts
 */
export const loginRateLimitConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 failed attempts
  blockDurationMs: 30 * 60 * 1000, // 30 minute block
  skipSuccessfulRequests: true,
};

/**
 * Rate limit for password reset requests
 */
export const passwordResetRateLimitConfig: RateLimitConfig = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 reset requests per hour
  blockDurationMs: 60 * 60 * 1000, // Block for 1 hour
};

/**
 * Rate limit for registration
 */
export const registrationRateLimitConfig: RateLimitConfig = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 registrations per hour per IP
  blockDurationMs: 24 * 60 * 60 * 1000, // Block for 24 hours
};

/**
 * Get client identifier (IP address + user agent hash)
 */
function getClientKey(req: VercelRequest, customKey?: string): string {
  if (customKey) {
    return customKey;
  }
  
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
             (req.headers['x-real-ip'] as string) || 
             'unknown';
  
  const userAgent = req.headers['user-agent'] || 'unknown';
  const uaHash = createHash('md5').update(userAgent).digest('hex').substring(0, 8);
  
  return `${ip}:${uaHash}`;
}

/**
 * Clean up expired entries (run periodically)
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now && (!entry.blockedUntil || entry.blockedUntil < now)) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

/**
 * Rate limit middleware
 */
export function rateLimit(config: RateLimitConfig = authRateLimitConfig) {
  return async (
    req: VercelRequest,
    res: VercelResponse,
    next?: () => void | Promise<void>
  ): Promise<boolean> => {
    // Bypass rate limiting in test mode
    if (process.env.DISABLE_RATE_LIMIT === 'true') {
      if (next) {
        await next();
      }
      return true;
    }
    
    const key = config.keyGenerator ? config.keyGenerator(req) : getClientKey(req);
    const now = Date.now();
    
    let entry = rateLimitStore.get(key);
    
    // Check if currently blocked
    if (entry?.blockedUntil && entry.blockedUntil > now) {
      const remainingSeconds = Math.ceil((entry.blockedUntil - now) / 1000);
      res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: `You have been temporarily blocked due to too many failed attempts. Please try again in ${Math.ceil(remainingSeconds / 60)} minutes.`,
        retryAfter: remainingSeconds,
      });
      return false;
    }
    
    // Initialize or reset if window expired
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
      };
      rateLimitStore.set(key, entry);
    }
    
    // Increment request count
    entry.count++;
    
    // Check if limit exceeded
    if (entry.count > config.maxRequests) {
      if (config.blockDurationMs) {
        entry.blockedUntil = now + config.blockDurationMs;
      }
      
      const remainingSeconds = config.blockDurationMs 
        ? Math.ceil(config.blockDurationMs / 1000)
        : Math.ceil((entry.resetTime - now) / 1000);
      
      res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again in ${Math.ceil(remainingSeconds / 60)} minutes.`,
        retryAfter: remainingSeconds,
      });
      return false;
    }
    
    // Set rate limit headers
    const remaining = Math.max(0, config.maxRequests - entry.count);
    const resetTime = Math.ceil((entry.resetTime - now) / 1000);
    
    res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', resetTime.toString());
    
    if (next) {
      await next();
    }
    
    return true;
  };
}

/**
 * Reset rate limit for a successful authentication
 */
export function resetRateLimit(req: VercelRequest, customKey?: string): void {
  const key = customKey || getClientKey(req);
  rateLimitStore.delete(key);
}

/**
 * Mark authentication as failed (for custom counting)
 */
export function recordFailedAttempt(
  req: VercelRequest,
  config: RateLimitConfig = loginRateLimitConfig,
  customKey?: string
): void {
  const key = customKey || getClientKey(req);
  const now = Date.now();
  
  let entry = rateLimitStore.get(key);
  
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
  } else {
    entry.count++;
  }
  
  // Block if exceeded
  if (entry.count > config.maxRequests && config.blockDurationMs) {
    entry.blockedUntil = now + config.blockDurationMs;
  }
  
  rateLimitStore.set(key, entry);
}

/**
 * Check if client is currently rate limited
 */
export function isRateLimited(req: VercelRequest, customKey?: string): boolean {
  const key = customKey || getClientKey(req);
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  if (!entry) {
    return false;
  }
  
  // Check if blocked
  if (entry.blockedUntil && entry.blockedUntil > now) {
    return true;
  }
  
  // Check if count exceeded in current window
  if (entry.resetTime > now && entry.count > authRateLimitConfig.maxRequests) {
    return true;
  }
  
  return false;
}
