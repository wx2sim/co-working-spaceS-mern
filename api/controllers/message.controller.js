import Message from '../models/message.model.js';
import { errorHandler } from '../utils/error.js';

export const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, listingId, content } = req.body;
    
    if (!content) {
      return next(errorHandler(400, 'Message content is required'));
    }

    const newMessage = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      listing: listingId || null,
      content
    });

    res.status(201).json(newMessage);
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    // Get messages where the current user is either sender or receiver
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }]
    })
    .populate('sender', 'username avatar email')
    .populate('receiver', 'username avatar email')
    .populate('listing', 'name imageUrls')
    .sort({ createdAt: -1 });

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return next(errorHandler(404, 'Message not found'));
    }

    // Only receiver can mark as read
    if (message.receiver.toString() !== req.user.id) {
      return next(errorHandler(401, 'You can only mark your own messages as read'));
    }

    message.read = true;
    await message.save();

    res.status(200).json(message);
  } catch (error) {
    next(error);
  }
};
