import { Schema, model } from 'mongoose';

const ExpenseSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  category: { 
    type: String, 
    enum: ['software', 'hardware', 'travel', 'marketing', 'hosting', 'office', 'other'], 
    required: true,
    default: 'other'
  },
  date: { type: Date, required: true, default: Date.now },
  isBillable: { type: Boolean, default: false },
  isReimbursed: { type: Boolean, default: false },
  receiptUrl: { type: String, default: '' }
}, {
  timestamps: true
});

export const Expense = model('Expense', ExpenseSchema);
export default Expense;
