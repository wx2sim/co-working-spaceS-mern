import User from '../models/user.model.js'
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/sendEmail.js';


export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  const HashedPassword = bcryptjs.hashSync(password, 10);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  const newUser = new User({
    username,
    email,
    password: HashedPassword,
    verificationOTP: otp,
    otpExpires,
  });

  try {
    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully! Please sign in to verify your email.'
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists!`;
      return next(errorHandler(400, message));
    }
    next(error);
  }
};
export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, 'User not found!'));
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, 'Wrong credentials!'));

    if (!validUser.isVerified) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      validUser.verificationOTP = otp;
      validUser.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await validUser.save();

      const emailOptions = {
        email: validUser.email,
        subject: 'CoSpace - Verify your Email (New Login)',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #4F46E5; text-align: center;">Welcome back!</h2>
            <p>Here is your new verification code to activate your account:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; background: #F3F4F6; padding: 10px 20px; border-radius: 5px; border: 1px dashed #4F46E5;">${otp}</span>
            </div>
            <p>This code will expire in <strong>10 minutes</strong>.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #888; text-align: center;">&copy; 2026 CoSpace Application. All rights reserved.</p>
          </div>
        `,
      };

      try {
        await sendEmail(emailOptions);
      } catch (emailError) {
        console.error('Error sending signin verification email:', emailError);
      }
    }

    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
    const { password: pass, ...rest } = validUser._doc;
    res
      .cookie('access_token', token, {
        httpOnly: true,
        secure: true, // required for sameSite: 'none'
        sameSite: 'none'
      })
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
  }
};
export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = user._doc;

      res
        .cookie('access_token', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'none'
        })
        .status(200)
        .json(rest);
    } else {
      const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);

      const newUser = new User({
        username: req.body.name.split(" ").join("").toLowerCase() + Math.random().toString(36).slice(-8),
        email: req.body.email,
        password: hashedPassword,
        avatar: req.body.photo,
        role: req.body.role || 'client',
        isVerified: true // Auto-verify Google users
      });

      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = newUser._doc;

      res
        .cookie('access_token', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'none'
        })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};
export const signOut = async (req, res, next) => {
  try {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });
    res.status(200).json('User has been Signed out Successfully');
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return next(errorHandler(404, 'User not found!'));

    if (user.isVerified) return next(errorHandler(400, 'User is already verified!'));

    if (user.verificationOTP !== otp) return next(errorHandler(400, 'Invalid OTP!'));

    if (user.otpExpires < Date.now()) return next(errorHandler(400, 'OTP has expired!'));

    user.isVerified = true;
    user.verificationOTP = undefined;
    user.otpExpires = undefined;
    await user.save();

    const { password: pass, ...rest } = user._doc;
    res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
      user: rest
    });
  } catch (error) {
    next(error);
  }
};

export const resendOTP = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return next(errorHandler(404, 'User not found!'));

    if (user.isVerified) return next(errorHandler(400, 'User is already verified!'));

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationOTP = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    const emailOptions = {
      email: user.email,
      subject: 'CoSpace - New Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #4F46E5; text-align: center;">New Verification Code</h2>
          <p>You requested a new verification code. Please use the code below to activate your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; background: #F3F4F6; padding: 10px 20px; border-radius: 5px; border: 1px dashed #4F46E5;">${otp}</span>
          </div>
          <p>This code will expire in <strong>10 minutes</strong>.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888; text-align: center;">&copy; 2026 CoSpace Application. All rights reserved.</p>
        </div>
      `,
    };

    let emailSent = true;
    try {
      await sendEmail(emailOptions);
    } catch (emailError) {
      console.error('Error resending verification OTP:', emailError);
      emailSent = false;
    }

    res.status(200).json({
      success: true,
      emailSent,
      message: emailSent
        ? 'OTP resent successfully!'
        : 'OTP regeneration successful, but we could not send the email. Please try again later.'
    });
  } catch (error) {
    next(error);
  }
};