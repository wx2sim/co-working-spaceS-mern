import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import Listing from '../models/listing.model.js';


export const user = (req, res) => {
  res.json({
    message: "api user route is working!!!!"
  })
}

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return next(errorHandler(404, 'User not found'));
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  if (req.user.id.toString() !== req.params.id.toString())
    return next(errorHandler(401, 'You can only update your account!'));

  // Protect superadmin from being modified
  if (req.user.role === 'superadmin') {
    return next(errorHandler(403, 'The superadmin account cannot be modified!'));
  }

  try {
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
        },
      }, { returnDocument: 'after' }
    );
    const { password, role, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id.toString() !== req.params.id.toString())
    return next(errorHandler(401, 'You can only delete your own account!'));

  // Protect superadmin from being deleted
  if (req.user.role === 'superadmin') {
    return next(errorHandler(403, 'The superadmin account cannot be deleted!'));
  }

  try {
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie('access_token');
    res.status(200).json('User has been deleted successfully!');
  } catch (error) {
    next(error);
  }
};
export const getUserListings = async (req, res, next) => {
  if (req.user.id.toString() === req.params.id.toString()) {
    try {
      const listings = await Listing.find({ userRef: req.params.id });
      res.status(200).json(listings);
    } catch (error) {
      next(error);
    }
  } else {
    return next(errorHandler(401, 'You can only view your own listings!'));
  }
};

export const getUser = async (req, res, next) => {
  try {

    const user = await User.findById(req.params.id);

    if (!user) return next(errorHandler(404, 'User not found!'));

    const { password: pass, role, ...rest } = user._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const getTopProviders = async (req, res, next) => {
  try {
    const topSellers = await User.aggregate([
      { $match: { role: 'user' } },
      { $addFields: { idString: { $toString: "$_id" } } },
      {
        $lookup: {
          from: 'listings',
          localField: 'idString',
          foreignField: 'userRef',
          as: 'listings'
        }
      },
      {
        $project: {
          username: 1,
          avatar: 1,
          activityScore: 1,
          listingCount: { $size: '$listings' },
        }
      },
      {
        $addFields: {
          rankScore: { $add: ['$activityScore', { $multiply: ['$listingCount', 5] }] }
        }
      },
      { $sort: { rankScore: -1 } },
      { $limit: 6 }
    ]);

    res.status(200).json(topSellers);
  } catch (error) {
    next(error);
  }
};
