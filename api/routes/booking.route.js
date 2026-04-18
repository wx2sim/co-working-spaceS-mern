import express from "express";
import { verifyUserToken, checkVerification } from '../utils/verifyUser.js';
import { createBooking, getOwnerBookings, approveBooking, getClientBookings, rejectBooking, cancelBooking, getPendingCount, getUnseenStatusCount, markStatusAsSeen } from '../controllers/booking.controller.js';

const router = express.Router();

router.post('/create', verifyUserToken, checkVerification, createBooking);
router.get('/owner', verifyUserToken, checkVerification, getOwnerBookings);
router.get('/client', verifyUserToken, checkVerification, getClientBookings);
router.put('/approve/:id', verifyUserToken, checkVerification, approveBooking);
router.put('/reject/:id', verifyUserToken, checkVerification, rejectBooking);
router.delete('/cancel/:id', verifyUserToken, checkVerification, cancelBooking);
router.get('/pending-count', verifyUserToken, getPendingCount);
router.get('/unseen-status-count', verifyUserToken, getUnseenStatusCount);
router.put('/mark-status-seen', verifyUserToken, markStatusAsSeen);

export default router;
