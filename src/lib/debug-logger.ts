/**
 * Debug Logging Utility
 *
 * Provides tiered logging for analytics and other operations that typically
 * swallow errors silently. This helps with debugging while not affecting
 * production user experience.
 *
 * @module lib/debug-logger
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface DebugLogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  metadata?: Record<string, unknown>;
  error?: Error;
}

export interface DebugLoggerConfig {
  /** Enable debug logging (default: development mode only) */
  enabled: boolean;
  /** Minimum log level to output */
  minLevel: LogLevel;
  /** Maximum entries to keep in memory buffer */
  maxBufferSize: number;
  /** Categories to include (empty = all) */
  includeCategories: string[];
  /** Categories to exclude */
  excludeCategories: string[];
  /** Output to console */
  consoleOutput: boolean;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const DEFAULT_CONFIG: DebugLoggerConfig = {
  enabled: typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production',
  minLevel: 'debug',
  maxBufferSize: 500,
  includeCategories: [],
  excludeCategories: [],
  consoleOutput: true,
};

/**
 * Debug Logger for capturing silently-swallowed errors and analytics issues
 */
class DebugLogger {
  private config: DebugLoggerConfig;
  private buffer: DebugLogEntry[] = [];
  private listeners: ((entry: DebugLogEntry) => void)[] = [];

  constructor(config: Partial<DebugLoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Update logger configuration
   */
  configure(config: Partial<DebugLoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check if a category should be logged
   */
  private shouldLogCategory(category: string): boolean {
    if (this.config.excludeCategories.includes(category)) return false;
    if (this.config.includeCategories.length === 0) return true;
    return this.config.includeCategories.includes(category);
  }

  /**
   * Check if a level should be logged
   */
  private shouldLogLevel(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.config.minLevel];
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    category: string,
    message: string,
    metadata?: Record<string, unknown>,
    error?: Error
  ): void {
    if (!this.config.enabled) return;
    if (!this.shouldLogLevel(level)) return;
    if (!this.shouldLogCategory(category)) return;

    const entry: DebugLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      metadata,
      error,
    };

    // Add to buffer with size limit
    this.buffer.push(entry);
    if (this.buffer.length > this.config.maxBufferSize) {
      this.buffer.shift();
    }

    // Console output
    if (this.config.consoleOutput) {
      const prefix = `[${level.toUpperCase()}][${category}]`;
      const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'debug';

      if (error) {
        console[consoleMethod](prefix, message, metadata ?? '', error);
      } else if (metadata) {
        console[consoleMethod](prefix, message, metadata);
      } else {
        console[consoleMethod](prefix, message);
      }
    }

    // Notify listeners
    this.listeners.forEach((listener) => listener(entry));
  }

  /**
   * Log debug message
   */
  debug(category: string, message: string, metadata?: Record<string, unknown>): void {
    this.log('debug', category, message, metadata);
  }

  /**
   * Log info message
   */
  info(category: string, message: string, metadata?: Record<string, unknown>): void {
    this.log('info', category, message, metadata);
  }

  /**
   * Log warning message
   */
  warn(category: string, message: string, metadata?: Record<string, unknown>): void {
    this.log('warn', category, message, metadata);
  }

  /**
   * Log error message
   */
  error(category: string, message: string, error?: Error, metadata?: Record<string, unknown>): void {
    this.log('error', category, message, metadata, error);
  }

  /**
   * Log a swallowed error (from analytics, background operations, etc.)
   */
  swallowed(
    category: string,
    operation: string,
    error: unknown,
    metadata?: Record<string, unknown>
  ): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    this.log(
      'warn',
      category,
      `Swallowed error in ${operation}`,
      { ...metadata, operation },
      errorObj
    );
  }

  /**
   * Subscribe to log entries
   */
  subscribe(listener: (entry: DebugLogEntry) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Get buffered log entries
   */
  getBuffer(): DebugLogEntry[] {
    return [...this.buffer];
  }

  /**
   * Get entries by category
   */
  getByCategory(category: string): DebugLogEntry[] {
    return this.buffer.filter((entry) => entry.category === category);
  }

  /**
   * Get entries by level
   */
  getByLevel(level: LogLevel): DebugLogEntry[] {
    return this.buffer.filter((entry) => entry.level === level);
  }

  /**
   * Clear the buffer
   */
  clearBuffer(): void {
    this.buffer = [];
  }

  /**
   * Export buffer as JSON string
   */
  exportBuffer(): string {
    return JSON.stringify(this.buffer, null, 2);
  }
}

// Singleton instance
export const debugLogger = new DebugLogger();

// Pre-defined category loggers for convenience
export const analyticsLogger = {
  debug: (msg: string, meta?: Record<string, unknown>) => debugLogger.debug('analytics', msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => debugLogger.info('analytics', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => debugLogger.warn('analytics', msg, meta),
  error: (msg: string, err?: Error, meta?: Record<string, unknown>) =>
    debugLogger.error('analytics', msg, err, meta),
  swallowed: (operation: string, error: unknown, meta?: Record<string, unknown>) =>
    debugLogger.swallowed('analytics', operation, error, meta),
};

export const securityLogger = {
  debug: (msg: string, meta?: Record<string, unknown>) => debugLogger.debug('security', msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => debugLogger.info('security', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => debugLogger.warn('security', msg, meta),
  error: (msg: string, err?: Error, meta?: Record<string, unknown>) =>
    debugLogger.error('security', msg, err, meta),
  swallowed: (operation: string, error: unknown, meta?: Record<string, unknown>) =>
    debugLogger.swallowed('security', operation, error, meta),
};

export const storageLogger = {
  debug: (msg: string, meta?: Record<string, unknown>) => debugLogger.debug('storage', msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => debugLogger.info('storage', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => debugLogger.warn('storage', msg, meta),
  error: (msg: string, err?: Error, meta?: Record<string, unknown>) =>
    debugLogger.error('storage', msg, err, meta),
  swallowed: (operation: string, error: unknown, meta?: Record<string, unknown>) =>
    debugLogger.swallowed('storage', operation, error, meta),
};

export default debugLogger;
