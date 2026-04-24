import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';
import User from '../models/user.model.js';

export const verifyUserToken = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) return next(errorHandler(401, 'Unauthorized to do changes'));
  
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return next(errorHandler(403, 'Forbidden'));
    
    try {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        res.clearCookie('access_token', {
          httpOnly: true,
          secure: req.get('host').indexOf('localhost') === -1,
          sameSite: req.get('host').indexOf('localhost') === -1 ? 'none' : 'lax'
        });
        return next(errorHandler(404, 'User not found'));
      }
      
      req.user = user;
      req.user.id = user._id.toString(); 
      
      next();
    } catch (error) {
      next(error);
    }
  });
};

export const checkVerification = (req, res, next) => {
  if (!req.user.isVerified) {
    return next(errorHandler(403, 'Your email is not verified! Please verify your email to access this feature.'));
  }
  next();
};