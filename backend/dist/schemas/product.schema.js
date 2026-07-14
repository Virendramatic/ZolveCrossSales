"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productTypeSchema = exports.listProductsSchema = exports.updateProductStatusSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
exports.createProductSchema = zod_1.z.object({
    productType: zod_1.z.enum(['EDUCATION_LOAN', 'REMITTANCE', 'ACCOMMODATION', 'CREDIT_CARD'], {
        errorMap: () => ({ message: 'Invalid product type' }),
    }),
    ownerUserId: zod_1.z.string().optional(),
});
exports.updateProductStatusSchema = zod_1.z.object({
    status: zod_1.z.string().min(1, 'Status is required').max(100, 'Status must be less than 100 characters'),
});
exports.listProductsSchema = zod_1.z.object({
    limit: zod_1.z
        .string()
        .optional()
        .transform(val => (val ? parseInt(val, 10) : 50))
        .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
    cursor: zod_1.z.string().optional(),
});
exports.productTypeSchema = zod_1.z.enum(['EDUCATION_LOAN', 'REMITTANCE', 'ACCOMMODATION', 'CREDIT_CARD']);
//# sourceMappingURL=product.schema.js.map