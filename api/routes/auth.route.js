import express from 'express';
import { signup , signin, google , signOut} from '../controllers/auth.controller.js';
import { authLimiter } from '../utils/rateLimiters.js';

const router = express.Router(); 

router.post('/signup', authLimiter, signup);
router.post('/signin', authLimiter, signin);
router.post('/google', google);
router.post('/signout', signOut);


export default router;