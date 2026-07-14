"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkImportSchema = exports.bulkAssignSchema = void 0;
const zod_1 = require("zod");
exports.bulkAssignSchema = zod_1.z.object({
    leadIds: zod_1.z
        .array(zod_1.z.string(), {
        errorMap: () => ({ message: 'leadIds must be an array of strings' }),
    })
        .min(1, 'At least one lead ID is required')
        .max(1000, 'Cannot assign more than 1000 leads at once'),
    targetCounselorId: zod_1.z.string().min(1, 'Target counselor ID is required'),
});
exports.bulkImportSchema = zod_1.z.object({
    file: zod_1.z.any(),
});
//# sourceMappingURL=bulk.schema.js.map