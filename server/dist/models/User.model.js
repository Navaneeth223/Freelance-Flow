"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    avatar: { type: String, default: '' },
    googleId: { type: String },
    // Business Profile
    businessName: { type: String, default: '' },
    businessLogo: { type: String, default: '' },
    tagline: { type: String, default: '' },
    phone: { type: String, default: '' },
    website: { type: String, default: '' },
    address: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        country: { type: String, default: '' },
        zip: { type: String, default: '' }
    },
    // Preferences
    currency: { type: String, default: 'INR' },
    currencySymbol: { type: String, default: '₹' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    defaultTaxRate: { type: Number, default: 18 }, // e.g. 18% GST
    invoicePrefix: { type: String, default: 'INV' },
    nextInvoiceNumber: { type: Number, default: 1 },
    // Subscription
    plan: { type: String, enum: ['free', 'pro', 'business'], default: 'free' },
    planExpiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } // 30 days
}, {
    timestamps: true
});
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    try {
        const salt = await bcryptjs_1.default.genSalt(12);
        if (this.password) {
            this.password = await bcryptjs_1.default.hash(this.password, salt);
        }
        next();
    }
    catch (err) {
        next(err);
    }
});
UserSchema.methods.comparePassword = async function (enteredPassword) {
    if (!this.password)
        return false;
    return bcryptjs_1.default.compare(enteredPassword, this.password);
};
exports.User = (0, mongoose_1.model)('User', UserSchema);
exports.default = exports.User;
