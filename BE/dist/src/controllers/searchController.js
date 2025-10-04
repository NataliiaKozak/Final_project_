import User from "../models/UserModel.js";
export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            res.status(400).json({ message: "Запрос не может быть пустым" });
            return;
        }
        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: "i" } },
                { fullName: { $regex: query, $options: "i" } },
            ],
        }).select("username fullName profile_image");
        // .limit(20); //можно добавить
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: "Ошибка при поиске пользователей" });
    }
};
//# sourceMappingURL=searchController.js.map