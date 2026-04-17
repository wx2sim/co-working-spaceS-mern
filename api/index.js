import { app, server, io } from './socket.js';
import express from 'express';
import mongoose from 'mongoose';
import userRouter from './routes/user.route.js'
import authRouter from './routes/auth.route.js'
import listingRouter from './routes/listing.route.js';
import upgradeRouter from './routes/upgrade.route.js';
import adminRouter from './routes/admin.route.js';
import messageRouter from './routes/message.route.js';
import bookingRouter from './routes/booking.route.js';
import taskRouter from './routes/task.route.js';
import reviewRouter from './routes/review.route.js';
import ratingRouter from './routes/rating.route.js';
import statsRouter from './routes/stats.route.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { generalLimiter } from './utils/rateLimiters.js';
import mongoSanitize from 'mongo-sanitize';
import cors from 'cors';
import path from 'path';

dotenv.config();

// app is now imported from socket.js

// Security Middleware
app.use(cors({
  origin: 'https://co-working-space-s-mern.vercel.app', // Your frontend URL
  credentials: true
}));
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
  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((err) => { console.log('Error Connecting to Mongodb', err) });

// Fast shutdown for development efficiency
process.on('SIGUSR2', () => {
  if (io) io.close();
  process.exit(0);
});


app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);
app.use('/api/upgrade', upgradeRouter);
app.use('/api/admin', adminRouter);
app.use('/api/message', messageRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/task', taskRouter);
app.use('/api/review', reviewRouter);
app.use('/api/rating', ratingRouter);
app.use('/api/stats', statsRouter);

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, '/client/dist')));

app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'internal Server Error';
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});