import express from 'express';
import { verifyUserToken } from '../utils/verifyUser.js';
import { sendMessage, getMessages, markAsRead, getUnreadCount } from '../controllers/message.controller.js';

const router = express.Router();

router.post('/send', verifyUserToken, sendMessage);
router.get('/all', verifyUserToken, getMessages);
router.get('/unread-count', verifyUserToken, getUnreadCount);
router.put('/read/:id', verifyUserToken, markAsRead);

export default router;
