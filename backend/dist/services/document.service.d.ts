export interface DocumentUploadInput {
    documentRequestId: string;
    documentId: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
}
export interface DocumentApprovalInput {
    reason?: string;
}
export interface DocumentRejectionInput {
    reason: string;
}
export declare class DocumentService {
    /**
     * Upload a document (creates DocumentSubmission)
     */
    static uploadDocument(loanId: string, input: DocumentUploadInput, userId: string, userRole: string): Promise<{
        submission: {
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
            versions: import("@prisma/client/runtime/library").JsonValue | null;
            extractedData: import("@prisma/client/runtime/library").JsonValue | null;
        };
        fileUrl: string;
        status: string;
    }>;
    /**
     * Approve a document submission
     */
    static approveDocument(loanId: string, documentRequestId: string, documentId: string, _input: DocumentApprovalInput, userId: string, userRole: string): Promise<{
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
        versions: import("@prisma/client/runtime/library").JsonValue | null;
        extractedData: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    /**
     * Reject a document submission
     */
    static rejectDocument(loanId: string, _documentRequestId: string, documentId: string, input: DocumentRejectionInput, _userId: string, userRole: string): Promise<{
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
        versions: import("@prisma/client/runtime/library").JsonValue | null;
        extractedData: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    /**
     * Get document submission history/versions
     */
    static getDocumentVersions(loanId: string, documentId: string, userId: string, userRole: string): Promise<{
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
        versions: import("@prisma/client/runtime/library").JsonValue | null;
        extractedData: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    /**
     * Get all documents in a document request with submission status
     */
    static getDocumentStatus(loanId: string, documentRequestId: string, userId: string, userRole: string): Promise<{
        request: {
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
                versions: import("@prisma/client/runtime/library").JsonValue | null;
                extractedData: import("@prisma/client/runtime/library").JsonValue | null;
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
        };
        summary: {
            completed: number;
            approved: number;
            submitted: number;
            pending: number;
            rejected: number;
            total: number;
            completionPercentage: number;
        };
    }>;
}
//# sourceMappingURL=document.service.d.ts.map