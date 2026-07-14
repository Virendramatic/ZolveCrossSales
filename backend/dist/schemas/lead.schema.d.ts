import { z } from 'zod';
export declare const createLeadSchema: z.ZodObject<{
    name: z.ZodString;
    phone: z.ZodString;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    country: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    intake: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    leadSource: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    notes: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, "strip", z.ZodTypeAny, {
    name: string;
    phone: string;
    email?: string | undefined;
    country?: string | undefined;
    intake?: string | undefined;
    leadSource?: string | undefined;
    notes?: string | undefined;
}, {
    name: string;
    phone: string;
    email?: string | undefined;
    country?: string | undefined;
    intake?: string | undefined;
    leadSource?: string | undefined;
    notes?: string | undefined;
}>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export declare const listLeadsSchema: z.ZodObject<{
    callStatus: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    intake: z.ZodOptional<z.ZodString>;
    limit: z.ZodEffects<z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>, number, string | undefined>;
    cursor: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<["name", "created", "status"]>>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    sortBy: "status" | "name" | "created";
    status?: string | undefined;
    country?: string | undefined;
    intake?: string | undefined;
    callStatus?: string | undefined;
    cursor?: string | undefined;
}, {
    status?: string | undefined;
    country?: string | undefined;
    intake?: string | undefined;
    callStatus?: string | undefined;
    limit?: string | undefined;
    cursor?: string | undefined;
    sortBy?: "status" | "name" | "created" | undefined;
}>;
export type ListLeadsInput = z.infer<typeof listLeadsSchema>;
export declare const updateLeadSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    country: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    intake: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    notes: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, "strict", z.ZodTypeAny, {
    email?: string | undefined;
    name?: string | undefined;
    phone?: string | undefined;
    country?: string | undefined;
    intake?: string | undefined;
    notes?: string | undefined;
}, {
    email?: string | undefined;
    name?: string | undefined;
    phone?: string | undefined;
    country?: string | undefined;
    intake?: string | undefined;
    notes?: string | undefined;
}>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export declare const callStatusSchema: z.ZodObject<{
    globalCallStatus: z.ZodEnum<["NOT_CALLED", "RESPONDING", "NOT_RESPONDING", "CONVERTED"]>;
}, "strip", z.ZodTypeAny, {
    globalCallStatus: "NOT_CALLED" | "RESPONDING" | "NOT_RESPONDING" | "CONVERTED";
}, {
    globalCallStatus: "NOT_CALLED" | "RESPONDING" | "NOT_RESPONDING" | "CONVERTED";
}>;
export type CallStatusInput = z.infer<typeof callStatusSchema>;
export declare const rescheduleSchema: z.ZodObject<{
    rescheduleDate: z.ZodEffects<z.ZodString, Date, string>;
}, "strip", z.ZodTypeAny, {
    rescheduleDate: Date;
}, {
    rescheduleDate: string;
}>;
export type RescheduleInput = z.infer<typeof rescheduleSchema>;
//# sourceMappingURL=lead.schema.d.ts.map