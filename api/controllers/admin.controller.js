import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';

export const getUsers = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sort = req.query.sort || 'createdAt';
    const order = req.query.order || 'desc';
    const searchTerm = req.query.searchTerm || '';

    // If search term is provided, filter by username or email
    const query = {
      $or: [
        { username: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
      ],
    };

    const users = await User.find(query)
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    const usersWithoutPassword = users.map((user) => {
      const { password, ...rest } = user._doc;
      return rest;
    });

    const totalUsers = await User.countDocuments(query);

    res.status(200).json({
      users: usersWithoutPassword,
      totalUsers,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return next(errorHandler(404, 'User not found!'));
    }
    if (user.role === 'admin' || user.role === 'superadmin') {
      return next(errorHandler(403, 'You cannot delete an admin!'));
    }
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json('User has been deleted successfully!');
  } catch (error) {
    next(error);
  }
};
