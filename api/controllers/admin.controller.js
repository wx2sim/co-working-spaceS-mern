import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import bcryptjs from 'bcryptjs';

export const createAdmin = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return next(errorHandler(400, 'Username, email, and password are required.'));
    }

    if (req.user.role !== 'superadmin') {
      return next(errorHandler(403, 'Only superadmin can create admins.'));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return next(errorHandler(400, 'User with this email or username already exists.'));
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newAdmin = new User({
      username,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    await newAdmin.save();
    const { password: pass, ...rest } = newAdmin._doc;
    res.status(201).json(rest);
  } catch (error) {
    next(error);
  }
};

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

    // Hide superadmin from other dashboards
    if (req.user.role === 'admin') {
      query.role = { $nin: ['superadmin', 'admin'] };
    } else if (req.user.role !== 'superadmin') {
      query.role = { $ne: 'superadmin' };
    }

    if (req.query.roleFilter) {
      query.role = req.query.roleFilter;
    }

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

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    
    if (!['client', 'user', 'admin'].includes(role)) {
      return next(errorHandler(400, 'Invalid role specified.'));
    }

    const userToUpdate = await User.findById(req.params.userId);
    if (!userToUpdate) {
      return next(errorHandler(404, 'User not found!'));
    }

    if (userToUpdate.role === 'superadmin') {
      return next(errorHandler(403, 'Superadmin role cannot be modified!'));
    }

    userToUpdate.role = role;
    await userToUpdate.save();

    res.status(200).json({ message: `User role successfully updated to ${role}.` });
  } catch (error) {
    next(error);
  }
};

export const getSupportAdmin = async (req, res, next) => {
  try {
    const admin = await User.findOne({ role: 'superadmin' });
    if (!admin) return next(errorHandler(404, 'No superadmin currently available.'));
    res.status(200).json({ _id: admin._id, username: admin.username, avatar: admin.avatar });
  } catch (err) {
    next(err);
  }
};
