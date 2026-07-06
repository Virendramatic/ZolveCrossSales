import { z } from 'zod';

export const createProductSchema = z.object({
  productType: z.enum(['EDUCATION_LOAN', 'REMITTANCE', 'ACCOMMODATION', 'CREDIT_CARD'], {
    errorMap: () => ({ message: 'Invalid product type' }),
  }),
  ownerUserId: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductStatusSchema = z.object({
  status: z.string().min(1, 'Status is required').max(100, 'Status must be less than 100 characters'),
});

export type UpdateProductStatusInput = z.infer<typeof updateProductStatusSchema>;

export const listProductsSchema = z.object({
  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 50))
    .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
  cursor: z.string().optional(),
});

export type ListProductsInput = z.infer<typeof listProductsSchema>;

export const productTypeSchema = z.enum(['EDUCATION_LOAN', 'REMITTANCE', 'ACCOMMODATION', 'CREDIT_CARD']);

export type ProductType = z.infer<typeof productTypeSchema>;
