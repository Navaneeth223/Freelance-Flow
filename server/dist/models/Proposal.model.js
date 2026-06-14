"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Proposal = void 0;
const mongoose_1 = require("mongoose");
const ProposalSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    clientId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Client', required: true },
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Project' },
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
exports.Proposal = (0, mongoose_1.model)('Proposal', ProposalSchema);
exports.default = exports.Proposal;
