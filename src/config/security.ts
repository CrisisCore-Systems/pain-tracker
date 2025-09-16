/**
 * Security Configuration and Headers Management
 * Implements security best practices for production deployment
 */

// Content Security Policy configuration
export const securityConfig = {
  // Content Security Policy directives
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'", // Only for development - remove in production
      "'unsafe-eval'", // Only for development - remove in production
      "https://cdn.jsdelivr.net", // For any CDN dependencies
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'", // Required for CSS-in-JS and inline styles
      "https://fonts.googleapis.com",
    ],
    fontSrc: [
      "'self'",
      "https://fonts.gstatic.com",
      "data:", // For base64 encoded fonts
    ],
    imgSrc: [
      "'self'",
      "data:", // For base64 encoded images
      "blob:", // For generated images
    ],
    connectSrc: [
      "'self'",
      "ws://localhost:*", // For development HMR
      "wss://localhost:*",
      "https://api.wcb.gov", // WCB API endpoint
    ],
    mediaSrc: ["'self'"],
    objectSrc: ["'none'"],
    frameSrc: ["'none'"],
    frameAncestors: ["'none'"],
    formAction: ["'self'"],
    baseUri: ["'self'"],
    upgradeInsecureRequests: true,
  },

  // Security headers for production
  securityHeaders: {
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    
    // XSS Protection (legacy browsers)
    'X-XSS-Protection': '1; mode=block',
    
    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions policy (feature policy)
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'bluetooth=()',
    ].join(', '),
    
    // HSTS (HTTP Strict Transport Security)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    
    // Expect-CT header
    'Expect-CT': 'max-age=86400, enforce',
  },

  // Environment-specific configurations
  environments: {
    development: {
      // Relaxed CSP for development
      allowInlineScripts: true,
      allowInlineStyles: true,
      allowEval: true,
      enableSourceMaps: true,
      allowHMR: true,
    },
    
    staging: {
      // Moderate security for staging
      allowInlineScripts: false,
      allowInlineStyles: true,
      allowEval: false,
      enableSourceMaps: true,
      allowHMR: false,
    },
    
    production: {
      // Strict security for production
      allowInlineScripts: false,
      allowInlineStyles: false,
      allowEval: false,
      enableSourceMaps: false,
      allowHMR: false,
      enableHSTS: true,
      enableCSP: true,
    },
  },

  // API security configuration
  apiSecurity: {
    // Rate limiting
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
    },
    
    // CORS configuration
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-domain.com'] // Replace with actual production domain
        : ['http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
      optionsSuccessStatus: 200,
    },
    
    // Request validation
    validation: {
      maxRequestSize: '10mb',
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedContentTypes: [
        'application/json',
        'application/x-www-form-urlencoded',
        'multipart/form-data',
      ],
    },
  },

  // Data protection settings
  dataProtection: {
    // Encryption settings
    encryption: {
      algorithm: 'aes-256-gcm',
      keyDerivation: 'pbkdf2',
      saltLength: 32,
      ivLength: 16,
      iterations: 10000,
    },
    
    // Session security
    session: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict' as const,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
    
    // Local storage encryption
    localStorage: {
      enableEncryption: true,
      keyRotationInterval: 7 * 24 * 60 * 60 * 1000, // 7 days
      compressionThreshold: 1024, // Compress data larger than 1KB
    },
  },

  // Privacy settings
  privacy: {
    // Analytics configuration
    analytics: {
      enableDifferentialPrivacy: true,
      noiseLevel: 1.0,
      dataRetentionDays: 30,
      minimumAggregationSize: 5,
      anonymizeIPs: true,
    },
    
    // Tracking prevention
    tracking: {
      blockThirdPartyTrackers: true,
      disableFingerprinting: true,
      preventCrossSiteTracking: true,
    },
  },

  // Security monitoring
  monitoring: {
    // Error reporting
    errorReporting: {
      enableStackTraces: process.env.NODE_ENV !== 'production',
      sanitizeErrors: true,
      logSecurityEvents: true,
    },
    
    // Audit logging
    audit: {
      logAuthenticationEvents: true,
      logDataAccess: true,
      logConfigurationChanges: true,
      retentionDays: 90,
    },
  },
};

/**
 * Generate CSP header string
 */
