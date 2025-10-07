import User from '../models/UserModel.js';
import dotenv from 'dotenv';
import { sendResetPasswordEmail } from '../utils/mailer.js';
import { generateToken, generateResetToken, verifyResetToken, } from '../config/jwt.js';
dotenv.config();
// =================== REGISTER ===================
export const registerUser = async (req, res) => {
    try {
        const { username, email, password, fullName } = req.body;
        // Проверка уникальности (email или username)
        // было:
        // const existingUser = await User.findOne({ email });
        //     if (existingUser) {
        //        res.status(400).json({ message: "Email уже используется" });
        //        return;
        //     }
        //     const existingUserName = await User.findOne({ username });
        //     if (existingUserName) {
        //        res.status(400).json({ message: "Username уже используется" });
        //        return;
        //     }
        const existing = await User.findOne({ $or: [{ email }, { username }] });
        if (existing) {
            const errors = {};
            if (existing.email === email)
                errors.email = 'Email уже используется';
            if (existing.username === username)
                errors.username = 'Username уже используется';
            res.status(400).json({ errors });
            return;
        }
        // NOTE: в модели User должен быть pre('save') для хеширования пароля.
        const newUser = new User({ username, email, password, fullName });
        await newUser.save();
        // Генерируем токен (в теле ответа — т.к. ты хочешь хранить в localStorage)
        const token = generateToken(newUser);
        // Возвращаем минимальные данные пользователя (без пароля)//добавлено
        const userPublic = {
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            fullName: newUser.fullName,
            profileImage: newUser.profileImage || '',
        };
        res.status(201).json({ token, user: userPublic });
    }
    catch (err) {
        const error = err;
        res.status(500).json({
            message: 'Ошибка сервера при регистрации',
            error: error.message,
        });
    }
};
// =================== LOGIN ===================
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = (await User.findOne({ email })); // вместо any → IUser
        if (!user) {
            res.status(400).json({ message: 'Неверные учетные данные' });
            return;
        }
        // Используем метод модели comparePassword, если он есть; иначе bcrypt.compare
        // (в модели мы добавили userSchema.methods.comparePassword)
        // теперь можно вызывать метод модели
        //было
        // const isMatch = await bcrypt.compare(password, user.password);
        // const isMatch =
        //   typeof (user as any).comparePassword === 'function'
        //     ? await (user as any).comparePassword(password)
        //     : await bcrypt.compare(password, user.password);
        // переносим логику проверки пароля в модель 
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(400).json({ message: 'Неверные учетные данные' });
            return;
        }
        const token = generateToken(user);
        const userPublic = {
            _id: user._id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            profileImage: user.profileImage || '',
        };
        res.status(200).json({ token, user: userPublic });
    }
    catch (err) {
        const error = err;
        res
            .status(500)
            .json({ message: 'Ошибка сервера при логине', error: error.message });
    }
};
// =================== REQUEST RESET(FORGOT password)  ===================
export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email)
            return res.status(400).json({ message: 'Email обязателен' });
        const user = await User.findOne({ email });
        if (!user) {
            // Не даём подсказку о наличии email? Здесь возвращаем 400, но можно вернуть 200 (без утечки).
            return res.status(400).json({ message: 'Пользователь не найден' });
        }
        const token = generateResetToken(user._id.toString());
        // Отправляем письмо — в prod не возвращаем токен в ответе
        await sendResetPasswordEmail(email, token);
        // console.log("token: ", token)
        // Для разработки можно вернуть token (удалить в проде)
        res.json({
            message: 'Ссылка для сброса пароля отправлена на email' /*, token */,
        });
    }
    catch (err) {
        const error = err;
        res.status(500).json({
            message: 'Ошибка при запросе сброса пароля',
            error: error.message,
        });
    }
};
// =================== RESET PASSWORD ===================
export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword)
            return res.status(400).json({ message: 'Недостаточно данных' });
        // валидируем токен сброса
        const decoded = verifyResetToken(token);
        if (!decoded || !decoded.id) {
            return res
                .status(400)
                .json({ message: 'Некорректный или просроченный токен' });
        }
        const user = await User.findById(decoded.id); //дженерик
        if (!user) {
            res.status(404).json({ message: 'Пользователь не найден' });
            return;
        }
        // Присваиваем новый пароль — pre('save') в модели хеширует его
        user.password = newPassword;
        await user.save();
        res.json({ message: 'Пароль успешно обновлён' });
    }
    catch (err) {
        const error = err;
        res
            .status(500)
            .json({ message: 'Ошибка при сбросе пароля', error: error.message });
    }
};
//# sourceMappingURL=authController.js.map