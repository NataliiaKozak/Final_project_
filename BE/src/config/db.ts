import mongoose from 'mongoose';
import { ENV } from './env.js';

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(ENV.MONGO_URI);
    console.log('MongoDB Atlas connected');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('MongoDB connection error:', message);
    process.exit(1);
  }
};

export default connectDB;
