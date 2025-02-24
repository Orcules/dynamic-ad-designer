
export class Logger {
  private static logDirectory = 'logs';
  private static currentLogFile: string;

  private static async saveLog(message: string, type: 'info' | 'error' | 'warn' = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}\n`;
    
    // In browser environment, we'll use localStorage as we can't directly write to filesystem
    const logs = localStorage.getItem('applicationLogs') || '';
    localStorage.setItem('applicationLogs', logs + logEntry);
    
    // Also console log for immediate feedback
    switch (type) {
      case 'error':
        console.error(logEntry);
        break;
      case 'warn':
        console.warn(logEntry);
        break;
      default:
        console.log(logEntry);
    }
  }

  static async info(message: string) {
    await this.saveLog(message, 'info');
  }

  static async error(message: string) {
    await this.saveLog(message, 'error');
  }

  static async warn(message: string) {
    await this.saveLog(message, 'warn');
  }

  static getLogs(): string {
    return localStorage.getItem('applicationLogs') || '';
  }

  static clearLogs() {
    localStorage.removeItem('applicationLogs');
  }
}
