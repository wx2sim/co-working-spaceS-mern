import express from 'express';
import { updateUser, user ,deleteUser } from '../controllers/user.controller.js';
import {verifyUserToken} from '../utils/verifyUser.js'


const router = express.Router();

router.get('/user' , user);
router.post('/update/:id' ,verifyUserToken , updateUser);
router.delete('/delete/:id', verifyUserToken, deleteUser);

export default router;