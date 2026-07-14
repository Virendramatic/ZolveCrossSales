import { z } from 'zod';
export declare const createCommentSchema: z.ZodObject<{
    content: z.ZodString;
    isInternal: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    content: string;
    isInternal: boolean;
}, {
    content: string;
    isInternal?: boolean | undefined;
}>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export declare const updateCommentSchema: z.ZodObject<{
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
}, {
    content: string;
}>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export declare const listCommentsSchema: z.ZodObject<{
    limit: z.ZodEffects<z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>, number, string | undefined>;
    cursor: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    cursor?: string | undefined;
}, {
    limit?: string | undefined;
    cursor?: string | undefined;
}>;
export type ListCommentsInput = z.infer<typeof listCommentsSchema>;
export declare const searchCommentsSchema: z.ZodObject<{
    q: z.ZodString;
    authorId: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    limit: z.ZodEffects<z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>, number, string | undefined>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    q: string;
    authorId?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    q: string;
    limit?: string | undefined;
    authorId?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
}>;
export type SearchCommentsInput = z.infer<typeof searchCommentsSchema>;
//# sourceMappingURL=comment.schema.d.ts.map