import * as fs from 'fs';
import * as path from 'path';

export const logErrorToFile = (error: any, context?: string) => {
  try {
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const logFilePath = path.join(logDir, 'error.log');
    const timestamp = new Date().toISOString();
    const errorMessage = error instanceof Error ? error.stack || error.message : JSON.stringify(error);
    const logContent = `[${timestamp}] [${context || 'System'}] ${errorMessage}\n----------------------------------------\n`;
    fs.appendFileSync(logFilePath, logContent, 'utf8');
  } catch (err) {
    console.error('Failed to write log to file:', err);
  }
};
