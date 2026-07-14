import { z } from 'zod';
export declare const bulkAssignSchema: z.ZodObject<{
    leadIds: z.ZodArray<z.ZodString, "many">;
    targetCounselorId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    leadIds: string[];
    targetCounselorId: string;
}, {
    leadIds: string[];
    targetCounselorId: string;
}>;
export type BulkAssignInput = z.infer<typeof bulkAssignSchema>;
export declare const bulkImportSchema: z.ZodObject<{
    file: z.ZodAny;
}, "strip", z.ZodTypeAny, {
    file?: any;
}, {
    file?: any;
}>;
export type BulkImportInput = z.infer<typeof bulkImportSchema>;
//# sourceMappingURL=bulk.schema.d.ts.map