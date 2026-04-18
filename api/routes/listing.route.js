import express from 'express';
import { createListing, deleteListing, updateListing, getListing, getListings } from '../controllers/listing.controller.js';
import {  verifyUserToken, checkVerification } from '../utils/verifyUser.js';
import { requireRole } from '../utils/verifyRole.js'

const router = express.Router();

router.post('/create', verifyUserToken, checkVerification, requireRole([ 'superadmin', 'admin', 'user' ]) , createListing);
router.delete('/delete/:id', verifyUserToken, checkVerification, requireRole([ 'superadmin', 'admin', 'user' ]) , deleteListing);
router.post('/update/:id', verifyUserToken, checkVerification, requireRole([ 'superadmin', 'admin', 'user' ]) , updateListing);
router.get('/get/:id', getListing);
router.get('/get', getListings);

export default router;