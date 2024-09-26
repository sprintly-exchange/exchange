import { createLogger, transports } from 'winston';

// Winston looger
const logger = createLogger({transports: [new transports.Console]});
export function logRequest(req, res, next) {
      logger.info(req.url)
      next()
  }
  
 export function logError(err, req, res, next) {
      logger.error(err)
      next()
  }
