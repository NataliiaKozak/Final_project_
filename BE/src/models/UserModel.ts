import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcrypt';
import { IPost } from './PostModel'; //  чтобы типизировать posts виртуально

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  fullName: string;
  bio?: string;
  profile_image?: string;
  website?: string;
  // posts?: Types.ObjectId[]; // или IPost[]
  posts?: IPost[];
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
  comparePassword(candidatePassword: string): Promise<boolean>;
  followersCount?: number;
  followingCount?: number;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    bio: { type: String, default: '' },
    profile_image: { type: String, default: '' },
    website: { type: String, default: "" },
    followers: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  },
  { timestamps: true }
);

// Хэширование пароля
UserSchema.pre('save', async function (next) {
  const user = this as IUser;
  if (!user.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

// Сравнение паролей
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Виртуальные поля
UserSchema.virtual('posts', {
  ref: 'Post', // модель, с которой связываем
  localField: '_id', // поле в User
  foreignField: 'author', // поле в Post
});

UserSchema.virtual('followersCount').get(function (this: IUser) {
  return this.followers.length;
});

UserSchema.virtual('followingCount').get(function (this: IUser) {
  return this.following.length;
});

// чтобы virtual попадали в JSON
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

export default mongoose.model<IUser>('User', UserSchema);

// const User = mongoose.model<IUser>("User", UserSchema);
// Здесь IUser передаётся как дженерик в mongoose.model<IUser>.
// Это нужно, чтобы связать твой интерфейс (TypeScript) с тем, что хранится в MongoDB.
// "типизированный контракт" между MongoDB и твоим TypeScript-кодом
