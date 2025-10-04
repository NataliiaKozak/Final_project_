import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
// 🔹 Middleware для защиты роутов.  API роутов
export const protect = (req, res, next) => {
    const header = req.header('Authorization');
    if (!header || !header.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Нет токена, авторизация отклонена' });
        return;
    }
    try {
        const token = header.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { id: decoded.user_id };
        next();
    }
    catch {
        res.status(401).json({ message: 'Неверный или истекший токен' });
    }
};
// проще, менее строгий: принимает всё, что идёт после пробела. Может «пропустить мусор».
// export const protect = (req: RequestWithUser, res: Response, next: NextFunction): void => {
//   const token = req.header("Authorization")?.split(" ")[1];
//   if (!token) {
//      res.status(401).json({ message: "Нет токена, авторизация отклонена" });
//      return;
//   }
//   try {
//     const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
//     req.user = { id: decoded.id };
//     next();
//   } catch (error) {
//     res.status(401).json({ message: "Неверный токен" });
//   }
// };
//Это «сторож» для роутов.Проверяет, наличие JWT-токена в Authorization (есть ли у запроса валидный Authorization): Bearer <token>.
//Если токен валиден → в req.user добавляется id пользователя.{ id: string }
//Если токен невалидный или отсутствует → запрос получает 401 Unauthorized
//Дальше контроллеры знают, какой пользователь делает запрос.
//# sourceMappingURL=authMiddleware.js.map