import { errorHandler } from './api/utils/error.js';
import { sendEmail } from './api/utils/sendEmail.js';
import { verifyUserToken, checkVerification } from './api/utils/verifyUser.js';
import { requireRole } from './api/utils/verifyRole.js';
import userReducer, { signInStart, signInSuccess, signInFailure } from './client/src/redux/user/userSlice.js';
import jwt from 'jsonwebtoken';
import User from './api/models/user.model.js';
import nodemailer from 'nodemailer';

// Mocking dependencies
jest.mock('jsonwebtoken');
jest.mock('./api/models/user.model.js');
jest.mock('nodemailer');

describe('Unit Tests for App Utility Functions', () => {
  
  describe('errorHandler', () => {
    it('should create an error with a status code and message', () => {
      const statusCode = 404;
      const message = 'Not Found';
      const error = errorHandler(statusCode, message);
      
      expect(error).toBeInstanceOf(Error);
      expect(error.statusCode).toBe(statusCode);
      expect(error.message).toBe(message);
    });
  });

  describe('sendEmail', () => {
    beforeEach(() => {
      process.env.EMAIL_USER = 'test@example.com';
      process.env.EMAIL_PASS = 'password';
      jest.clearAllMocks();
    });

    it('should throw error if email environment variables are missing', async () => {
      delete process.env.EMAIL_USER;
      await expect(sendEmail({ email: 'to@example.com' })).rejects.toThrow(/Email configuration error/);
    });

    it('should call nodemailer with correct options', async () => {
      const sendMailMock = jest.fn().mockResolvedValue({ messageId: '123' });
      nodemailer.createTransport.mockReturnValue({
        sendMail: sendMailMock
      });

      const options = {
        email: 'to@example.com',
        subject: 'Test Subject',
        html: '<p>Test</p>'
      };

      await sendEmail(options);

      expect(nodemailer.createTransport).toHaveBeenCalled();
      expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
        to: options.email,
        subject: options.subject,
        html: options.html
      }));
    });
  });

  describe('verifyUserToken', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        cookies: { access_token: 'valid-token' },
        get: jest.fn().mockReturnValue('localhost')
      };
      res = {
        clearCookie: jest.fn()
      };
      next = jest.fn();
      jest.clearAllMocks();
      process.env.JWT_SECRET = 'test-secret';
    });

    it('should return 401 error if no token is present', () => {
      req.cookies.access_token = null;
      verifyUserToken(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });

    it('should return 403 error if token is invalid', () => {
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(new Error('Invalid token'));
      });
      verifyUserToken(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    });
  });

  describe('requireRole', () => {
    it('should allow access if user has required role', () => {
      const req = { user: { role: 'admin' } };
      const res = {};
      const next = jest.fn();
      const middleware = requireRole(['admin', 'editor']);
      
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.anything());
    });

    it('should return 401 if user is not logged in', () => {
      const req = { user: null };
      const res = {};
      const next = jest.fn();
      const middleware = requireRole(['admin']);
      
      middleware(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });

    it('should return 403 if user does not have required role', () => {
      const req = { user: { role: 'user' } };
      const res = {};
      const next = jest.fn();
      const middleware = requireRole(['admin']);
      
      middleware(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    });
  });

  describe('checkVerification', () => {
    it('should call next if user is verified', () => {
      const req = { user: { isVerified: true } };
      const res = {};
      const next = jest.fn();
      
      checkVerification(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.anything());
    });

    it('should return 403 error if user is not verified', () => {
      const req = { user: { isVerified: false } };
      const res = {};
      const next = jest.fn();
      
      checkVerification(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    });
  });

  describe('Redux User Slice', () => {
    const initialState = {
      currentUser: null,
      error: null,
      loading: false
    };

    it('should handle signInStart', () => {
      const nextState = userReducer(initialState, signInStart());
      expect(nextState.loading).toBe(true);
    });

    it('should handle signInSuccess', () => {
      const user = { id: 1, name: 'Test User' };
      const nextState = userReducer(initialState, signInSuccess(user));
      expect(nextState.currentUser).toEqual(user);
      expect(nextState.loading).toBe(false);
      expect(nextState.error).toBe(null);
    });

    it('should handle signInFailure', () => {
      const error = 'Invalid credentials';
      const nextState = userReducer(initialState, signInFailure(error));
      expect(nextState.error).toBe(error);
      expect(nextState.loading).toBe(false);
    });
  });

});
