import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false }, //пароль не выбираем по умолчанию, после проверки в постман
    fullName: { type: String, required: true },
    bio: { type: String, default: '', maxlength: 150 },
    profileImage: { type: String, default: '' },
    website: { type: String, default: '' },
    followers: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
}, { timestamps: true });
// Хэширование пароля
UserSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password'))
        return next();
    try {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        next();
    }
    catch (err) {
        next(err);
    }
});
// Сравнение паролей
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};
// Виртуальные поля
UserSchema.virtual('posts', {
    ref: 'Post', // модель, с которой связываем
    localField: '_id', // поле в User
    foreignField: 'author', // поле в Post
});
UserSchema.virtual('followersCount').get(function () {
    // return this.followers.length;чтобы  не упасть на length, устойчиво к undefined. Постман: список постов
    return (this.followers ?? []).length;
});
UserSchema.virtual('followingCount').get(function () {
    // return this.following.length;чтобы  не упасть на length, устойчиво к undefined. 
    return (this.following ?? []).length;
});
// чтобы virtual попадали в JSON
UserSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
        // ret.id = String(ret._id);
        delete ret.id; // ← убираем _id
        return ret;
    },
});
UserSchema.set('toObject', { virtuals: true });
export default mongoose.model('User', UserSchema);
// const User = mongoose.model<IUser>("User", UserSchema);
// Здесь IUser передаётся как дженерик в mongoose.model<IUser>.
// Это нужно, чтобы связать твой интерфейс (TypeScript) с тем, что хранится в MongoDB.
// "типизированный контракт" между MongoDB и твоим TypeScript-кодом
//# sourceMappingURL=UserModel.js.map