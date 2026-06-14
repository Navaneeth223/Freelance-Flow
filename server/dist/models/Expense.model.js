"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Expense = void 0;
const mongoose_1 = require("mongoose");
const ExpenseSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Project' },
    clientId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Client' },
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
exports.Expense = (0, mongoose_1.model)('Expense', ExpenseSchema);
exports.default = exports.Expense;
