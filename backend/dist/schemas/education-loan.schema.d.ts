import { z } from 'zod';
export declare const createEducationLoanSchema: z.ZodObject<{
    university: z.ZodString;
    course: z.ZodString;
    targetCountry: z.ZodOptional<z.ZodString>;
    totalLoanAmount: z.ZodBigInt;
    expectedIntake: z.ZodOptional<z.ZodString>;
    collateralType: z.ZodDefault<z.ZodEnum<["SECURED", "NON_COLLATERAL"]>>;
    coApplicantName: z.ZodOptional<z.ZodString>;
    coApplicantType: z.ZodOptional<z.ZodEnum<["SALARIED", "SELF_EMPLOYED"]>>;
}, "strip", z.ZodTypeAny, {
    university: string;
    course: string;
    totalLoanAmount: bigint;
    collateralType: "SECURED" | "NON_COLLATERAL";
    targetCountry?: string | undefined;
    expectedIntake?: string | undefined;
    coApplicantName?: string | undefined;
    coApplicantType?: "SALARIED" | "SELF_EMPLOYED" | undefined;
}, {
    university: string;
    course: string;
    totalLoanAmount: bigint;
    targetCountry?: string | undefined;
    expectedIntake?: string | undefined;
    collateralType?: "SECURED" | "NON_COLLATERAL" | undefined;
    coApplicantName?: string | undefined;
    coApplicantType?: "SALARIED" | "SELF_EMPLOYED" | undefined;
}>;
export type CreateEducationLoanInput = z.infer<typeof createEducationLoanSchema>;
export declare const updateEducationLoanSchema: z.ZodObject<{
    university: z.ZodOptional<z.ZodString>;
    course: z.ZodOptional<z.ZodString>;
    targetCountry: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    totalLoanAmount: z.ZodOptional<z.ZodBigInt>;
    expectedIntake: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    collateralType: z.ZodOptional<z.ZodEnum<["SECURED", "NON_COLLATERAL"]>>;
    coApplicantName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    coApplicantType: z.ZodNullable<z.ZodOptional<z.ZodEnum<["SALARIED", "SELF_EMPLOYED"]>>>;
}, "strip", z.ZodTypeAny, {
    university?: string | undefined;
    course?: string | undefined;
    targetCountry?: string | null | undefined;
    totalLoanAmount?: bigint | undefined;
    expectedIntake?: string | null | undefined;
    collateralType?: "SECURED" | "NON_COLLATERAL" | undefined;
    coApplicantName?: string | null | undefined;
    coApplicantType?: "SALARIED" | "SELF_EMPLOYED" | null | undefined;
}, {
    university?: string | undefined;
    course?: string | undefined;
    targetCountry?: string | null | undefined;
    totalLoanAmount?: bigint | undefined;
    expectedIntake?: string | null | undefined;
    collateralType?: "SECURED" | "NON_COLLATERAL" | undefined;
    coApplicantName?: string | null | undefined;
    coApplicantType?: "SALARIED" | "SELF_EMPLOYED" | null | undefined;
}>;
export type UpdateEducationLoanInput = z.infer<typeof updateEducationLoanSchema>;
export declare const updateLoanStageSchema: z.ZodObject<{
    newStage: z.ZodEnum<["STARTED", "DOCS_PENDING", "DOCS_RECEIVED", "CALL_SCHEDULED", "SANCTIONED", "DISBURSED", "LOST"]>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    newStage: "STARTED" | "DOCS_PENDING" | "DOCS_RECEIVED" | "CALL_SCHEDULED" | "SANCTIONED" | "DISBURSED" | "LOST";
    reason?: string | undefined;
}, {
    newStage: "STARTED" | "DOCS_PENDING" | "DOCS_RECEIVED" | "CALL_SCHEDULED" | "SANCTIONED" | "DISBURSED" | "LOST";
    reason?: string | undefined;
}>;
export type UpdateLoanStageInput = z.infer<typeof updateLoanStageSchema>;
export declare const addLenderSchema: z.ZodObject<{
    lenderName: z.ZodString;
    matchScore: z.ZodOptional<z.ZodNumber>;
    recommendationSource: z.ZodDefault<z.ZodEnum<["AUTO_RECOMMENDED", "MANUAL", "SYSTEM_MATCH"]>>;
}, "strip", z.ZodTypeAny, {
    lenderName: string;
    recommendationSource: "AUTO_RECOMMENDED" | "MANUAL" | "SYSTEM_MATCH";
    matchScore?: number | undefined;
}, {
    lenderName: string;
    matchScore?: number | undefined;
    recommendationSource?: "AUTO_RECOMMENDED" | "MANUAL" | "SYSTEM_MATCH" | undefined;
}>;
export type AddLenderInput = z.infer<typeof addLenderSchema>;
export declare const updateLenderStatusSchema: z.ZodObject<{
    lenderStatus: z.ZodEnum<["INTERESTED", "APPLIED", "UNDER_REVIEW", "APPROVED", "REJECTED", "DISBURSED", "WITHDRAWN"]>;
    sanctionAmount: z.ZodOptional<z.ZodBigInt>;
    roi: z.ZodOptional<z.ZodNumber>;
    processingFee: z.ZodOptional<z.ZodBigInt>;
    sanctionDate: z.ZodOptional<z.ZodDate>;
    sanctionValidity: z.ZodOptional<z.ZodDate>;
    disbursementAmount: z.ZodOptional<z.ZodBigInt>;
    disbursementDate: z.ZodOptional<z.ZodDate>;
    tranchCount: z.ZodOptional<z.ZodNumber>;
    rejectionReason: z.ZodOptional<z.ZodString>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    lenderStatus: "DISBURSED" | "INTERESTED" | "APPLIED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN";
    reason?: string | undefined;
    sanctionAmount?: bigint | undefined;
    roi?: number | undefined;
    processingFee?: bigint | undefined;
    sanctionDate?: Date | undefined;
    sanctionValidity?: Date | undefined;
    disbursementAmount?: bigint | undefined;
    disbursementDate?: Date | undefined;
    tranchCount?: number | undefined;
    rejectionReason?: string | undefined;
}, {
    lenderStatus: "DISBURSED" | "INTERESTED" | "APPLIED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN";
    reason?: string | undefined;
    sanctionAmount?: bigint | undefined;
    roi?: number | undefined;
    processingFee?: bigint | undefined;
    sanctionDate?: Date | undefined;
    sanctionValidity?: Date | undefined;
    disbursementAmount?: bigint | undefined;
    disbursementDate?: Date | undefined;
    tranchCount?: number | undefined;
    rejectionReason?: string | undefined;
}>;
export type UpdateLenderStatusInput = z.infer<typeof updateLenderStatusSchema>;
export declare const requestDocumentsSchema: z.ZodObject<{
    categories: z.ZodArray<z.ZodEnum<["KYC", "ACADEMICS", "FINANCIALS", "COLLATERAL"]>, "many">;
    deadline: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    categories: ("KYC" | "ACADEMICS" | "FINANCIALS" | "COLLATERAL")[];
    deadline?: Date | undefined;
}, {
    categories: ("KYC" | "ACADEMICS" | "FINANCIALS" | "COLLATERAL")[];
    deadline?: Date | undefined;
}>;
export type RequestDocumentsInput = z.infer<typeof requestDocumentsSchema>;
export declare const documentApprovalSchema: z.ZodObject<{
    status: z.ZodEnum<["APPROVED", "REJECTED"]>;
    rejectionReason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "APPROVED" | "REJECTED";
    rejectionReason?: string | undefined;
}, {
    status: "APPROVED" | "REJECTED";
    rejectionReason?: string | undefined;
}>;
export type DocumentApprovalInput = z.infer<typeof documentApprovalSchema>;
export declare const listLoansFilterSchema: z.ZodObject<{
    stage: z.ZodOptional<z.ZodEnum<["STARTED", "DOCS_PENDING", "DOCS_RECEIVED", "CALL_SCHEDULED", "SANCTIONED", "DISBURSED", "LOST"]>>;
    counselorId: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    collateralType: z.ZodOptional<z.ZodEnum<["SECURED", "NON_COLLATERAL"]>>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    country?: string | undefined;
    stage?: "STARTED" | "DOCS_PENDING" | "DOCS_RECEIVED" | "CALL_SCHEDULED" | "SANCTIONED" | "DISBURSED" | "LOST" | undefined;
    collateralType?: "SECURED" | "NON_COLLATERAL" | undefined;
    counselorId?: string | undefined;
}, {
    country?: string | undefined;
    limit?: number | undefined;
    stage?: "STARTED" | "DOCS_PENDING" | "DOCS_RECEIVED" | "CALL_SCHEDULED" | "SANCTIONED" | "DISBURSED" | "LOST" | undefined;
    collateralType?: "SECURED" | "NON_COLLATERAL" | undefined;
    counselorId?: string | undefined;
    offset?: number | undefined;
}>;
export type ListLoansFilterInput = z.infer<typeof listLoansFilterSchema>;
export declare const listLendersFilterSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["INTERESTED", "APPLIED", "UNDER_REVIEW", "APPROVED", "REJECTED", "DISBURSED", "WITHDRAWN"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "DISBURSED" | "INTERESTED" | "APPLIED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN" | undefined;
}, {
    status?: "DISBURSED" | "INTERESTED" | "APPLIED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN" | undefined;
}>;
export type ListLendersFilterInput = z.infer<typeof listLendersFilterSchema>;
//# sourceMappingURL=education-loan.schema.d.ts.map