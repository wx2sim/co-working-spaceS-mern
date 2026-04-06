import express from 'express';
import { updateUser, user } from '../controllers/user.controller.js';
import {verifyUserToken} from '../utils/verifyUser.js'


const router = express.Router();

router.get('/user' , user);
router.post('/update/:id' ,verifyUserToken , updateUser);

export default router;