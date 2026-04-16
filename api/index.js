import express from 'express';
import mongoose from 'mongoose';
import userRouter from './routes/user.route.js'
import authRouter from './routes/auth.route.js'
import listingRouter  from './routes/listing.route.js';
import upgradeRouter from './routes/upgrade.route.js';
import adminRouter from './routes/admin.route.js';
import messageRouter from './routes/message.route.js';
import bookingRouter from './routes/booking.route.js';
import taskRouter from './routes/task.route.js';
import reviewRouter from './routes/review.route.js';
import ratingRouter from './routes/rating.route.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { generalLimiter } from './utils/rateLimiters.js';
import mongoSanitize from 'mongo-sanitize';

dotenv.config();

const app = express();

// Security Middleware
app.use(helmet());
app.use(express.json({ limit: '10kb' })); // Body size limit to prevent DDoS
app.use((req, res, next) => {
  req.body = mongoSanitize(req.body); // Prevent NoSQL injection
  next();
});

app.use('/api/', generalLimiter);

app.use(cookieParser());

mongoose.connect(process.env.MONGO).then(() => {
  console.log('Connected to Mongodb');
  app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
}).catch((err) => { console.log('Error Connecting to Mongodb',err)});


app.use('/api/user', userRouter);
app.use('/api/auth' , authRouter);
app.use('/api/listing' , listingRouter);
app.use('/api/upgrade', upgradeRouter);
app.use('/api/admin', adminRouter);
app.use('/api/message', messageRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/task', taskRouter);
app.use('/api/review', reviewRouter);
app.use('/api/rating', ratingRouter);

app.use((err, req, res, next) => {
 const statusCode = err.statusCode || 500;
 const message = err.message || 'internal Server Error';
 return res.status(statusCode).json({
  success: false,
  statusCode,
  message,
 });
});