"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const mongoose_1 = require("mongoose");
const ClientSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    company: { type: String, default: '' },
    logo: { type: String, default: '' },
    website: { type: String, default: '' },
    address: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        country: { type: String, default: '' },
        zip: { type: String, default: '' }
    },
    gstNumber: { type: String, default: '' },
    panNumber: { type: String, default: '' },
    defaultCurrency: { type: String, default: 'INR' },
    defaultPaymentTerms: { type: Number, default: 30 }, // default Net 30 days
    notes: { type: String, default: '' },
    tags: [{ type: String }],
    status: { type: String, enum: ['active', 'inactive', 'lead'], default: 'lead' }
}, {
    timestamps: true
});
exports.Client = (0, mongoose_1.model)('Client', ClientSchema);
exports.default = exports.Client;
