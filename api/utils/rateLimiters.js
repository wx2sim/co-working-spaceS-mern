import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Max 10 attempts per hour for signin/up
  message: 'Too many login attempts, please try again in an hour'
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 500, // Balanced limit for polling and general usage
  message: 'Too many requests from this IP'
});
