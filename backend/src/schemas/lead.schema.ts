import { z } from 'zod';

export const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  phone: z.string().min(1, 'Phone is required').max(20, 'Phone must be less than 20 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  intake: z.string().optional().or(z.literal('')),
  leadSource: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;

export const listLeadsSchema = z.object({
  callStatus: z.string().optional(),
  status: z.string().optional(),
  country: z.string().optional(),
  intake: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 50))
    .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
  cursor: z.string().optional(),
  sortBy: z.enum(['name', 'created', 'status']).optional().default('created'),
});

export type ListLeadsInput = z.infer<typeof listLeadsSchema>;

export const updateLeadSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters').optional(),
  phone: z.string().min(1, 'Phone is required').max(20, 'Phone must be less than 20 characters').optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  intake: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
}).strict();

export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;

export const callStatusSchema = z.object({
  globalCallStatus: z.enum(['NOT_CALLED', 'RESPONDING', 'NOT_RESPONDING', 'CONVERTED'], {
    errorMap: () => ({ message: 'Invalid call status' }),
  }),
});

export type CallStatusInput = z.infer<typeof callStatusSchema>;

export const rescheduleSchema = z.object({
  rescheduleDate: z.string().datetime().transform(val => new Date(val)),
});

export type RescheduleInput = z.infer<typeof rescheduleSchema>;
