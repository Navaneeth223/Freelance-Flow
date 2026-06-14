import { Schema, model } from 'mongoose';

const MilestoneSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  dueDate: { type: Date },
  amount: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'invoiced'], default: 'pending' },
  completedAt: { type: Date }
});

const ProjectSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  coverColor: { type: String, default: '#6C63FF' }, // electric indigo default
  status: { type: String, enum: ['draft', 'active', 'on_hold', 'completed', 'cancelled'], default: 'draft' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  type: { type: String, enum: ['fixed', 'hourly', 'retainer'], required: true },
  budget: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  hourlyRate: { type: Number, default: 0 },
  retainerAmount: { type: Number, default: 0 },
  startDate: { type: Date },
  endDate: { type: Date },
  estimatedHours: { type: Number, default: 0 },
  milestones: [MilestoneSchema],
  tags: [{ type: String }],
  techStack: [{ type: String }]
}, {
  timestamps: true
});

export const Project = model('Project', ProjectSchema);
export default Project;
