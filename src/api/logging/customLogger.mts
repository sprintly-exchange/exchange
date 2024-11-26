import { createLogger, format, transports } from 'winston';
import path from 'path';
import fs from 'fs';
const { combine, timestamp, printf } = format;

export class CustomLogger {
  logFormat:any;
  constructor() {
    this.logFormat = printf(({ level, message, timestamp }) => {
      return `${timestamp} ${level}: ${message}`;
    });
  }

  createLogger(logFileName:string) {
    const logPath = path.join(path.resolve(), 'logs', logFileName);
    if (!fs.existsSync(path.dirname(logPath))) {
      fs.mkdirSync(path.dirname(logPath), { recursive: true });
    }

    return createLogger({
      format: combine(
        timestamp(),
        this.logFormat
      ),
      transports: [
        new transports.File({ filename: logPath }),
        new transports.Console()
      ]
    });
  }
}
