"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchCommentsSchema = exports.listCommentsSchema = exports.updateCommentSchema = exports.createCommentSchema = void 0;
const zod_1 = require("zod");
exports.createCommentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Comment content is required').max(5000, 'Comment must be less than 5000 characters'),
    isInternal: zod_1.z.boolean().optional().default(false),
});
exports.updateCommentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Comment content is required').max(5000, 'Comment must be less than 5000 characters'),
});
exports.listCommentsSchema = zod_1.z.object({
    limit: zod_1.z
        .string()
        .optional()
        .transform(val => (val ? parseInt(val, 10) : 20))
        .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
    cursor: zod_1.z.string().optional(),
});
exports.searchCommentsSchema = zod_1.z.object({
    q: zod_1.z.string().min(1, 'Search query is required').max(200, 'Query must be less than 200 characters'),
    authorId: zod_1.z.string().optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    limit: zod_1.z
        .string()
        .optional()
        .transform(val => (val ? parseInt(val, 10) : 50))
        .refine(val => val > 0 && val <= 200, 'Limit must be between 1 and 200'),
});
//# sourceMappingURL=comment.schema.js.map