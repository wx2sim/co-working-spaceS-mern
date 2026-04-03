import User from '../models/user.model.js'
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
export const signup = async (req , res ,next) => {

   const {username , email ,password } = req.body;
   const HashedPassword = bcryptjs.hashSync(password, 10);
   const newUser = new User({username , email ,password: HashedPassword});
   try {
      await newUser.save();
      res.status(201).json('new user created secessfully!');
      
   } catch (error) {
     next(error);
   }

};
export const signin = async (req , res ,next) => {
   const { email ,password } = req.body;
   try {
      const validUser = await User.findOne({email: email});
      if (!validUser){
      return next(errorHandler(404,'User Not Found!'));
      }
      const validPassword = bcryptjs.compareSync(password, validUser.password);
      if (!validPassword){
      return next(errorHandler(401,'Wrong Credentials!!'));
   }
      const token = jwt.sign({id: validUser._id}, process.env.JWT_SECRET_KEY);
      const {password: pass, ...rest} = validUser._doc;
      res.cookie('access_token', token, {HttpOnly: true}).status(200).json({rest});
      
   } catch (error) {
      next(error);
   }
};