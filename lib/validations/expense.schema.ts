import { z } from 'zod';

export const expenseSchema = z.object({
  title: z.string().min(2, 'Expense title must be at least 2 characters'),
  description: z.string().optional(),
  amount: z.number().positive('Expense amount must be greater than zero'),
  currency: z.string().default('INR'),
  category: z.enum(['software', 'hardware', 'travel', 'marketing', 'hosting', 'office', 'other']).default('other'),
  date: z.string().or(z.date()).default(() => new Date()),
  projectId: z.string().optional(),
  clientId: z.string().optional(),
  isBillable: z.boolean().default(false),
  isReimbursed: z.boolean().default(false),
  receiptUrl: z.string().optional()
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
