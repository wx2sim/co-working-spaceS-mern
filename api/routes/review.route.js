import express from 'express';
import { verifyUserToken } from '../utils/verifyUser.js';
import { createReview, getAllReviews, deleteReview, updateReview } from '../controllers/review.controller.js';

const router = express.Router();

router.post('/create', verifyUserToken, createReview);
router.get('/get', getAllReviews);
router.put('/update/:id', verifyUserToken, updateReview);
router.delete('/delete/:id', verifyUserToken, deleteReview);

export default router;
