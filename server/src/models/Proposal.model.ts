import { Schema, model } from 'mongoose';

const ProposalSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
  title: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired'], 
    default: 'draft' 
  },
  content: { type: String, default: '' }, // Tiptap JSON stringified
  total: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  validUntil: { type: Date },
  sentAt: { type: Date },
  viewedAt: { type: Date },
  viewCount: { type: Number, default: 0 },
  acceptedAt: { type: Date },
  signature: { type: String, default: '' } // Base64 signature
}, {
  timestamps: true
});

export const Proposal = model('Proposal', ProposalSchema);
export default Proposal;
