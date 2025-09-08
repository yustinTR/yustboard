// Structured logging system for production safety
export const logger = {
  info: (message: string, meta?: object) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[INFO] ${message}`, meta);
    }
  },
  warn: (message: string, meta?: object) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[WARN] ${message}`, meta);
    }
  },
  error: (message: string, error?: Error | object) => {
    // Always log errors, but sanitize in production
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR] ${message}`, error);
    } else {
      // In production, log without sensitive data
      console.error(`[ERROR] ${message}`, error instanceof Error ? error.message : 'Error occurred');
    }
  },
  debug: (message: string, meta?: object) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, meta);
    }
  }
};