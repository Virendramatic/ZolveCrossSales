import { EducationLoanApplication, LoanStage, Prisma } from '@prisma/client';
import { CreateEducationLoanInput, UpdateEducationLoanInput, UpdateLoanStageInput, AddLenderInput, UpdateLenderStatusInput, RequestDocumentsInput } from '../schemas/education-loan.schema';
/**
 * EducationLoanService - Complete lifecycle management for education loans
 * Handles CRUD operations, stage management, lender coordination, and documents
 */
export declare class EducationLoanService {
    /**
     * Generate unique loan code (EL-XXXX format)
     */
    private static generateLoanCode;
    /**
     * CREATE: Create new education loan application
     */
    static createLoan(leadId: string, input: CreateEducationLoanInput, userId: string, userRole: string): Promise<EducationLoanApplication>;
    /**
     * READ: Get loan by ID with all relationships
     */
    static getLoanById(loanId: string, userId: string, userRole: string): Promise<EducationLoanApplication>;
    /**
     * LIST: Get loans with filtering and pagination
     */
    static listLoans(userId: string, userRole: string, filters: {
        stage?: LoanStage;
        counselorId?: string;
        country?: string;
        collateralType?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        data: EducationLoanApplication[];
        total: number;
        limit: number;
        offset: number;
    }>;
    /**
     * UPDATE: Update loan details (only in STARTED stage)
     */
    static updateLoanDetails(loanId: string, input: UpdateEducationLoanInput, userId: string, userRole: string): Promise<EducationLoanApplication>;
    /**
     * UPDATE: Update loan stage with validation and history tracking
     */
    static updateLoanStage(loanId: string, input: UpdateLoanStageInput, userId: string, userRole: string): Promise<EducationLoanApplication>;
    /**
     * DELETE: Soft-delete loan
     */
    static deleteLoan(loanId: string, userId: string, userRole: string): Promise<EducationLoanApplication>;
    /**
     * Add lender to loan
     */
    static addLender(loanId: string, input: AddLenderInput, userId: string): Promise<{
        statusHistory: {
            id: string;
            reason: string | null;
            previousStatus: import(".prisma/client").$Enums.LenderStatus | null;
            newStatus: import(".prisma/client").$Enums.LenderStatus;
            changedAt: Date;
            changedBy: string;
            metadata: Prisma.JsonValue | null;
            lenderApplicationId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        lenderName: string;
        matchScore: number | null;
        recommendationSource: import(".prisma/client").$Enums.RecommendationSource;
        lenderStatus: import(".prisma/client").$Enums.LenderStatus;
        sanctionAmount: bigint | null;
        roi: Prisma.Decimal | null;
        processingFee: bigint | null;
        sanctionDate: Date | null;
        sanctionValidity: Date | null;
        disbursementAmount: bigint | null;
        disbursementDate: Date | null;
        tranchCount: number | null;
        rejectionReason: string | null;
        lenderCode: string;
        educationLoanId: string;
        statusUpdatedAt: Date;
        tranches: Prisma.JsonValue | null;
        rejectionDate: Date | null;
    }>;
    /**
     * Get lenders for loan
     */
    static getLendersForLoan(loanId: string, userId: string, userRole: string, filters?: {
        status?: string;
    }): Promise<({
        statusHistory: {
            id: string;
            reason: string | null;
            previousStatus: import(".prisma/client").$Enums.LenderStatus | null;
            newStatus: import(".prisma/client").$Enums.LenderStatus;
            changedAt: Date;
            changedBy: string;
            metadata: Prisma.JsonValue | null;
            lenderApplicationId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        lenderName: string;
        matchScore: number | null;
        recommendationSource: import(".prisma/client").$Enums.RecommendationSource;
        lenderStatus: import(".prisma/client").$Enums.LenderStatus;
        sanctionAmount: bigint | null;
        roi: Prisma.Decimal | null;
        processingFee: bigint | null;
        sanctionDate: Date | null;
        sanctionValidity: Date | null;
        disbursementAmount: bigint | null;
        disbursementDate: Date | null;
        tranchCount: number | null;
        rejectionReason: string | null;
        lenderCode: string;
        educationLoanId: string;
        statusUpdatedAt: Date;
        tranches: Prisma.JsonValue | null;
        rejectionDate: Date | null;
    })[]>;
    /**
     * Get specific lender
     */
    static getLenderById(loanId: string, lenderId: string, userId: string, userRole: string): Promise<{
        statusHistory: {
            id: string;
            reason: string | null;
            previousStatus: import(".prisma/client").$Enums.LenderStatus | null;
            newStatus: import(".prisma/client").$Enums.LenderStatus;
            changedAt: Date;
            changedBy: string;
            metadata: Prisma.JsonValue | null;
            lenderApplicationId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        lenderName: string;
        matchScore: number | null;
        recommendationSource: import(".prisma/client").$Enums.RecommendationSource;
        lenderStatus: import(".prisma/client").$Enums.LenderStatus;
        sanctionAmount: bigint | null;
        roi: Prisma.Decimal | null;
        processingFee: bigint | null;
        sanctionDate: Date | null;
        sanctionValidity: Date | null;
        disbursementAmount: bigint | null;
        disbursementDate: Date | null;
        tranchCount: number | null;
        rejectionReason: string | null;
        lenderCode: string;
        educationLoanId: string;
        statusUpdatedAt: Date;
        tranches: Prisma.JsonValue | null;
        rejectionDate: Date | null;
    }>;
    /**
     * Update lender status
     */
    static updateLenderStatus(loanId: string, lenderId: string, input: UpdateLenderStatusInput, userId: string, userRole: string): Promise<{
        statusHistory: {
            id: string;
            reason: string | null;
            previousStatus: import(".prisma/client").$Enums.LenderStatus | null;
            newStatus: import(".prisma/client").$Enums.LenderStatus;
            changedAt: Date;
            changedBy: string;
            metadata: Prisma.JsonValue | null;
            lenderApplicationId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        lenderName: string;
        matchScore: number | null;
        recommendationSource: import(".prisma/client").$Enums.RecommendationSource;
        lenderStatus: import(".prisma/client").$Enums.LenderStatus;
        sanctionAmount: bigint | null;
        roi: Prisma.Decimal | null;
        processingFee: bigint | null;
        sanctionDate: Date | null;
        sanctionValidity: Date | null;
        disbursementAmount: bigint | null;
        disbursementDate: Date | null;
        tranchCount: number | null;
        rejectionReason: string | null;
        lenderCode: string;
        educationLoanId: string;
        statusUpdatedAt: Date;
        tranches: Prisma.JsonValue | null;
        rejectionDate: Date | null;
    }>;
    /**
     * Request documents for loan (auto-transitions to DOCS_PENDING)
     */
    static requestDocuments(loanId: string, input: RequestDocumentsInput, userId: string, userRole: string): Promise<{
        documents: {
            status: import(".prisma/client").$Enums.DocumentStatus;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            rejectionReason: string | null;
            docSubmissionCode: string;
            documentRequestId: string;
            category: import(".prisma/client").$Enums.DocumentCategory;
            documentType: string;
            required: boolean;
            submissionMethod: import(".prisma/client").$Enums.SubmissionMethod;
            submissionDate: Date | null;
            fileUrl: string | null;
            fileName: string | null;
            fileSize: bigint | null;
            mimeType: string | null;
            approvedAt: Date | null;
            rejectedAt: Date | null;
            versions: Prisma.JsonValue | null;
            extractedData: Prisma.JsonValue | null;
        }[];
    } & {
        status: import(".prisma/client").$Enums.DocumentRequestStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        completedAt: Date | null;
        categories: import(".prisma/client").$Enums.DocumentCategory[];
        deadline: Date | null;
        educationLoanId: string;
        docRequestCode: string;
        sentDate: Date | null;
        reminderSentAt: Date | null;
    }>;
    /**
     * Get document request details
     */
    static getDocumentRequest(loanId: string, docRequestId: string, userId: string, userRole: string): Promise<{
        documents: {
            status: import(".prisma/client").$Enums.DocumentStatus;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            rejectionReason: string | null;
            docSubmissionCode: string;
            documentRequestId: string;
            category: import(".prisma/client").$Enums.DocumentCategory;
            documentType: string;
            required: boolean;
            submissionMethod: import(".prisma/client").$Enums.SubmissionMethod;
            submissionDate: Date | null;
            fileUrl: string | null;
            fileName: string | null;
            fileSize: bigint | null;
            mimeType: string | null;
            approvedAt: Date | null;
            rejectedAt: Date | null;
            versions: Prisma.JsonValue | null;
            extractedData: Prisma.JsonValue | null;
        }[];
    } & {
        status: import(".prisma/client").$Enums.DocumentRequestStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        completedAt: Date | null;
        categories: import(".prisma/client").$Enums.DocumentCategory[];
        deadline: Date | null;
        educationLoanId: string;
        docRequestCode: string;
        sentDate: Date | null;
        reminderSentAt: Date | null;
    }>;
    /**
     * Approve document
     */
    static approveDocument(loanId: string, docRequestId: string, documentId: string, userId: string, userRole: string): Promise<{
        status: import(".prisma/client").$Enums.DocumentStatus;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        rejectionReason: string | null;
        docSubmissionCode: string;
        documentRequestId: string;
        category: import(".prisma/client").$Enums.DocumentCategory;
        documentType: string;
        required: boolean;
        submissionMethod: import(".prisma/client").$Enums.SubmissionMethod;
        submissionDate: Date | null;
        fileUrl: string | null;
        fileName: string | null;
        fileSize: bigint | null;
        mimeType: string | null;
        approvedAt: Date | null;
        rejectedAt: Date | null;
        versions: Prisma.JsonValue | null;
        extractedData: Prisma.JsonValue | null;
    }>;
    /**
     * Reject document
     */
    static rejectDocument(loanId: string, docRequestId: string, documentId: string, reason: string, userId: string, userRole: string): Promise<{
        status: import(".prisma/client").$Enums.DocumentStatus;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        rejectionReason: string | null;
        docSubmissionCode: string;
        documentRequestId: string;
        category: import(".prisma/client").$Enums.DocumentCategory;
        documentType: string;
        required: boolean;
        submissionMethod: import(".prisma/client").$Enums.SubmissionMethod;
        submissionDate: Date | null;
        fileUrl: string | null;
        fileName: string | null;
        fileSize: bigint | null;
        mimeType: string | null;
        approvedAt: Date | null;
        rejectedAt: Date | null;
        versions: Prisma.JsonValue | null;
        extractedData: Prisma.JsonValue | null;
    }>;
    /**
     * Generate document checklist based on categories and collateral type
     */
    private static generateDocumentChecklist;
    /**
     * Get loan statistics for dashboard
     */
    static getLoanStats(userId: string, userRole: string): Promise<{
        totalLoans: number;
        byStage: Record<string, number>;
        lenderStatusBreakdown: Record<string, number>;
    }>;
}
//# sourceMappingURL=education-loan.service.d.ts.map