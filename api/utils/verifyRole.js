import { errorHandler } from './error.js';

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
   
    if (!req.user) {
      return next(errorHandler(401, 'Unauthorized! Please log in.'));
    }

    
    if (!allowedRoles.includes(req.user.role)) {
      return next(errorHandler(403, 'Forbidden! You do not have permission to perform this action.'));
    }

   
    next();
  };
};