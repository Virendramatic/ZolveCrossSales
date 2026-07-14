"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listLendersFilterSchema = exports.listLoansFilterSchema = exports.documentApprovalSchema = exports.requestDocumentsSchema = exports.updateLenderStatusSchema = exports.addLenderSchema = exports.updateLoanStageSchema = exports.updateEducationLoanSchema = exports.createEducationLoanSchema = void 0;
const zod_1 = require("zod");
// ─── Education Loan Schemas ───────────────────────────────────────────────────
exports.createEducationLoanSchema = zod_1.z.object({
    university: zod_1.z.string().min(1, 'University is required'),
    course: zod_1.z.string().min(1, 'Course is required'),
    targetCountry: zod_1.z.string().optional(),
    totalLoanAmount: zod_1.z.bigint().positive('Loan amount must be positive'),
    expectedIntake: zod_1.z.string().optional(),
    collateralType: zod_1.z.enum(['SECURED', 'NON_COLLATERAL']).default('NON_COLLATERAL'),
    coApplicantName: zod_1.z.string().optional(),
    coApplicantType: zod_1.z.enum(['SALARIED', 'SELF_EMPLOYED']).optional(),
});
exports.updateEducationLoanSchema = zod_1.z.object({
    university: zod_1.z.string().min(1).optional(),
    course: zod_1.z.string().min(1).optional(),
    targetCountry: zod_1.z.string().optional().nullable(),
    totalLoanAmount: zod_1.z.bigint().positive().optional(),
    expectedIntake: zod_1.z.string().optional().nullable(),
    collateralType: zod_1.z.enum(['SECURED', 'NON_COLLATERAL']).optional(),
    coApplicantName: zod_1.z.string().optional().nullable(),
    coApplicantType: zod_1.z.enum(['SALARIED', 'SELF_EMPLOYED']).optional().nullable(),
});
exports.updateLoanStageSchema = zod_1.z.object({
    newStage: zod_1.z.enum([
        'STARTED',
        'DOCS_PENDING',
        'DOCS_RECEIVED',
        'CALL_SCHEDULED',
        'SANCTIONED',
        'DISBURSED',
        'LOST',
    ]),
    reason: zod_1.z.string().optional(),
});
// ─── Lender Application Schemas ──────────────────────────────────────────────
exports.addLenderSchema = zod_1.z.object({
    lenderName: zod_1.z.string().min(1, 'Lender name is required'),
    matchScore: zod_1.z.number().int().min(0).max(100).optional(),
    recommendationSource: zod_1.z.enum(['AUTO_RECOMMENDED', 'MANUAL', 'SYSTEM_MATCH']).default('MANUAL'),
});
exports.updateLenderStatusSchema = zod_1.z.object({
    lenderStatus: zod_1.z.enum([
        'INTERESTED',
        'APPLIED',
        'UNDER_REVIEW',
        'APPROVED',
        'REJECTED',
        'DISBURSED',
        'WITHDRAWN',
    ]),
    sanctionAmount: zod_1.z.bigint().positive().optional(),
    roi: zod_1.z.number().min(0).max(50).optional(),
    processingFee: zod_1.z.bigint().positive().optional(),
    sanctionDate: zod_1.z.coerce.date().optional(),
    sanctionValidity: zod_1.z.coerce.date().optional(),
    disbursementAmount: zod_1.z.bigint().positive().optional(),
    disbursementDate: zod_1.z.coerce.date().optional(),
    tranchCount: zod_1.z.number().int().positive().optional(),
    rejectionReason: zod_1.z.string().optional(),
    reason: zod_1.z.string().optional(),
});
// ─── Document Request Schemas ────────────────────────────────────────────────
exports.requestDocumentsSchema = zod_1.z.object({
    categories: zod_1.z.array(zod_1.z.enum(['KYC', 'ACADEMICS', 'FINANCIALS', 'COLLATERAL'])).min(1),
    deadline: zod_1.z.coerce.date().optional(),
});
exports.documentApprovalSchema = zod_1.z.object({
    status: zod_1.z.enum(['APPROVED', 'REJECTED']),
    rejectionReason: zod_1.z.string().optional(),
});
// ─── List/Filter Schemas ────────────────────────────────────────────────────
exports.listLoansFilterSchema = zod_1.z.object({
    stage: zod_1.z.enum([
        'STARTED',
        'DOCS_PENDING',
        'DOCS_RECEIVED',
        'CALL_SCHEDULED',
        'SANCTIONED',
        'DISBURSED',
        'LOST',
    ]).optional(),
    counselorId: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    collateralType: zod_1.z.enum(['SECURED', 'NON_COLLATERAL']).optional(),
    limit: zod_1.z.number().int().min(1).max(100).default(50),
    offset: zod_1.z.number().int().min(0).default(0),
});
exports.listLendersFilterSchema = zod_1.z.object({
    status: zod_1.z.enum([
        'INTERESTED',
        'APPLIED',
        'UNDER_REVIEW',
        'APPROVED',
        'REJECTED',
        'DISBURSED',
        'WITHDRAWN',
    ]).optional(),
});
//# sourceMappingURL=education-loan.schema.js.map