import express from 'express';
import { verifyUserToken } from '../utils/verifyUser.js';
import { createBooking, getOwnerBookings, approveBooking, getClientBookings, rejectBooking } from '../controllers/booking.controller.js';

const router = express.Router();

router.post('/create', verifyUserToken, createBooking);
router.get('/owner', verifyUserToken, getOwnerBookings);
router.get('/client', verifyUserToken, getClientBookings);
router.put('/approve/:id', verifyUserToken, approveBooking);
router.put('/reject/:id', verifyUserToken, rejectBooking);

export default router;
