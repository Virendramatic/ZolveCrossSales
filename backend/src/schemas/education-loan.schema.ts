import { z } from 'zod';

// ─── Education Loan Schemas ───────────────────────────────────────────────────

export const createEducationLoanSchema = z.object({
  university: z.string().min(1, 'University is required'),
  course: z.string().min(1, 'Course is required'),
  targetCountry: z.string().optional(),
  totalLoanAmount: z.bigint().positive('Loan amount must be positive'),
  expectedIntake: z.string().optional(),
  collateralType: z.enum(['SECURED', 'NON_COLLATERAL']).default('NON_COLLATERAL'),
  coApplicantName: z.string().optional(),
  coApplicantType: z.enum(['SALARIED', 'SELF_EMPLOYED']).optional(),
});

export type CreateEducationLoanInput = z.infer<typeof createEducationLoanSchema>;

export const updateEducationLoanSchema = z.object({
  university: z.string().min(1).optional(),
  course: z.string().min(1).optional(),
  targetCountry: z.string().optional().nullable(),
  totalLoanAmount: z.bigint().positive().optional(),
  expectedIntake: z.string().optional().nullable(),
  collateralType: z.enum(['SECURED', 'NON_COLLATERAL']).optional(),
  coApplicantName: z.string().optional().nullable(),
  coApplicantType: z.enum(['SALARIED', 'SELF_EMPLOYED']).optional().nullable(),
});

export type UpdateEducationLoanInput = z.infer<typeof updateEducationLoanSchema>;

export const updateLoanStageSchema = z.object({
  newStage: z.enum([
    'STARTED',
    'DOCS_PENDING',
    'DOCS_RECEIVED',
    'CALL_SCHEDULED',
    'SANCTIONED',
    'DISBURSED',
    'LOST',
  ]),
  reason: z.string().optional(),
});

export type UpdateLoanStageInput = z.infer<typeof updateLoanStageSchema>;

// ─── Lender Application Schemas ──────────────────────────────────────────────

export const addLenderSchema = z.object({
  lenderName: z.string().min(1, 'Lender name is required'),
  matchScore: z.number().int().min(0).max(100).optional(),
  recommendationSource: z.enum(['AUTO_RECOMMENDED', 'MANUAL', 'SYSTEM_MATCH']).default('MANUAL'),
});

export type AddLenderInput = z.infer<typeof addLenderSchema>;

export const updateLenderStatusSchema = z.object({
  lenderStatus: z.enum([
    'INTERESTED',
    'APPLIED',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED',
    'DISBURSED',
    'WITHDRAWN',
  ]),
  sanctionAmount: z.bigint().positive().optional(),
  roi: z.number().min(0).max(50).optional(),
  processingFee: z.bigint().positive().optional(),
  sanctionDate: z.coerce.date().optional(),
  sanctionValidity: z.coerce.date().optional(),
  disbursementAmount: z.bigint().positive().optional(),
  disbursementDate: z.coerce.date().optional(),
  tranchCount: z.number().int().positive().optional(),
  rejectionReason: z.string().optional(),
  reason: z.string().optional(),
});

export type UpdateLenderStatusInput = z.infer<typeof updateLenderStatusSchema>;

// ─── Document Request Schemas ────────────────────────────────────────────────

export const requestDocumentsSchema = z.object({
  categories: z.array(z.enum(['KYC', 'ACADEMICS', 'FINANCIALS', 'COLLATERAL'])).min(1),
  deadline: z.coerce.date().optional(),
});

export type RequestDocumentsInput = z.infer<typeof requestDocumentsSchema>;

export const documentApprovalSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  rejectionReason: z.string().optional(),
});

export type DocumentApprovalInput = z.infer<typeof documentApprovalSchema>;

// ─── List/Filter Schemas ────────────────────────────────────────────────────

export const listLoansFilterSchema = z.object({
  stage: z.enum([
    'STARTED',
    'DOCS_PENDING',
    'DOCS_RECEIVED',
    'CALL_SCHEDULED',
    'SANCTIONED',
    'DISBURSED',
    'LOST',
  ]).optional(),
  counselorId: z.string().optional(),
  country: z.string().optional(),
  collateralType: z.enum(['SECURED', 'NON_COLLATERAL']).optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

export type ListLoansFilterInput = z.infer<typeof listLoansFilterSchema>;

export const listLendersFilterSchema = z.object({
  status: z.enum([
    'INTERESTED',
    'APPLIED',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED',
    'DISBURSED',
    'WITHDRAWN',
  ]).optional(),
});

export type ListLendersFilterInput = z.infer<typeof listLendersFilterSchema>;
