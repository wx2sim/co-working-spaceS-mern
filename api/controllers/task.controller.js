import Task from '../models/task.model.js';
import { errorHandler } from '../utils/error.js';

export const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({}).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      return next(errorHandler(403, 'Only admins can create tasks'));
    }
    const { title, date, time } = req.body;
    const newTask = new Task({ title, date, time });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      return next(errorHandler(403, 'Only admins can update tasks'));
    }
    const { id } = req.params;
    const task = await Task.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      return next(errorHandler(403, 'Only admins can delete tasks'));
    }
    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};
