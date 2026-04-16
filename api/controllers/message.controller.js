import Message from '../models/message.model.js';
import User from '../models/user.model.js';
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

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: contactId },
        { sender: contactId, receiver: userId }
      ]
    });

    for (let msg of messages) {
       if (!msg.deletedBy.includes(userId)) {
           msg.deletedBy.push(userId);
           await msg.save();
       }
    }

    res.status(200).json({ success: true, message: 'Conversation deleted from your view.' });
  } catch (error) {
    next(error);
  }
};
