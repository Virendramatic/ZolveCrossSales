"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rescheduleSchema = exports.callStatusSchema = exports.updateLeadSchema = exports.listLeadsSchema = exports.createLeadSchema = void 0;
const zod_1 = require("zod");
exports.createLeadSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
    phone: zod_1.z.string().min(1, 'Phone is required').max(20, 'Phone must be less than 20 characters'),
    email: zod_1.z.string().email('Invalid email address').optional().or(zod_1.z.literal('')),
    country: zod_1.z.string().optional().or(zod_1.z.literal('')),
    intake: zod_1.z.string().optional().or(zod_1.z.literal('')),
    leadSource: zod_1.z.string().optional().or(zod_1.z.literal('')),
    notes: zod_1.z.string().optional().or(zod_1.z.literal('')),
});
exports.listLeadsSchema = zod_1.z.object({
    callStatus: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    intake: zod_1.z.string().optional(),
    limit: zod_1.z
        .string()
        .optional()
        .transform(val => (val ? parseInt(val, 10) : 50))
        .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
    cursor: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['name', 'created', 'status']).optional().default('created'),
});
exports.updateLeadSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters').optional(),
    phone: zod_1.z.string().min(1, 'Phone is required').max(20, 'Phone must be less than 20 characters').optional(),
    email: zod_1.z.string().email('Invalid email address').optional().or(zod_1.z.literal('')),
    country: zod_1.z.string().optional().or(zod_1.z.literal('')),
    intake: zod_1.z.string().optional().or(zod_1.z.literal('')),
    notes: zod_1.z.string().optional().or(zod_1.z.literal('')),
}).strict();
exports.callStatusSchema = zod_1.z.object({
    globalCallStatus: zod_1.z.enum(['NOT_CALLED', 'RESPONDING', 'NOT_RESPONDING', 'CONVERTED'], {
        errorMap: () => ({ message: 'Invalid call status' }),
    }),
});
exports.rescheduleSchema = zod_1.z.object({
    rescheduleDate: zod_1.z.string().datetime().transform(val => new Date(val)),
});
//# sourceMappingURL=lead.schema.js.map