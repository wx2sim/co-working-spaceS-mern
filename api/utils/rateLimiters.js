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
  message: { success: false, message: 'Too many requests from this IP' }
});

export const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Max 10 OTP requests per hour per IP
  message: {
    success: false,
    message: 'Too many OTP requests, please try again in an hour'
  }
});
