import { z } from 'zod';

export const clientSchema = z.object({
  name: z.string().min(2, 'Contact name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().min(2, 'Company name must be at least 2 characters'),
  logo: z.string().optional(),
  website: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    zip: z.string().optional()
  }).optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  defaultCurrency: z.string().default('INR'),
  defaultPaymentTerms: z.number().int().nonnegative().default(30),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(['active', 'inactive', 'lead']).default('lead')
});

export type ClientInput = z.infer<typeof clientSchema>;
