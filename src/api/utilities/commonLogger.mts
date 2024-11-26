import { createLogger, transports } from 'winston';

// Winston looger
const logger = createLogger({transports: [new transports.Console]});
export function logRequest(req:any, res:any, next:any) {
      logger.info(req.url)
      next()
  }
  
 export function logError(err:any, req:any, res:any, next:any) {
      logger.error(err)
      next()
  }
