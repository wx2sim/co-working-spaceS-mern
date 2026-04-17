import mongoose from 'mongoose';
import Booking from '../models/booking.model.js';
import User from '../models/user.model.js';
import Listing from '../models/listing.model.js';
import { errorHandler } from '../utils/error.js';

/**
 * Helper to determine date limit and grouping format based on range
 */
const getRangeConfig = (range) => {
    const now = new Date();
    let dateLimit = new Date();
    let format = "%d %b"; // Default: 17 Apr

    switch (range) {
        case 'today':
            dateLimit.setHours(now.getHours() - 24);
            format = "%H:00";
            break;
        case 'week':
            dateLimit.setDate(now.getDate() - 7);
            format = "%d %b";
            break;
        case 'year':
            dateLimit.setFullYear(now.getFullYear() - 1);
            format = "%b %Y";
            break;
        case 'month':
        default:
            dateLimit.setDate(now.getDate() - 30);
            format = "%d %b";
            break;
    }
    return { dateLimit, format };
};

/**
 * SuperAdmin Stats: Platform-wide overview
 */
export const getPlatformStats = async (req, res, next) => {
  try {
    const { range = 'month' } = req.query;
    const { dateLimit, format } = getRangeConfig(range);

    // 1. User Growth (Last X days)
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: dateLimit } } },
      {
        $group: {
          _id: { $dateToString: { format: format, date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // 2. Revenue over time
    const revenueStats = await Booking.aggregate([
      { 
        $match: { 
          status: 'approved',
          updatedAt: { $gte: dateLimit } 
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: format, date: "$updatedAt" } },
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
    const { range = 'month', targetId } = req.query;
    const { dateLimit, format } = getRangeConfig(range);
    
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
          _id: { $dateToString: { format: format, date: "$updatedAt" } },
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
