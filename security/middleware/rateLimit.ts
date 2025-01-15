import rateLimit from 'express-rate-limit';
import { RateLimitConfig } from '../../src/types/security.types';

const rateLimitConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
};

export const rateLimitMiddleware = rateLimit(rateLimitConfig);
