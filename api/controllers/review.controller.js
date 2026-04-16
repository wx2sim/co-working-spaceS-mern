import Review from '../models/review.model.js';
import { errorHandler } from '../utils/error.js';

export const createReview = async (req, res, next) => {
    try {
        if (!['admin', 'superadmin'].includes(req.user.role)) {
            return next(errorHandler(403, 'Only admins can add reviews'));
        }
        const newReview = new Review(req.body);
        await newReview.save();
        res.status(201).json(newReview);
    } catch (error) {
        next(error);
    }
};

export const getAllReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        next(error);
    }
};

export const deleteReview = async (req, res, next) => {
    try {
        if (!['admin', 'superadmin'].includes(req.user.role)) {
            return next(errorHandler(403, 'Only admins can delete reviews'));
        }
        await Review.findByIdAndDelete(req.params.id);
        res.status(200).json('Review deleted');
    } catch (error) {
        next(error);
    }
};
