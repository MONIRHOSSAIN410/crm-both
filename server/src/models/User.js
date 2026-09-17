import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: [true, 'Full name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    phone: { type: String, default: '' },
    organization: { type: String, default: '' },
    location: { type: String, default: 'Dhaka, Bangladesh' },
    focusArea: { type: String, default: '' },
    bio: { type: String, default: '' },
    avatar: { type: String, default: '' },
    role: {
      type: String,
      enum: ['admin', 'investor', 'entrepreneur'],
      default: 'investor',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'live', 'active'],
      default: 'pending',
    },
    gender: { type: String, enum: ['male', 'female', ''], default: '' },
    nid: { type: String, default: '' },
    tin: { type: String, default: '' },
    taxCountry: { type: String, default: 'Bangladesh' },
    residentialAddress: { type: String, default: '' },
    verified: { type: Boolean, default: false },
    online: { type: Boolean, default: false },
    totalInvested: { type: Number, default: 0 },
    fundedProjects: { type: Number, default: 0 },
    lastPaymentDate: { type: Date },
    notificationPrefs: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

userSchema.methods.matchPassword = function matchPassword(entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.index({ role: 1, status: 1 });

export default mongoose.model('User', userSchema);
