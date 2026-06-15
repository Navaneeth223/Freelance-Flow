import { Schema, model } from 'mongoose';

const LineItemSchema = new Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number, required: true, default: 0 },
  taxRate: { type: Number, default: 0 }, // e.g. 18 for 18% GST
  amount: { type: Number, required: true } // calculated: quantity * unitPrice
});

const InvoiceSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
  invoiceNumber: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled', 'partially_paid'], 
    default: 'draft' 
  },
  issueDate: { type: Date, required: true, default: Date.now },
  dueDate: { type: Date, required: true },
  paidDate: { type: Date },

  lineItems: [LineItemSchema],
  subtotal: { type: Number, required: true, default: 0 },
  discountType: { type: String, enum: ['percent', 'fixed'], default: 'percent' },
  discountValue: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  total: { type: Number, required: true, default: 0 },
  amountPaid: { type: Number, default: 0 },
  amountDue: { type: Number, required: true, default: 0 },

  currency: { type: String, default: 'INR' },
  currencySymbol: { type: String, default: '₹' },
  notes: { type: String, default: '' },

  termsAndConditions: { type: String, default: '' },

  // Tracking details
  sentAt: { type: Date },
  viewedAt: { type: Date },
  reminderSentAt: { type: Date },
  viewCount: { type: Number, default: 0 },

  // Payment details
  paymentMethod: { type: String, default: '' },
  paymentReference: { type: String, default: '' }
}, {
  timestamps: true
});

export const Invoice = model('Invoice', InvoiceSchema);
export default Invoice;
