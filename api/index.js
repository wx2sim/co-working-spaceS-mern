import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js'
import authRouter from './routes/auth.route.js'
dotenv.config();


mongoose.connect(process.env.MONGO).then(() => {
  console.log('Connected to Mongodb');
} 
 ).catch((err) => { console.log('Error Connecting to Mongodb',err)});
const app = express();

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

app.use('/api/user', userRouter);
app.use(express.json());
app.use('/api/auth' , authRouter);

app.use((err, req, res, next) => {
 const statusCode = err.statusCode || 500;
 const message = err.message || 'internal Server Error';
 return res.status(statusCode).json({
  success: false,
  statusCode,
  message,
 });
});