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

    /**
     * KYC documents uploaded from Settings → Verification.
     *
     * The file is stored as a data URL on the document, for the same reason
     * the avatar is: Vercel's filesystem is read-only and wiped between
     * invocations, so anything written to an /uploads folder disappears. The
     * client shrinks images before sending, and `fileSize` is the size of the
     * original file so the UI can show it back to the user.
     */
    verificationDocs: [
      {
        key: { type: String, required: true }, // 'nid-front' | 'nid-back' | 'trade-licence'
        label: { type: String, default: '' },
        fileName: { type: String, default: '' },
        fileType: { type: String, default: '' },
        fileSize: { type: Number, default: 0 },
        dataUrl: { type: String, default: '' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    verificationStatus: {
      type: String,
      enum: ['unverified', 'submitted', 'approved', 'rejected'],
      default: 'unverified',
    },
    verificationNote: { type: String, default: '' },
    verificationSubmittedAt: { type: Date },
    verificationReviewedAt: { type: Date },

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
