"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentRequestStatus = exports.DocumentStatus = exports.DocumentCategory = exports.DocumentRequestStatusSchema = exports.DocumentRejectionSchema = exports.DocumentApprovalSchema = exports.DocumentUploadSchema = void 0;
const zod_1 = require("zod");
// Document Upload Schema
exports.DocumentUploadSchema = zod_1.z.object({
    documentRequestId: zod_1.z
        .string()
        .min(1, 'Document request ID is required')
        .describe('ID of the document request'),
    documentId: zod_1.z
        .string()
        .min(1, 'Document ID is required')
        .describe('ID of the specific document in the checklist'),
    fileUrl: zod_1.z
        .string()
        .url('Invalid file URL format')
        .describe('URL of the uploaded file (from S3 or storage)'),
    fileName: zod_1.z
        .string()
        .min(1, 'File name is required')
        .max(255, 'File name must be less than 255 characters')
        .describe('Original name of the file'),
    fileSize: zod_1.z
        .number()
        .positive('File size must be positive')
        .max(10 * 1024 * 1024, 'File size must not exceed 10MB')
        .describe('Size of the file in bytes'),
    mimeType: zod_1.z
        .string()
        .regex(/^[a-zA-Z0-9\-+/.]+$/, 'Invalid MIME type format')
        .describe('MIME type of the file (e.g., application/pdf)'),
});
// Document Approval Schema
exports.DocumentApprovalSchema = zod_1.z.object({
    documentRequestId: zod_1.z
        .string()
        .min(1, 'Document request ID is required')
        .describe('ID of the document request'),
    reason: zod_1.z
        .string()
        .optional()
        .describe('Optional approval reason or notes'),
});
// Document Rejection Schema
exports.DocumentRejectionSchema = zod_1.z.object({
    documentRequestId: zod_1.z
        .string()
        .min(1, 'Document request ID is required')
        .describe('ID of the document request'),
    reason: zod_1.z
        .string()
        .min(1, 'Rejection reason is required')
        .max(500, 'Rejection reason must be less than 500 characters')
        .describe('Reason for rejection'),
});
// Document Request Status Schema
exports.DocumentRequestStatusSchema = zod_1.z.object({
    loanId: zod_1.z
        .string()
        .min(1, 'Loan ID is required')
        .describe('ID of the education loan'),
    documentRequestId: zod_1.z
        .string()
        .min(1, 'Document request ID is required')
        .describe('ID of the document request'),
});
// Document Categories
exports.DocumentCategory = zod_1.z.enum([
    'KYC',
    'ACADEMICS',
    'FINANCIALS',
    'COLLATERAL',
]);
// Document Status
exports.DocumentStatus = zod_1.z.enum([
    'NOT_STARTED',
    'SUBMITTED',
    'APPROVED',
    'REJECTED',
]);
// Document Request Status
exports.DocumentRequestStatus = zod_1.z.enum([
    'PENDING',
    'RECEIVED',
    'COMPLETED',
]);
//# sourceMappingURL=document.schema.js.map