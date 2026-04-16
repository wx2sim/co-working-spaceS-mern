import Rating from '../models/rating.model.js';
import Listing from '../models/listing.model.js';
import { errorHandler } from '../utils/error.js';

export const addRating = async (req, res, next) => {
  const { listingId, rating } = req.body;
  const userId = req.user.id;

  if (!listingId || !rating) {
    return next(errorHandler(400, 'All fields are required'));
  }

  try {
    // 1. Update or Create Rating
    await Rating.findOneAndUpdate(
      { userId, listingId },
      { rating },
      { upsert: true, new: true }
    );

    // 2. Recalculate averageRating for the Listing
    const ratings = await Rating.find({ listingId });
    const ratingCount = ratings.length;
    const averageRating = (
      ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratingCount
    ).toFixed(1);

    const updatedListing = await Listing.findByIdAndUpdate(
      listingId,
      {
        averageRating: parseFloat(averageRating),
        ratingCount,
      },
      { new: true }
    );

    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

export const getListingRating = async (req, res, next) => {
  try {
    const rating = await Rating.findOne({
      userId: req.user.id,
      listingId: req.params.listingId,
    });
    res.status(200).json(rating);
  } catch (error) {
    next(error);
  }
};
