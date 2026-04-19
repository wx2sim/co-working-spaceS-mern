import express from 'express';
import { signup , signin, google , signOut, verifyEmail, resendOTP } from '../controllers/auth.controller.js';
import { authLimiter, otpLimiter } from '../utils/rateLimiters.js';

const router = express.Router(); 

router.post('/signup', authLimiter, signup);
router.post('/signin', authLimiter, signin);
router.post('/google', authLimiter, google);
router.post('/signout', signOut);
router.post('/verify-email', otpLimiter, verifyEmail);
router.post('/resend-otp', otpLimiter, resendOTP);


export default router;