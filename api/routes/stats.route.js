import express from 'express';
import { getPlatformStats, getOwnerStats } from '../controllers/stats.controller.js';
import { verifyUserToken } from '../utils/verifyUser.js';
import { requireRole } from '../utils/verifyRole.js';

const router = express.Router();

// Route for SuperAdmin global stats
router.get('/platform', verifyUserToken, requireRole(['superadmin', 'admin']), getPlatformStats);

// Route for Admin (Seller) personal stats
router.get('/owner', verifyUserToken, requireRole(['admin', 'user', 'superadmin']), getOwnerStats);

export default router;
