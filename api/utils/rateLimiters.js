import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 50, // More relaxed limit for testing and high-traffic periods
  message: {
    success: false,
    message: 'Too many login attempts, please try again in 1 minute'
  }
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // Balanced limit for polling and general usage
  message: 'Too many requests from this IP'
});
