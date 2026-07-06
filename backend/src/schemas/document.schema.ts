import { z } from 'zod';

// Document Upload Schema
export const DocumentUploadSchema = z.object({
  documentRequestId: z
    .string()
    .min(1, 'Document request ID is required')
    .describe('ID of the document request'),
  documentId: z
    .string()
    .min(1, 'Document ID is required')
    .describe('ID of the specific document in the checklist'),
  fileUrl: z
    .string()
    .url('Invalid file URL format')
    .describe('URL of the uploaded file (from S3 or storage)'),
  fileName: z
    .string()
    .min(1, 'File name is required')
    .max(255, 'File name must be less than 255 characters')
    .describe('Original name of the file'),
  fileSize: z
    .number()
    .positive('File size must be positive')
    .max(10 * 1024 * 1024, 'File size must not exceed 10MB')
    .describe('Size of the file in bytes'),
  mimeType: z
    .string()
    .regex(/^[a-zA-Z0-9\-+/.]+$/, 'Invalid MIME type format')
    .describe('MIME type of the file (e.g., application/pdf)'),
});

export type DocumentUploadInput = z.infer<typeof DocumentUploadSchema>;

// Document Approval Schema
export const DocumentApprovalSchema = z.object({
  documentRequestId: z
    .string()
    .min(1, 'Document request ID is required')
    .describe('ID of the document request'),
  reason: z
    .string()
    .optional()
    .describe('Optional approval reason or notes'),
});

export type DocumentApprovalInput = z.infer<typeof DocumentApprovalSchema>;

// Document Rejection Schema
export const DocumentRejectionSchema = z.object({
  documentRequestId: z
    .string()
    .min(1, 'Document request ID is required')
    .describe('ID of the document request'),
  reason: z
    .string()
    .min(1, 'Rejection reason is required')
    .max(500, 'Rejection reason must be less than 500 characters')
    .describe('Reason for rejection'),
});

export type DocumentRejectionInput = z.infer<typeof DocumentRejectionSchema>;

// Document Request Status Schema
export const DocumentRequestStatusSchema = z.object({
  loanId: z
    .string()
    .min(1, 'Loan ID is required')
    .describe('ID of the education loan'),
  documentRequestId: z
    .string()
    .min(1, 'Document request ID is required')
    .describe('ID of the document request'),
});

export type DocumentRequestStatusInput = z.infer<typeof DocumentRequestStatusSchema>;

// Document Categories
export const DocumentCategory = z.enum([
  'KYC',
  'ACADEMICS',
  'FINANCIALS',
  'COLLATERAL',
]);

export type DocumentCategoryType = z.infer<typeof DocumentCategory>;

// Document Status
export const DocumentStatus = z.enum([
  'NOT_STARTED',
  'SUBMITTED',
  'APPROVED',
  'REJECTED',
]);

export type DocumentStatusType = z.infer<typeof DocumentStatus>;

// Document Request Status
export const DocumentRequestStatus = z.enum([
  'PENDING',
  'RECEIVED',
  'COMPLETED',
]);

export type DocumentRequestStatusType = z.infer<typeof DocumentRequestStatus>;
