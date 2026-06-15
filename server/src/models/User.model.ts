import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatar: string;
  googleId?: string;
  businessName: string;
  businessLogo: string;
  tagline: string;
  phone: string;
  website: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zip: string;
  };
  currency: string;
  currencySymbol: string;
  timezone: string;
  defaultTaxRate: number;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  plan: 'free' | 'pro' | 'business';
  planExpiresAt: Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
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
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    if (this.password) {
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (err: any) {
    next(err);
  }
});

UserSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

export const User = model<IUser>('User', UserSchema);
export default User;

