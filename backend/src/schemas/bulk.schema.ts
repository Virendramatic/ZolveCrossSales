import { z } from 'zod';

export const bulkAssignSchema = z.object({
  leadIds: z
    .array(z.string(), {
      errorMap: () => ({ message: 'leadIds must be an array of strings' }),
    })
    .min(1, 'At least one lead ID is required')
    .max(1000, 'Cannot assign more than 1000 leads at once'),
  targetCounselorId: z.string().min(1, 'Target counselor ID is required'),
});

export type BulkAssignInput = z.infer<typeof bulkAssignSchema>;

export const bulkImportSchema = z.object({
  file: z.any(),
});

export type BulkImportInput = z.infer<typeof bulkImportSchema>;
