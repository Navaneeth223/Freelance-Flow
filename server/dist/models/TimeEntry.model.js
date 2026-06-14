"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeEntry = void 0;
const mongoose_1 = require("mongoose");
const TimeEntrySchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Project', required: true },
    clientId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Client', required: true },
    description: { type: String, default: '' },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    duration: { type: Number, default: 0 }, // in seconds
    hourlyRate: { type: Number, default: 0 },
    amount: { type: Number, default: 0 }, // duration (hrs) * hourlyRate
    isBillable: { type: Boolean, default: true },
    isInvoiced: { type: Boolean, default: false },
    invoiceId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Invoice' },
    tags: [{ type: String }],
    date: { type: Date, required: true } // Date-only representation
}, {
    timestamps: true
});
exports.TimeEntry = (0, mongoose_1.model)('TimeEntry', TimeEntrySchema);
exports.default = exports.TimeEntry;
