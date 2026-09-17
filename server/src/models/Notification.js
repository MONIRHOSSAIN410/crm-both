import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    type: {
      type: String,
      enum: ['action', 'lead', 'milestone', 'payment', 'task', 'payout', 'system'],
      default: 'system',
    },
    read: { type: Boolean, default: false },
    link: { type: String, default: '' },
  },
  { timestamps: true }
);

notificationSchema.index({ read: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
