import mongoose from 'mongoose';
import { ENV } from './env.js';
const connectDB = async () => {
    try {
        await mongoose.connect(ENV.MONGO_URI);
        console.log('MongoDB Atlas connected');
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('MongoDB connection error:', message);
        process.exit(1);
    }
};
export default connectDB;
//# sourceMappingURL=db.js.map