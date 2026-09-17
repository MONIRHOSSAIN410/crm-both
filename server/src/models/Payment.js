import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    dealId: { type: String, required: true },
    date: { type: Date, default: Date.now },
    investor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    investorName: { type: String, default: '' },
    entrepreneur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    entrepreneurName: { type: String, default: '' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    projectName: { type: String, default: '' },
    amount: { type: Number, required: true, default: 0 },
    commission: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['In Escrow', 'Released', 'Refunded', 'Pending', 'Failed'],
      default: 'In Escrow',
    },
    method: { type: String, default: 'BRAC Bank' },
    reference: { type: String, default: '' },
    note: { type: String, default: '' },
  },
  { timestamps: true }
);

paymentSchema.index({ status: 1, date: -1 });

export default mongoose.model('Payment', paymentSchema);
