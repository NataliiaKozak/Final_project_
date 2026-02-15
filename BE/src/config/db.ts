import mongoose from 'mongoose';
import { ENV } from './env.js';
import logger from './logger.js';

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(ENV.MONGO_URI);
    logger.info('MongoDB Atlas connected');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('MongoDB connection error:', { error: message });
    process.exit(1);
  }
};

export default connectDB;
