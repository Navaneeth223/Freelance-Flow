import { Schema, model } from 'mongoose';

const TimeEntrySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  description: { type: String, default: '' },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number, default: 0 }, // in seconds
  hourlyRate: { type: Number, default: 0 },
  amount: { type: Number, default: 0 }, // duration (hrs) * hourlyRate
  isBillable: { type: Boolean, default: true },
  isInvoiced: { type: Boolean, default: false },
  invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
  tags: [{ type: String }],
  date: { type: Date, required: true } // Date-only representation
}, {
  timestamps: true
});

export const TimeEntry = model('TimeEntry', TimeEntrySchema);
export default TimeEntry;
