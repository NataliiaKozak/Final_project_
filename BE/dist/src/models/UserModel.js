import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    fullName: { type: String, required: true },
    bio: { type: String, default: '', maxlength: 150 },
    profileImage: { type: String, default: '' },
    website: { type: String, default: '' },
    // followers/following arrays are NOT used — the Follow model is the single
    // source of truth for subscription relationships. These arrays were never
    // pushed to/pulled from; counts come from Follow.countDocuments() in userController.
    // followers: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    // following: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
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
// Virtual followersCount/followingCount removed — counts come from
// Follow.countDocuments() in userController, not from User arrays.
// UserSchema.virtual('followersCount').get(function (this: IUser) {
//   return (this.followers ?? []).length;
// });
// UserSchema.virtual('followingCount').get(function (this: IUser) {
//   return (this.following ?? []).length;
// });
// чтобы virtual попадали в JSON
UserSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
        delete ret.id;
        return ret;
    },
});
UserSchema.set('toObject', { virtuals: true });
export default mongoose.model('User', UserSchema);
//# sourceMappingURL=UserModel.js.map