import express from 'express';
import { getUsers, deleteUser, updateUserRole, createAdmin, getSupportAdmin } from '../controllers/admin.controller.js';
import { verifyUserToken } from '../utils/verifyUser.js';
import { requireRole } from '../utils/verifyRole.js';

const router = express.Router();

// Get support admin
router.get('/support-admin', verifyUserToken, getSupportAdmin);

// Get users with pagination, sorting, and search
router.get('/users/:adminId', verifyUserToken, requireRole(['admin', 'superadmin']), getUsers);

// Delete user (admin action)
router.delete('/delete/:userId', verifyUserToken, requireRole(['admin', 'superadmin']), deleteUser);

// Update user role (superadmin action)
router.put('/role/:userId', verifyUserToken, requireRole(['superadmin']), updateUserRole);

// Create admin (superadmin action)
router.post('/create-admin', verifyUserToken, requireRole(['superadmin']), createAdmin);

export default router;
