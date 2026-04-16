import express from 'express';
import { verifyUserToken } from '../utils/verifyUser.js';
import { sendMessage, getMessages, markAsRead } from '../controllers/message.controller.js';

const router = express.Router();

router.post('/send', verifyUserToken, sendMessage);
router.get('/all', verifyUserToken, getMessages);
router.put('/read/:id', verifyUserToken, markAsRead);

export default router;
