import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.simple()),
  transports: [new winston.transports.Console()],
});

export function requestLogger(req: any, res: any, next: any) {
  logger.info(`${req.method} ${req.url}`);
  next();
}