export function generateCSPHeader(environment: 'development' | 'staging' | 'production' = 'production'): string {
  const csp = securityConfig.contentSecurityPolicy;
  const envConfig = securityConfig.environments[environment];
  
  const directives: string[] = [];
  
  // Default source
  directives.push(`default-src ${csp.defaultSrc.join(' ')}`);
  
  // Script source
  let scriptSrc = [...csp.scriptSrc];
  if (!envConfig.allowInlineScripts) {
    scriptSrc = scriptSrc.filter(src => src !== "'unsafe-inline'");
  }
  if (!envConfig.allowEval) {
    scriptSrc = scriptSrc.filter(src => src !== "'unsafe-eval'");
  }
  directives.push(`script-src ${scriptSrc.join(' ')}`);
  
  // Style source
  let styleSrc = [...csp.styleSrc];
  if (!envConfig.allowInlineStyles) {
    styleSrc = styleSrc.filter(src => src !== "'unsafe-inline'");
  }
  directives.push(`style-src ${styleSrc.join(' ')}`);
  
  // Other directives
  directives.push(`font-src ${csp.fontSrc.join(' ')}`);
  directives.push(`img-src ${csp.imgSrc.join(' ')}`);
  directives.push(`connect-src ${csp.connectSrc.join(' ')}`);
  directives.push(`media-src ${csp.mediaSrc.join(' ')}`);
  directives.push(`object-src ${csp.objectSrc.join(' ')}`);
  directives.push(`frame-src ${csp.frameSrc.join(' ')}`);
  directives.push(`frame-ancestors ${csp.frameAncestors.join(' ')}`);
  directives.push(`form-action ${csp.formAction.join(' ')}`);
  directives.push(`base-uri ${csp.baseUri.join(' ')}`);
  
  if (csp.upgradeInsecureRequests) {
    directives.push('upgrade-insecure-requests');
  }
  
  return directives.join('; ');
}

/**
 * Get security headers for environment
 */
export function getSecurityHeaders(environment: 'development' | 'staging' | 'production' = 'production'): Record<string, string> {
  const headers: Record<string, string> = {
    ...securityConfig.securityHeaders,
    'Content-Security-Policy': generateCSPHeader(environment),
  };
  
  // Remove HSTS in development
  if (environment === 'development') {
    delete headers['Strict-Transport-Security'];
    delete headers['Expect-CT'];
  }
  
  return headers;
}

/**
 * Validate security configuration
 */
export function validateSecurityConfig(): {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Check environment variables
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.VITE_WCB_API_ENDPOINT || process.env.VITE_WCB_API_ENDPOINT.startsWith('http://')) {
      issues.push('Production API endpoint should use HTTPS');
      recommendations.push('Set VITE_WCB_API_ENDPOINT to use https://');
    }
    
    if (process.env.VITE_ENABLE_DEBUG_MODE === 'true') {
      issues.push('Debug mode should be disabled in production');
      recommendations.push('Set VITE_ENABLE_DEBUG_MODE=false for production');
    }
  }
  
  // Check CSP configuration
  const csp = securityConfig.contentSecurityPolicy;
  if (csp.scriptSrc.includes("'unsafe-eval'") && process.env.NODE_ENV === 'production') {
    issues.push("'unsafe-eval' should not be allowed in production CSP");
    recommendations.push("Remove 'unsafe-eval' from script-src in production");
  }
  
  if (csp.scriptSrc.includes("'unsafe-inline'") && process.env.NODE_ENV === 'production') {
    issues.push("'unsafe-inline' should not be allowed in production CSP");
    recommendations.push("Remove 'unsafe-inline' from script-src in production or use nonces");
  }
  
  // Check data protection settings
  if (!securityConfig.dataProtection.localStorage.enableEncryption) {
    issues.push('Local storage encryption is disabled');
    recommendations.push('Enable localStorage encryption for sensitive data');
  }
  
  // Check privacy settings
  if (!securityConfig.privacy.analytics.enableDifferentialPrivacy) {
    issues.push('Differential privacy is disabled for analytics');
    recommendations.push('Enable differential privacy to protect user data');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    recommendations,
  };
}

/**
 * Security middleware configuration for Express/Node.js backend
 */
export const securityMiddlewareConfig = {
  helmet: {
    contentSecurityPolicy: {
      directives: securityConfig.contentSecurityPolicy,
    },
    crossOriginEmbedderPolicy: false, // Disable if not needed
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
  },
  
  cors: securityConfig.apiSecurity.cors,
  
  rateLimit: securityConfig.apiSecurity.rateLimit,
  
  compression: {
    level: 6,
    threshold: 1024,
    filter: (req: { headers: Record<string, string> }) => {
      // Don't compress if the request includes a 'no-transform' cache-control directive
      if (req.headers['cache-control'] && req.headers['cache-control'].includes('no-transform')) {
        return false;
      }
      return true;
    },
  },
};

export default securityConfig;
