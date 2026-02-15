import winston from 'winston';
import { ENV } from './env.js';

const { combine, timestamp, printf, colorize, json } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  printf(({ timestamp, level, message, ...meta }) => {
    const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}]: ${message}${extra}`;
  }),
);

const prodFormat = combine(timestamp(), json());

const logger = winston.createLogger({
  level: ENV.NODE_ENV === 'production' ? 'info' : 'debug',
  format: ENV.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),
  ],
});

export default logger;
