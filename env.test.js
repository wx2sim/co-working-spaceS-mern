/**
 * @file env.test.js
 * @description Comprehensive Unit Testing suite for CoSpace MERN Application.
 * Covers both Backend utility functions, controllers, and Frontend Redux state management.
 */

import { errorHandler } from './api/utils/error.js';
import { sendEmail } from './api/utils/sendEmail.js';
import { verifyUserToken, checkVerification } from './api/utils/verifyUser.js';
import { requireRole } from './api/utils/verifyRole.js';
import { getMe, updateUser, deleteUser } from './api/controllers/user.controller.js';
import { verifyEmail, resendOTP } from './api/controllers/auth.controller.js';
import userReducer, { 
  signInStart, signInSuccess, signInFailure,
  updateUserStart, updateUserSuccess, updateUserFailure,
  deleteUserStart, deleteUserSuccess, deleteUserFailure,
  signOutUserStart, signOutUserSuccess, signOutUserFailure,
  clearError 
} from './client/src/redux/user/userSlice.js';
import jwt from 'jsonwebtoken';
import User from './api/models/user.model.js';
import nodemailer from 'nodemailer';

// ==========================================
// MOCKING DEPENDENCIES
// ==========================================
jest.mock('jsonwebtoken');
jest.mock('./api/models/user.model.js');
jest.mock('nodemailer');
jest.mock('./api/models/listing.model.js');

describe('--- CO-WORKING SPACES MERN: UNIT TESTS ---', () => {

  // ==========================================
  // BACKEND UTILITY TESTS
  // ==========================================
  describe('Backend Utilities', () => {
    
    /**
     * Test Case: Custom Error Handler
     * Ensures errors are created with correct status codes and messages.
     */
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

    /**
     * Test Case: Email Service (nodemailer)
     * Mocks the transporter and verifies that sendEmail calls it correctly.
     */
    describe('sendEmail Service', () => {
      beforeEach(() => {
        process.env.EMAIL_USER = 'test@example.com';
        process.env.EMAIL_PASS = 'password';
        jest.clearAllMocks();
      });

      it('should throw error if email environment variables are missing', async () => {
        delete process.env.EMAIL_USER;
        await expect(sendEmail({ email: 'to@example.com' })).rejects.toThrow(/Email configuration error/);
      });

      it('should call nodemailer transporter with correct mail options', async () => {
        const sendMailMock = jest.fn().mockResolvedValue({ messageId: '123' });
        nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

        const options = { email: 'to@example.com', subject: 'Test', html: '<p>Hi</p>' };
        await sendEmail(options);

        expect(nodemailer.createTransport).toHaveBeenCalled();
        expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({ to: options.email }));
      });
    });

    /**
     * Test Case: Authentication Middleware (verifyUserToken)
     * Tests JWT verification and user population on the request object.
     */
    describe('verifyUserToken Middleware', () => {
      let req, res, next;

      beforeEach(() => {
        req = { cookies: { access_token: 'valid-token' }, get: jest.fn().mockReturnValue('localhost') };
        res = { clearCookie: jest.fn() };
        next = jest.fn();
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'test-secret';
      });

      it('should return 401 if no access token is provided', () => {
        req.cookies.access_token = null;
        verifyUserToken(req, res, next);
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
      });

      it('should return 403 if token is invalid or expired', () => {
        jwt.verify.mockImplementation((token, secret, callback) => callback(new Error('Invalid'), null));
        verifyUserToken(req, res, next);
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
      });
    });
  });

  // ==========================================
  // BACKEND CONTROLLER TESTS
  // ==========================================
  describe('Backend Controllers (User Logic)', () => {
    let req, res, next;

    beforeEach(() => {
      req = { user: { id: 'user123' }, params: { id: 'user123' }, body: {} };
      res = { 
        status: jest.fn().mockReturnThis(), 
        json: jest.fn().mockReturnThis(),
        clearCookie: jest.fn()
      };
      next = jest.fn();
      jest.clearAllMocks();
    });

    /**
     * Test: getMe (Fetch current user profile)
     */
    it('getMe: should return user data excluding password', async () => {
      const mockUser = { _id: 'user123', username: 'testuser' };
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await getMe(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    /**
     * Test: updateUser (Security & Persistence)
     */
    describe('updateUser', () => {
      it('should prevent updating other users profiles (401)', async () => {
        req.params.id = 'other456';
        await updateUser(req, res, next);
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
      });

      it('should prevent modifying the superadmin account (403)', async () => {
        req.user.role = 'superadmin';
        await updateUser(req, res, next);
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
      });
    });

    /**
     * Test: deleteUser (Security & Cookie Cleanup)
     */
    describe('deleteUser', () => {
      it('should clear access_token cookie on successful deletion', async () => {
        User.findByIdAndDelete.mockResolvedValue(true);
        await deleteUser(req, res, next);
        expect(res.clearCookie).toHaveBeenCalledWith('access_token');
        expect(res.status).toHaveBeenCalledWith(200);
      });
    });

    /**
     * Test: Auth Email Verification
     */
    describe('Auth Verification', () => {
      it('verifyEmail: should return 400 if OTP is incorrect', async () => {
        req.body = { email: 'test@test.com', otp: 'wrong' };
        User.findOne.mockResolvedValue({ email: 'test@test.com', verificationOTP: '123456' });
        
        await verifyEmail(req, res, next);
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
      });

      it('resendOTP: should generate new OTP and call sendEmail', async () => {
        req.body = { email: 'test@test.com' };
        const mockUser = { email: 'test@test.com', isVerified: false, save: jest.fn() };
        User.findOne.mockResolvedValue(mockUser);
        
        await resendOTP(req, res, next);
        expect(mockUser.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
      });
    });
  });

  // ==========================================
  // FRONTEND REDUX STATE TESTS (userSlice)
  // ==========================================
  describe('Frontend Redux: userSlice Reducers', () => {
    const initialState = { currentUser: null, error: null, loading: false };

    it('should handle signInStart (loading state)', () => {
      const state = userReducer(initialState, signInStart());
      expect(state.loading).toBe(true);
    });

    it('should handle signInSuccess (population state)', () => {
      const user = { username: 'john_doe', email: 'john@test.com' };
      const state = userReducer(initialState, signInSuccess(user));
      expect(state.currentUser).toEqual(user);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should handle updateUserSuccess (refreshing profile)', () => {
      const updatedUser = { username: 'john_new', email: 'john@test.com' };
      const state = userReducer({ currentUser: { username: 'old' } }, updateUserSuccess(updatedUser));
      expect(state.currentUser.username).toBe('john_new');
    });

    it('should handle signOutUserSuccess (clearing state)', () => {
      const state = userReducer({ currentUser: { id: 1 } }, signOutUserSuccess());
      expect(state.currentUser).toBe(null);
    });

    it('should handle clearError', () => {
      const state = userReducer({ error: 'Some error' }, clearError());
      expect(state.error).toBe(null);
    });
  });

});
