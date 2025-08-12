/// <reference types="vite/client" />

interface ImportMetaEnv {
  // API Configuration
  readonly VITE_WCB_API_ENDPOINT: string;
  
  // Application Configuration
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_ENVIRONMENT: 'development' | 'staging' | 'production';
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_BUILD_TIME: string;
  
  // Feature Flags
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_DEBUG_MODE: string;
  readonly VITE_ENABLE_WCB_SUBMISSION: string;
  readonly VITE_ENABLE_EXPORT_FEATURES: string;
  
  // Security Configuration
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_MAX_FILE_SIZE: string;
  readonly VITE_ALLOWED_FILE_TYPES: string;
  
  // Development/Testing
  readonly VITE_MOCK_API: string;
  readonly VITE_BYPASS_AUTH: string;
  
  // Base Vite environment variables
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly PROD: boolean;
  readonly DEV: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Type guards for environment validation
declare global {
  interface Window {
    __PAIN_TRACKER_CONFIG__?: {
      apiEndpoint?: string;
      environment?: string;
      version?: string;
      buildTime?: string;
      enabledFeatures?: string[];
    };
  }
}

// Environment variable helpers
export type Environment = 'development' | 'staging' | 'production';

export interface AppConfig {
  apiEndpoint: string;
  environment: Environment;
  version: string;
  buildTime: string;
  features: {
    analytics: boolean;
    debugMode: boolean;
    wcbSubmission: boolean;
    exportFeatures: boolean;
  };
  security: {
    apiTimeout: number;
    maxFileSize: number;
    allowedFileTypes: string[];
  };
  development: {
    mockApi: boolean;
    bypassAuth: boolean;
  };
}

// Environment validation utilities
export function validateEnvironment(): Environment {
  const env = import.meta.env.VITE_APP_ENVIRONMENT;
  if (!env || !['development', 'staging', 'production'].includes(env)) {
    console.warn('Invalid or missing VITE_APP_ENVIRONMENT, defaulting to development');
    return 'development';
  }
  return env as Environment;
}

export function isProduction(): boolean {
  return validateEnvironment() === 'production';
}

export function isDevelopment(): boolean {
  return validateEnvironment() === 'development';
}

export function getAppConfig(): AppConfig {
  const env = import.meta.env;
  
  return {
    apiEndpoint: env.VITE_WCB_API_ENDPOINT || '/api/wcb',
    environment: validateEnvironment(),
    version: env.VITE_APP_VERSION || '0.1.0',
    buildTime: env.VITE_APP_BUILD_TIME || new Date().toISOString(),
    features: {
      analytics: env.VITE_ENABLE_ANALYTICS === 'true',
      debugMode: env.VITE_ENABLE_DEBUG_MODE === 'true' || isDevelopment(),
      wcbSubmission: env.VITE_ENABLE_WCB_SUBMISSION !== 'false', // Default to enabled
      exportFeatures: env.VITE_ENABLE_EXPORT_FEATURES !== 'false', // Default to enabled
    },
    security: {
      apiTimeout: parseInt(env.VITE_API_TIMEOUT || '30000', 10),
      maxFileSize: parseInt(env.VITE_MAX_FILE_SIZE || '10485760', 10), // 10MB
      allowedFileTypes: (env.VITE_ALLOWED_FILE_TYPES || 'json,csv,pdf').split(','),
    },
    development: {
      mockApi: env.VITE_MOCK_API === 'true',
      bypassAuth: env.VITE_BYPASS_AUTH === 'true' && isDevelopment(),
    },
  };
} 