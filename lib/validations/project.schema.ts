import { z } from 'zod';

export const projectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  clientId: z.string().min(1, 'Client is required'),
  description: z.string().optional(),
  coverColor: z.string().default('#6C63FF'),
  status: z.enum(['draft', 'active', 'on_hold', 'completed', 'cancelled']).default('draft'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  type: z.enum(['fixed', 'hourly', 'retainer']),
  budget: z.number().nonnegative().default(0),
  currency: z.string().default('INR'),
  hourlyRate: z.number().nonnegative().default(0),
  retainerAmount: z.number().nonnegative().default(0),
  startDate: z.string().optional().or(z.date()),
  endDate: z.string().optional().or(z.date()),
  estimatedHours: z.number().nonnegative().default(0),
  tags: z.array(z.string()).default([]),
  techStack: z.array(z.string()).default([])
});

export type ProjectInput = z.infer<typeof projectSchema>;
