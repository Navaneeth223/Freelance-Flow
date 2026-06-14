"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
const mongoose_1 = require("mongoose");
const MilestoneSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    dueDate: { type: Date },
    amount: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'in_progress', 'completed', 'invoiced'], default: 'pending' },
    completedAt: { type: Date }
});
const ProjectSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    clientId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Client', required: true },
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
exports.Project = (0, mongoose_1.model)('Project', ProjectSchema);
exports.default = exports.Project;
