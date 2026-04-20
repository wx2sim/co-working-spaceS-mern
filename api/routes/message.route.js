import express from 'express';
import { verifyUserToken } from '../utils/verifyUser.js';
import { sendMessage, getMessages, markAsRead, getUnreadCount, deleteConversation, getNewMessages } from '../controllers/message.controller.js';

const router = express.Router();

router.post('/send', verifyUserToken, sendMessage);
router.get('/all', verifyUserToken, getMessages);
router.get('/new', verifyUserToken, getNewMessages);
router.get('/unread-count', verifyUserToken, getUnreadCount);
router.put('/read/:id', verifyUserToken, markAsRead);
router.delete('/conversation/:contactId', verifyUserToken, deleteConversation);

export default router;
