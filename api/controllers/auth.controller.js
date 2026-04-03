import User from '../models/user.model.js'
import bcryptjs from 'bcryptjs';

export const signup = async (req , res) => {

   const {username , email ,password } = req.body;
   const HashedPassword = bcryptjs.hashSync(password, 10);
   const newUser = new User({username , email ,password: HashedPassword});
   try {
      await newUser.save();
      res.status(201).json('new user created secessfully!');
      
   } catch (error) {
      res.status(500).json(error.message)
   }

}