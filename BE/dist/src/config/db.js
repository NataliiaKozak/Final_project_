import mongoose from 'mongoose';
import { ENV } from './env.js';
import logger from './logger.js';
const connectDB = async () => {
    try {
        await mongoose.connect(ENV.MONGO_URI);
        logger.info('MongoDB Atlas connected');
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error('MongoDB connection error:', { error: message });
        process.exit(1);
    }
};
export default connectDB;
//# sourceMappingURL=db.js.map