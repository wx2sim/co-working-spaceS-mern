import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables from the root .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const migrate = async () => {
  try {
    if (!process.env.MONGO) {
      throw new Error('MONGO connection string not found in .env');
    }

    await mongoose.connect(process.env.MONGO);
    console.log('Connected to MongoDB for migration...');

    const result = await User.updateMany(
      { isVerified: { $exists: false } },
      { $set: { isVerified: true } }
    );

    console.log(`Migration successful!`);
    console.log(`- Matched: ${result.matchedCount}`);
    console.log(`- Modified: ${result.modifiedCount}`);

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();
