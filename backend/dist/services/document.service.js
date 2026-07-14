"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const index_1 = require("../index");
class DocumentService {
    /**
     * Upload a document (creates DocumentSubmission)
     */
    static async uploadDocument(loanId, input, userId, userRole) {
        // Verify loan exists and user has access
        const loan = await index_1.prisma.educationLoanApplication.findUnique({
            where: { id: loanId },
            include: { lead: true },
        });
        if (!loan) {
            const error = new Error('Loan not found');
            error.statusCode = 404;
            error.code = 'LOAN_NOT_FOUND';
            throw error;
        }
        // RBAC check
        if (userRole === 'COUNSELOR' && loan.lead.currentOwnerId !== userId) {
            const error = new Error('Access denied');
            error.statusCode = 403;
            error.code = 'FORBIDDEN';
            throw error;
        }
        // Verify document request exists
        const docRequest = await index_1.prisma.documentRequest.findUnique({
            where: { id: input.documentRequestId },
        });
        if (!docRequest) {
            const error = new Error('Document request not found');
            error.statusCode = 404;
            error.code = 'DOC_REQUEST_NOT_FOUND';
            throw error;
        }
        // Validate file size (< 10MB)
        if (input.fileSize > 10 * 1024 * 1024) {
            const error = new Error('File size exceeds 10MB limit');
            error.statusCode = 400;
            error.code = 'FILE_TOO_LARGE';
            throw error;
        }
        // Create document submission
        const submission = await index_1.prisma.documentSubmission.create({
            data: {
                docSubmissionCode: `DS-${Math.floor(Math.random() * 9000) + 1000}`,
                documentRequestId: input.documentRequestId,
                name: input.fileName,
                category: 'KYC', // Will be updated based on document type
                documentType: input.mimeType,
                submissionMethod: 'UPLOAD',
                fileUrl: input.fileUrl,
                fileName: input.fileName,
                fileSize: BigInt(input.fileSize),
                mimeType: input.mimeType,
                submissionDate: new Date(),
                status: 'SUBMITTED',
            },
        });
        // Check if all documents in request are now submitted
        const allDocuments = await index_1.prisma.documentSubmission.findMany({
            where: { documentRequestId: input.documentRequestId },
        });
        const allSubmitted = allDocuments.every((doc) => doc.status === 'SUBMITTED' || doc.status === 'APPROVED');
        // Update document request status if all submitted
        if (allSubmitted) {
            await index_1.prisma.documentRequest.update({
                where: { id: input.documentRequestId },
                data: { status: 'COMPLETED' },
            });
        }
        return {
            submission,
            fileUrl: input.fileUrl,
            status: 'submitted',
        };
    }
    /**
     * Approve a document submission
     */
    static async approveDocument(loanId, documentRequestId, documentId, _input, userId, userRole) {
        // Verify loan exists and user has access
        const loan = await index_1.prisma.educationLoanApplication.findUnique({
            where: { id: loanId },
            include: { lead: true },
        });
        if (!loan) {
            const error = new Error('Loan not found');
            error.statusCode = 404;
            error.code = 'LOAN_NOT_FOUND';
            throw error;
        }
        // Only admins can approve documents
        if (userRole !== 'ADMIN') {
            const error = new Error('Only admins can approve documents');
            error.statusCode = 403;
            error.code = 'FORBIDDEN';
            throw error;
        }
        // Verify document exists
        const document = await index_1.prisma.documentSubmission.findUnique({
            where: { id: documentId },
            include: { documentRequest: true },
        });
        if (!document) {
            const error = new Error('Document not found');
            error.statusCode = 404;
            error.code = 'DOCUMENT_NOT_FOUND';
            throw error;
        }
        // Verify it belongs to the correct loan
        if (document.documentRequest.educationLoanId !== loanId) {
            const error = new Error('Document does not belong to this loan');
            error.statusCode = 400;
            error.code = 'INVALID_LOAN_DOCUMENT';
            throw error;
        }
        // Update document status
        const updated = await index_1.prisma.documentSubmission.update({
            where: { id: documentId },
            data: {
                status: 'APPROVED',
                approvedAt: new Date(),
            },
        });
        // Check if all documents in the request are approved
        const allDocuments = await index_1.prisma.documentSubmission.findMany({
            where: { documentRequestId },
        });
        const allApproved = allDocuments.every((doc) => doc.status === 'APPROVED');
        // If all approved, update document request and auto-transition loan
        if (allApproved) {
            await index_1.prisma.documentRequest.update({
                where: { id: documentRequestId },
                data: { status: 'COMPLETED' },
            });
            // Auto-transition loan to DOCS_RECEIVED if in DOCS_PENDING
            if (loan.loanStage === 'DOCS_PENDING') {
                await index_1.prisma.educationLoanApplication.update({
                    where: { id: loanId },
                    data: { loanStage: 'DOCS_RECEIVED' },
                });
                // Create stage history entry
                await index_1.prisma.loanStageHistory.create({
                    data: {
                        educationLoanId: loanId,
                        previousStage: 'DOCS_PENDING',
                        newStage: 'DOCS_RECEIVED',
                        reason: 'All documents approved',
                        responsibleCounselorId: userId,
                    },
                });
            }
        }
        return updated;
    }
    /**
     * Reject a document submission
     */
    static async rejectDocument(loanId, _documentRequestId, documentId, input, _userId, userRole) {
        // Verify loan exists and user has access
        const loan = await index_1.prisma.educationLoanApplication.findUnique({
            where: { id: loanId },
            include: { lead: true },
        });
        if (!loan) {
            const error = new Error('Loan not found');
            error.statusCode = 404;
            error.code = 'LOAN_NOT_FOUND';
            throw error;
        }
        // Only admins can reject documents
        if (userRole !== 'ADMIN') {
            const error = new Error('Only admins can reject documents');
            error.statusCode = 403;
            error.code = 'FORBIDDEN';
            throw error;
        }
        // Verify document exists
        const document = await index_1.prisma.documentSubmission.findUnique({
            where: { id: documentId },
            include: { documentRequest: true },
        });
        if (!document) {
            const error = new Error('Document not found');
            error.statusCode = 404;
            error.code = 'DOCUMENT_NOT_FOUND';
            throw error;
        }
        // Verify it belongs to the correct loan
        if (document.documentRequest.educationLoanId !== loanId) {
            const error = new Error('Document does not belong to this loan');
            error.statusCode = 400;
            error.code = 'INVALID_LOAN_DOCUMENT';
            throw error;
        }
        // Update document status to rejected
        const updated = await index_1.prisma.documentSubmission.update({
            where: { id: documentId },
            data: {
                status: 'REJECTED',
                rejectedAt: new Date(),
                rejectionReason: input.reason,
            },
        });
        return updated;
    }
    /**
     * Get document submission history/versions
     */
    static async getDocumentVersions(loanId, documentId, userId, userRole) {
        // Verify loan exists and user has access
        const loan = await index_1.prisma.educationLoanApplication.findUnique({
            where: { id: loanId },
            include: { lead: true },
        });
        if (!loan) {
            const error = new Error('Loan not found');
            error.statusCode = 404;
            error.code = 'LOAN_NOT_FOUND';
            throw error;
        }
        // RBAC check
        if (userRole === 'COUNSELOR' && loan.lead.currentOwnerId !== userId) {
            const error = new Error('Access denied');
            error.statusCode = 403;
            error.code = 'FORBIDDEN';
            throw error;
        }
        // Get document with all version history
        const document = await index_1.prisma.documentSubmission.findUnique({
            where: { id: documentId },
            include: { documentRequest: true },
        });
        if (!document) {
            const error = new Error('Document not found');
            error.statusCode = 404;
            error.code = 'DOCUMENT_NOT_FOUND';
            throw error;
        }
        // Get all submissions for this document (resubmissions)
        const versions = await index_1.prisma.documentSubmission.findMany({
            where: {
                documentRequestId: document.documentRequestId,
                name: document.name, // Same document name = same document type
            },
            orderBy: { submissionDate: 'desc' },
        });
        return versions;
    }
    /**
     * Get all documents in a document request with submission status
     */
    static async getDocumentStatus(loanId, documentRequestId, userId, userRole) {
        // Verify loan exists and user has access
        const loan = await index_1.prisma.educationLoanApplication.findUnique({
            where: { id: loanId },
            include: { lead: true },
        });
        if (!loan) {
            const error = new Error('Loan not found');
            error.statusCode = 404;
            error.code = 'LOAN_NOT_FOUND';
            throw error;
        }
        // RBAC check
        if (userRole === 'COUNSELOR' && loan.lead.currentOwnerId !== userId) {
            const error = new Error('Access denied');
            error.statusCode = 403;
            error.code = 'FORBIDDEN';
            throw error;
        }
        // Get document request with all submissions
        const request = await index_1.prisma.documentRequest.findUnique({
            where: { id: documentRequestId },
            include: {
                documents: {
                    orderBy: { category: 'asc' },
                },
            },
        });
        if (!request) {
            const error = new Error('Document request not found');
            error.statusCode = 404;
            error.code = 'DOC_REQUEST_NOT_FOUND';
            throw error;
        }
        // Calculate completion status
        const approved = request.documents.filter((d) => d.status === 'APPROVED').length;
        const submitted = request.documents.filter((d) => d.status === 'SUBMITTED').length;
        const pending = request.documents.filter((d) => d.status === 'NOT_STARTED').length;
        const rejected = request.documents.filter((d) => d.status === 'REJECTED').length;
        return {
            request,
            summary: {
                completed: approved,
                approved,
                submitted,
                pending,
                rejected,
                total: request.documents.length,
                completionPercentage: Math.round((approved / request.documents.length) * 100),
            },
        };
    }
}
exports.DocumentService = DocumentService;
//# sourceMappingURL=document.service.js.map