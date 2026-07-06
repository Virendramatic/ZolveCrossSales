import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(5000, 'Comment must be less than 5000 characters'),
  isInternal: z.boolean().optional().default(false),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(5000, 'Comment must be less than 5000 characters'),
});

export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;

export const listCommentsSchema = z.object({
  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 20))
    .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
  cursor: z.string().optional(),
});

export type ListCommentsInput = z.infer<typeof listCommentsSchema>;

export const searchCommentsSchema = z.object({
  q: z.string().min(1, 'Search query is required').max(200, 'Query must be less than 200 characters'),
  authorId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 50))
    .refine(val => val > 0 && val <= 200, 'Limit must be between 1 and 200'),
});

export type SearchCommentsInput = z.infer<typeof searchCommentsSchema>;
