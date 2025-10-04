import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const URL = process.env.MONGO_URL;
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log('MongoDB Atlas connected');
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Остановка приложения при ошибке подключения
    }
};
export default connectDB;
//   const connection = await mongoose.connect(process.env.MONGO_URI as string, {});
//     console.log("MongoDB connected.", connection.connection.host);
//# sourceMappingURL=db.js.map