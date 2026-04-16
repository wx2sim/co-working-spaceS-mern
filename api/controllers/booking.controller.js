import Booking from '../models/booking.model.js';
import Listing from '../models/listing.model.js';
import { errorHandler } from '../utils/error.js';

export const createBooking = async (req, res, next) => {
  try {
    const { listingId, features, finalPrice, paymentMethod } = req.body;
    
    const listing = await Listing.findById(listingId);
    if (!listing) return next(errorHandler(404, 'Listing not found'));
    
    // Fallback if availableRooms missing from old listings
    const available = listing.availableRooms !== undefined ? listing.availableRooms : listing.rooms;
    
    if (available <= 0) {
      return next(errorHandler(400, 'This space is fully booked'));
    }

    const booking = await Booking.create({
      user: req.user.id,
      listing: listingId,
      owner: listing.userRef,
      features,
      finalPrice,
      paymentMethod,
    });

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

export const getOwnerBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ owner: req.user.id })
      .populate('user', 'username email avatar')
      .populate('listing', 'name imageUrls availableRooms rooms')
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

export const approveBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) return next(errorHandler(404, 'Booking not found'));
    if (booking.owner.toString() !== req.user.id) {
      return next(errorHandler(401, 'You can only approve your own property bookings'));
    }
    if (booking.status !== 'pending') {
       return next(errorHandler(400, `Booking is already ${booking.status}`));
    }

    // Decrement listing availability
    const listing = await Listing.findById(booking.listing);
    if (listing) {
      const currentAvail = listing.availableRooms !== undefined ? listing.availableRooms : listing.rooms;
      if (currentAvail > 0) {
        listing.availableRooms = currentAvail - 1;
        await listing.save();
      } else {
        return next(errorHandler(400, 'Cannot approve: Space is fully booked'));
      }
    }

    booking.status = 'approved';
    await booking.save();

    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
};

export const rejectBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) return next(errorHandler(404, 'Booking not found'));
    if (booking.owner.toString() !== req.user.id) {
      return next(errorHandler(401, 'You can only reject your own property bookings'));
    }
    if (booking.status !== 'pending') {
       return next(errorHandler(400, `Booking is already ${booking.status}`));
    }

    booking.status = 'rejected';
    await booking.save();

    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
};

export const getClientBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('listing', 'name imageUrls address type')
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};
