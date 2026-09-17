import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, default: '' },
    userEmail: { type: String, default: '' },
    userAvatar: { type: String, default: '' },
    activity: { type: String, required: true },
    module: {
      type: String,
      enum: ['Projects', 'Payments', 'Accounts', 'Messages', 'System', 'Reports'],
      default: 'System',
    },
    projectId: { type: String, default: '' },
    status: { type: String, enum: ['Success', 'Failed', 'Pending'], default: 'Success' },
    isAdminAction: { type: Boolean, default: false },
    description: { type: String, default: '' },
    changes: {
      paymentStatus: { from: String, to: String },
      investmentTarget: { from: Number, to: Number },
      deadline: { from: String, to: String },
    },
    comments: [
      {
        author: String,
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

activitySchema.index({ createdAt: -1 });

export default mongoose.model('Activity', activitySchema);
