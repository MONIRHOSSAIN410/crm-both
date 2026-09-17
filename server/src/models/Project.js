import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Technology', 'Agriculture', 'E-Commerce', 'Healthcare', 'Education', 'Other'],
      default: 'Other',
    },
    description: { type: String, default: '' },
    budget: { type: Number, required: true, default: 0 },
    raised: { type: Number, default: 0 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ownerName: { type: String, default: '' },
    investors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    totalInvestors: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'live', 'closed'],
      default: 'pending',
    },
    deadline: { type: Date },
    location: { type: String, default: 'Dhaka, Bangladesh' },
  },
  { timestamps: true }
);

projectSchema.virtual('progress').get(function progress() {
  if (!this.budget) return 0;
  return Math.min(100, Math.round((this.raised / this.budget) * 100));
});

projectSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Project', projectSchema);
