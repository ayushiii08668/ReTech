/**
 * Simple console logger with timestamps and log levels.
 */
const logger = {
  /**
   * Formats the current timestamp for log output.
   */
  _timestamp(): string {
    return new Date().toISOString();
  },

  info(message: string, ...args: unknown[]): void {
    console.log(`[${this._timestamp()}] ℹ️  INFO: ${message}`, ...args);
  },

  warn(message: string, ...args: unknown[]): void {
    console.warn(`[${this._timestamp()}] ⚠️  WARN: ${message}`, ...args);
  },

  error(message: string, ...args: unknown[]): void {
    console.error(`[${this._timestamp()}] ❌ ERROR: ${message}`, ...args);
  },

  debug(message: string, ...args: unknown[]): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${this._timestamp()}] 🐛 DEBUG: ${message}`, ...args);
    }
  },
};

export default logger;
