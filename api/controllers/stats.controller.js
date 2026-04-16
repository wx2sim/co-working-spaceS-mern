import mongoose from 'mongoose';
import Booking from '../models/booking.model.js';
import User from '../models/user.model.js';
import Listing from '../models/listing.model.js';
import { errorHandler } from '../utils/error.js';

/**
 * SuperAdmin Stats: Platform-wide overview
 */
export const getPlatformStats = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - parseInt(days));

    // 1. User Growth (Last X days)
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: dateLimit } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // 2. Revenue over time (Last X days, based on Approval date)
    const revenueStats = await Booking.aggregate([
      { 
        $match: { 
          status: 'approved',
          updatedAt: { $gte: dateLimit } 
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
          income: { $sum: "$finalPrice" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // 3. Overall Totals
    const totalIncome = await Booking.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: "$finalPrice" } } }
    ]);

    const bookingStatusCounts = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const inventoryStats = await Listing.aggregate([
       { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      userGrowth,
      revenueStats,
      totalIncome: totalIncome[0]?.total || 0,
      bookingStatusCounts,
      inventoryStats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin/Seller Stats: Specific to their own activities
 */
export const getOwnerStats = async (req, res, next) => {
  try {
    const { days = 30, targetId } = req.query;
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - parseInt(days));
    
    // Only superadmin can request stats for a different owner
    let ownerId = req.user.id;
    if (targetId && req.user.role === 'superadmin') {
        ownerId = targetId;
    }

    // 1. Revenue over time (Specific to this owner)
    const revenueStats = await Booking.aggregate([
      { 
        $match: { 
          owner: new mongoose.Types.ObjectId(ownerId),
          status: 'approved',
          updatedAt: { $gte: dateLimit } 
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
          income: { $sum: "$finalPrice" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // 2. Personal Totals
    const totalIncome = await Booking.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(ownerId), status: 'approved' } },
      { $group: { _id: null, total: { $sum: "$finalPrice" } } }
    ]);

    const myBookingStatusCounts = await Booking.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(ownerId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const myInventoryStats = await Listing.aggregate([
       { $match: { userRef: ownerId } },
       { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      revenueStats,
      totalIncome: totalIncome[0]?.total || 0,
      bookingStatusCounts: myBookingStatusCounts,
      inventoryStats: myInventoryStats
    });
  } catch (error) {
    next(error);
  }
};
