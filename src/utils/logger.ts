
export class Logger {
  private static logDirectory = 'logs';
  private static currentLogFile: string;
  private static maxStorageSize = 500 * 1024; // 500KB מקסימום

  private static async saveLog(message: string, type: 'info' | 'error' | 'warn' = 'info') {
    try {
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}\n`;
      
      // בדיקת גודל ה-localStorage הנוכחי
      const currentLogs = localStorage.getItem('applicationLogs') || '';
      
      // אם הגודל קרוב למקסימום, נמחק חלק מההיסטוריה הישנה
      if (currentLogs.length > this.maxStorageSize * 0.8) {
        console.warn('Log storage is getting full, trimming older logs');
        // שומרים רק את 5000 התווים האחרונים
        const trimmedLogs = currentLogs.slice(-5000);
        localStorage.setItem('applicationLogs', trimmedLogs);
      }
      
      // בדיקה נוספת אם יש מספיק מקום
      if ((currentLogs.length + logEntry.length) > this.maxStorageSize) {
        console.warn('Not enough space for new log entry, skipping storage');
        // רק מציגים בקונסול אבל לא שומרים
        this.logToConsole(logEntry, type);
        return;
      }
      
      // שמירה בלוקל סטורג'
      localStorage.setItem('applicationLogs', currentLogs + logEntry);
      
      // הצגה בקונסול
      this.logToConsole(logEntry, type);
      
      // אם זו שגיאה, מוסיפים גם מידע על המחסנית
      if (type === 'error' && Error.captureStackTrace) {
        const stack = new Error().stack;
        if (stack) {
          // מציגים רק בקונסול ולא מנסים לשמור במקרה של שגיאת מקום
          console.error(`[${timestamp}] [STACK] ${stack}`);
        }
      }
    } catch (e) {
      // במקרה של שגיאה (למשל QuotaExceededError), רק מציגים בקונסול
      console.error('Failed to save log to storage:', e);
      this.logToConsole(`${message} (failed to save to storage)`, type);
    }
  }

  private static logToConsole(message: string, type: 'info' | 'error' | 'warn') {
    switch (type) {
      case 'error':
        console.error(message);
        break;
      case 'warn':
        console.warn(message);
        break;
      default:
        console.log(message);
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
    console.log('Application logs cleared');
  }
}
