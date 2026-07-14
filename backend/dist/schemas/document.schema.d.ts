import { z } from 'zod';
export declare const DocumentUploadSchema: z.ZodObject<{
    documentRequestId: z.ZodString;
    documentId: z.ZodString;
    fileUrl: z.ZodString;
    fileName: z.ZodString;
    fileSize: z.ZodNumber;
    mimeType: z.ZodString;
}, "strip", z.ZodTypeAny, {
    documentRequestId: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    documentId: string;
}, {
    documentRequestId: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    documentId: string;
}>;
export type DocumentUploadInput = z.infer<typeof DocumentUploadSchema>;
export declare const DocumentApprovalSchema: z.ZodObject<{
    documentRequestId: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    documentRequestId: string;
    reason?: string | undefined;
}, {
    documentRequestId: string;
    reason?: string | undefined;
}>;
export type DocumentApprovalInput = z.infer<typeof DocumentApprovalSchema>;
export declare const DocumentRejectionSchema: z.ZodObject<{
    documentRequestId: z.ZodString;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason: string;
    documentRequestId: string;
}, {
    reason: string;
    documentRequestId: string;
}>;
export type DocumentRejectionInput = z.infer<typeof DocumentRejectionSchema>;
export declare const DocumentRequestStatusSchema: z.ZodObject<{
    loanId: z.ZodString;
    documentRequestId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    documentRequestId: string;
    loanId: string;
}, {
    documentRequestId: string;
    loanId: string;
}>;
export type DocumentRequestStatusInput = z.infer<typeof DocumentRequestStatusSchema>;
export declare const DocumentCategory: z.ZodEnum<["KYC", "ACADEMICS", "FINANCIALS", "COLLATERAL"]>;
export type DocumentCategoryType = z.infer<typeof DocumentCategory>;
export declare const DocumentStatus: z.ZodEnum<["NOT_STARTED", "SUBMITTED", "APPROVED", "REJECTED"]>;
export type DocumentStatusType = z.infer<typeof DocumentStatus>;
export declare const DocumentRequestStatus: z.ZodEnum<["PENDING", "RECEIVED", "COMPLETED"]>;
export type DocumentRequestStatusType = z.infer<typeof DocumentRequestStatus>;
//# sourceMappingURL=document.schema.d.ts.map