import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import postRoutes from "./src/routes/postRoutes.js";
import likeRoutes from "./src/routes/likeRoutes.js";
import commentRoutes from "./src/routes/commentRoutes.js";
import searchRoutes from "./src/routes/searchRoutes.js";
import followRoutes from "./src/routes/followRoutes.js";
import messageRoutes from "./src/routes/messageRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
const app = express();
// cors. Разрешить только фронту с 5173 порта
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
}));
app.use(express.json()); // для JSON
app.use(express.urlencoded({ extended: true })); // для форм
// app.use(cookieParser());
// роуты
app.get('/api/data', (req, res) => {
    res.json({ message: 'CORS работает!' });
});
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/follows", followRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
// обработчик "не найдено" (404)
app.use((req, res) => {
    res.status(404).json({ message: "Страница не найдена" });
});
// обработчик ошибок
app.use((err, req, res, next) => {
    console.error("Ошибка сервера:", err.message);
    res.status(500).json({ message: "Ошибка сервера", error: err.message });
});
export default app;
//Заметки
// app.use(express.json({ limit: '10mb' })); // important for big base64 images
// app.get('/api/health', (_req, res) => res.json({ ok: true }));
//# sourceMappingURL=app.js.map