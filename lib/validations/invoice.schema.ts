import { z } from 'zod';

export const lineItemSchema = z.object({
  description: z.string().min(1, 'Item description is required'),
  quantity: z.number().positive('Quantity must be greater than zero').default(1),
  unitPrice: z.number().nonnegative('Unit price must be non-negative'),
  taxRate: z.number().nonnegative('Tax rate must be non-negative').default(0)
});

export const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  projectId: z.string().optional(),
  invoiceNumber: z.string().optional(),
  status: z.enum(['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled', 'partially_paid']).default('draft'),
  issueDate: z.string().or(z.date()).default(() => new Date()),
  dueDate: z.string().or(z.date()),
  lineItems: z.array(lineItemSchema).min(1, 'Invoice must contain at least one line item'),
  discountType: z.enum(['percent', 'fixed']).default('percent'),
  discountValue: z.number().nonnegative().default(0),
  currency: z.string().default('INR'),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional()
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;
