import { z } from 'zod';
export declare const createProductSchema: z.ZodObject<{
    productType: z.ZodEnum<["EDUCATION_LOAN", "REMITTANCE", "ACCOMMODATION", "CREDIT_CARD"]>;
    ownerUserId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    productType: "EDUCATION_LOAN" | "REMITTANCE" | "ACCOMMODATION" | "CREDIT_CARD";
    ownerUserId?: string | undefined;
}, {
    productType: "EDUCATION_LOAN" | "REMITTANCE" | "ACCOMMODATION" | "CREDIT_CARD";
    ownerUserId?: string | undefined;
}>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export declare const updateProductStatusSchema: z.ZodObject<{
    status: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: string;
}, {
    status: string;
}>;
export type UpdateProductStatusInput = z.infer<typeof updateProductStatusSchema>;
export declare const listProductsSchema: z.ZodObject<{
    limit: z.ZodEffects<z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>, number, string | undefined>;
    cursor: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    cursor?: string | undefined;
}, {
    limit?: string | undefined;
    cursor?: string | undefined;
}>;
export type ListProductsInput = z.infer<typeof listProductsSchema>;
export declare const productTypeSchema: z.ZodEnum<["EDUCATION_LOAN", "REMITTANCE", "ACCOMMODATION", "CREDIT_CARD"]>;
export type ProductType = z.infer<typeof productTypeSchema>;
//# sourceMappingURL=product.schema.d.ts.map