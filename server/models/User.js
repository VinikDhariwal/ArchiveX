import mongoose from 'mongoose';
import { USER_ROLES, USER_STATUSES } from '../config/constants.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    firstName: { type: String, trim: true, maxlength: 60, default: '' },
    lastName: { type: String, trim: true, maxlength: 60, default: '' },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: [
        /^[A-Za-z0-9._\-!@#$]+$/,
        'Username may use letters, numbers, and . _ - ! @ # $',
      ],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    /** bcrypt digest only — never plaintext, never reversible ciphertext. */
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, default: 'user', index: true },
    status: { type: String, enum: USER_STATUSES, default: 'active', index: true },
    tokenVersion: { type: Number, default: 0 },
    preferences: {
      newsletter: { type: Boolean, default: false },
      locale: { type: String, default: 'en', maxlength: 16 },
    },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

userSchema.set('toObject', {
  transform(_doc, ret) {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
