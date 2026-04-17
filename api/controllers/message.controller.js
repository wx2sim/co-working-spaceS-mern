import Message from '../models/message.model.js';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import { getReceiverSocketId, io } from '../socket.js';

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

    // Notify receiver with populated data
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'username avatar email')
      .populate('receiver', 'username avatar email')
      .populate('listing', 'name imageUrls');

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive_message', populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const startIndex = parseInt(req.query.startIndex) || 0;

    // Get messages where the current user is either sender or receiver and hasn't deleted them
    const messages = await Message.find({
      $and: [
        { $or: [{ sender: req.user.id }, { receiver: req.user.id }] },
        { deletedBy: { $ne: req.user.id } }
      ]
    })
    .populate('sender', 'username avatar email')
    .populate('receiver', 'username avatar email')
    .populate('listing', 'name imageUrls')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex);

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

export const getUnreadCount = async (req, res, next) => {
  try {
    const unreadSenders = await Message.distinct('sender', {
      receiver: req.user.id,
      read: false
    });
    
    res.status(200).json({ count: unreadSenders.length });
  } catch (error) {
    next(error);
  }
};

export const deleteConversation = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const userId = req.user.id;

    const currentUser = await User.findById(userId);
    const contactUser = await User.findById(contactId);

    if (!currentUser || !contactUser) {
        return next(errorHandler(404, 'User not found'));
    }

    const isCurrentAdminType = ['admin', 'superadmin'].includes(currentUser.role);
    const isContactAdminType = ['admin', 'superadmin'].includes(contactUser.role);

    // "except admin -superadmin messages"
    if (isCurrentAdminType && isContactAdminType) {
      return next(errorHandler(403, 'Conversations between administrators cannot be deleted.'));
    }

    await Message.updateMany(
      {
        $or: [
          { sender: userId, receiver: contactId },
          { sender: contactId, receiver: userId }
        ],
        deletedBy: { $ne: userId }
      },
      {
        $addToSet: { deletedBy: userId }
      }
    );

    res.status(200).json({ success: true, message: 'Conversation deleted from your view.' });
  } catch (error) {
    next(error);
  }
};
