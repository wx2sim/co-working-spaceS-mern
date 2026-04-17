import Booking from '../models/booking.model.js';
import Listing from '../models/listing.model.js';
import { errorHandler } from '../utils/error.js';
import { getReceiverSocketId, io } from '../socket.js';

export const createBooking = async (req, res, next) => {
  try {
    const { listingId, features, finalPrice, paymentMethod, bookingDate } = req.body;

    if (!bookingDate) return next(errorHandler(400, 'Booking date is required'));

    const listing = await Listing.findById(listingId);
    if (!listing) return next(errorHandler(404, 'Listing not found'));

    // Check if the user already has a pending request for this listing
    const existingPending = await Booking.findOne({
      user: req.user.id,
      listing: listingId,
      status: 'pending'
    });

    if (existingPending) {
      return next(errorHandler(400, "You can't book the same listing twice"));
    }

    // Total capacity of the space
    const capacity = listing.availableRooms !== undefined ? listing.availableRooms : listing.rooms;

    // Count how many ACTIVE (approved) bookings already exist for this date
    // We normalize the date to just YYYY-MM-DD to check the whole day
    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    const activeBookings = await Booking.countDocuments({
      listing: listingId,
      status: 'approved',
      bookingDate: { $gte: startOfDay, $lte: endOfDay }
    });

    if (activeBookings >= capacity) {
      return next(errorHandler(400, 'This space is already fully booked for the selected date.'));
    }

    const booking = await Booking.create({
      user: req.user.id,
      listing: listingId,
      owner: listing.userRef,
      features,
      finalPrice,
      paymentMethod,
      bookingDate: new Date(bookingDate)
    });

    // Notify owner
    const populatedBooking = await Booking.findById(booking._id)
      .populate('user', 'username email avatar')
      .populate('listing', 'name imageUrls availableRooms rooms');

    const receiverSocketId = getReceiverSocketId(listing.userRef);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('new_booking_request', {
        message: `New booking request for ${listing.name}`,
        booking: populatedBooking
      });
    }

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
      const capacity = listing.availableRooms !== undefined ? listing.availableRooms : listing.rooms;

      const startOfDay = new Date(booking.bookingDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(booking.bookingDate);
      endOfDay.setHours(23, 59, 59, 999);

      const activeBookings = await Booking.countDocuments({
        listing: booking.listing,
        status: 'approved',
        bookingDate: { $gte: startOfDay, $lte: endOfDay }
      });

      if (activeBookings >= capacity) {
        return next(errorHandler(400, 'Cannot approve: Space is fully booked for this date'));
      }
    }

    booking.status = 'approved';
    booking.statusSeenByClient = false;
    await booking.save();

    // Notify client
    const receiverSocketId = getReceiverSocketId(booking.user);
    if (receiverSocketId) {
        io.to(receiverSocketId).emit('booking_status_updated', {
            message: `Your booking for property was approved!`,
            booking
        });
    }

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
    booking.statusSeenByClient = false;
    await booking.save();

    // Notify client
    const receiverSocketId = getReceiverSocketId(booking.user);
    if (receiverSocketId) {
        io.to(receiverSocketId).emit('booking_status_updated', {
            message: `Your booking request was rejected.`,
            booking
        });
    }

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

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(errorHandler(404, 'Booking not found'));

    // Check if user is the one who booked or the owner
    if (booking.user.toString() !== req.user.id) {
      return next(errorHandler(401, 'You can only cancel your own bookings'));
    }

    // If it was already approved, restore the availability
    if (booking.status === 'approved') {
      const listing = await Listing.findById(booking.listing);
      if (listing && listing.availableRooms !== undefined) {
        listing.availableRooms = listing.availableRooms + 1;
        await listing.save();
      }
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.status(200).json('Booking has been cancelled');
  } catch (error) {
    next(error);
  }
};

export const getPendingCount = async (req, res, next) => {
    try {
        const count = await Booking.countDocuments({
            owner: req.user.id,
            status: 'pending'
        });
        res.status(200).json({ count });
    } catch (error) {
        next(error);
    }
};
export const getUnseenStatusCount = async (req, res, next) => {
    try {
        const count = await Booking.countDocuments({
            user: req.user.id,
            statusSeenByClient: false
        });
        res.status(200).json({ count });
    } catch (error) {
        next(error);
    }
};

export const markStatusAsSeen = async (req, res, next) => {
    try {
        await Booking.updateMany(
            { user: req.user.id, statusSeenByClient: false },
            { $set: { statusSeenByClient: true } }
        );
        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
};
