import express from 'express';
import { verifyUserToken } from '../utils/verifyUser.js';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/task.controller.js';

const router = express.Router();

router.get('/all', verifyUserToken, getTasks);
router.post('/create', verifyUserToken, createTask);
router.put('/update/:id', verifyUserToken, updateTask);
router.delete('/delete/:id', verifyUserToken, deleteTask);

export default router;
