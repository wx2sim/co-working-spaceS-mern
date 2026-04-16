import express from 'express';
import { updateUser, user ,deleteUser, getUserListings ,getUser, getMe, getTopProviders } from '../controllers/user.controller.js';
import {verifyUserToken} from '../utils/verifyUser.js'


const router = express.Router();

router.get('/user' , user);
router.get('/me', verifyUserToken, getMe);
router.get('/top-providers', getTopProviders);
router.post('/update/:id' ,verifyUserToken , updateUser);
router.delete('/delete/:id', verifyUserToken, deleteUser);
router.get('/listings/:id', verifyUserToken, getUserListings );
router.get('/:id', verifyUserToken, getUser)

export default router;