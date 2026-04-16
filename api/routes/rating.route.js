import express from 'express';
import { verifyUserToken } from '../utils/verifyUser.js';
import { addRating, getListingRating } from '../controllers/rating.controller.js';

const router = express.Router();

router.post('/add', verifyUserToken, addRating);
router.get('/get/:listingId', verifyUserToken, getListingRating);

export default router;
