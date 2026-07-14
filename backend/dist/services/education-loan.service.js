"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EducationLoanService = void 0;
const index_1 = require("../index");
/**
 * EducationLoanService - Complete lifecycle management for education loans
 * Handles CRUD operations, stage management, lender coordination, and documents
 */
class EducationLoanService {
    /**
     * Generate unique loan code (EL-XXXX format)
     */
    static generateLoanCode() {
        const randomNum = Math.floor(Math.random() * 9000) + 1000;
        return `EL-${randomNum}`;
    }
    /**
     * CREATE: Create new education loan application
     */
    static async createLoan(leadId, input, userId, userRole) {
        // Verify lead exists and user has access
        const lead = await index_1.prisma.lead.findFirst({
            where: { id: leadId },
        });
        if (!lead) {
            const error = new Error('Lead not found');
            error.statusCode = 404;
            error.code = 'LEAD_NOT_FOUND';
            throw error;
        }
        // Check permission: owner or admin
        if (userRole !== 'ADMIN' && lead.currentOwnerId !== userId) {
            const error = new Error('You do not have permission to create loan for this lead');
            error.statusCode = 403;
            error.code = 'FORBIDDEN';
            throw error;
        }
        // Check for existing loan (max 1 per lead)
        const existingLoan = await index_1.prisma.educationLoanApplication.findFirst({
            where: { leadId, archivedAt: null },
        });
        if (existingLoan) {
            const error = new Error('Lead already has an active education loan');
            error.statusCode = 409;
            error.code = 'DUPLICATE_LOAN';
            throw error;
        }
        // Create loan with ProductInstance
        const loanCode = this.generateLoanCode();
        const loan = await index_1.prisma.educationLoanApplication.create({
            data: {
                loanCode,
                leadId,
                university: input.university,
                course: input.course,
                targetCountry: input.targetCountry,
                totalLoanAmount: input.totalLoanAmount,
                expectedIntake: input.expectedIntake,
                collateralType: input.collateralType,
                coApplicantName: input.coApplicantName,
                coApplicantType: input.coApplicantType,
                loanStage: 'STARTED',
                stageUpdatedAt: new Date(),
                counselorZrmId: userId,
            },
            include: {
                lead: true,
                lenderApplications: true,
                documentRequests: true,
                stageHistory: true,
            },
        });
        // Create ProductInstance for tracking
        try {
            await index_1.prisma.productInstance.create({
                data: {
                    leadId,
                    productType: 'EDUCATION_LOAN',
                    ownerUserId: userId,
                    productCode: `PI-${Math.floor(Math.random() * 9000) + 1000}`,
                    stage: 'STARTED',
                },
            });
        }
        catch (error) {
            // Log but don't fail if ProductInstance creation fails
            console.error('Failed to create ProductInstance:', error);
        }
        return loan;
    }
    /**
     * READ: Get loan by ID with all relationships
     */
    static async getLoanById(loanId, userId, userRole) {
        const loan = await index_1.prisma.educationLoanApplication.findUnique({
            where: { id: loanId },
            include: {
                lead: true,
                lenderApplications: {
                    include: {
                        statusHistory: true,
                    },
                    orderBy: { matchScore: 'desc' },
                },
                documentRequests: {
                    include: {
                        documents: true,
                    },
                },
                stageHistory: {
                    orderBy: { transitionTimestamp: 'desc' },
                },
            },
        });
        if (!loan) {
            const error = new Error('Loan not found');
            error.statusCode = 404;
            error.code = 'LOAN_NOT_FOUND';
            throw error;
        }
        // Check permission: owner, admin, or creator
        if (userRole !== 'ADMIN' &&
            loan.counselorZrmId !== userId &&
            loan.lead.currentOwnerId !== userId) {
            const error = new Error('You do not have permission to view this loan');
            error.statusCode = 403;
            error.code = 'FORBIDDEN';
            throw error;
        }
        return loan;
    }
    /**
     * LIST: Get loans with filtering and pagination
     */
    static async listLoans(userId, userRole, filters) {
        const limit = filters.limit || 50;
        const offset = filters.offset || 0;
        // Build filter clause
        const whereClause = {
            archivedAt: null,
        };
        if (filters.stage) {
            whereClause.loanStage = filters.stage;
        }
        if (filters.country) {
            whereClause.targetCountry = filters.country;
        }
        if (filters.collateralType) {
            whereClause.collateralType = filters.collateralType;
        }
        // RBAC: counselors only see their loans
        if (userRole === 'COUNSELOR') {
            whereClause.OR = [{ counselorZrmId: userId }, { lead: { currentOwnerId: userId } }];
        }
        else if (filters.counselorId) {
            whereClause.counselorZrmId = filters.counselorId;
        }
        const [loans, total] = await Promise.all([
            index_1.prisma.educationLoanApplication.findMany({
                where: whereClause,
                include: {
                    lead: true,
                    lenderApplications: true,
                    documentRequests: true,
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            index_1.prisma.educationLoanApplication.count({ where: whereClause }),
        ]);
        return { data: loans, total, limit, offset };
    }
    /**
     * UPDATE: Update loan details (only in STARTED stage)
     */
    static async updateLoanDetails(loanId, input, userId, userRole) {
        const loan = await this.getLoanById(loanId, userId, userRole);
        if (loan.loanStage !== 'STARTED') {
            const error = new Error('Loan details can only be updated in STARTED stage');
            error.statusCode = 400;
            error.code = 'INVALID_STAGE_FOR_UPDATE';
            throw error;
        }
        const updated = await index_1.prisma.educationLoanApplication.update({
            where: { id: loanId },
            data: {
                university: input.university,
                course: input.course,
                targetCountry: input.targetCountry,
                totalLoanAmount: input.totalLoanAmount,
                expectedIntake: input.expectedIntake,
                collateralType: input.collateralType,
                coApplicantName: input.coApplicantName,
                coApplicantType: input.coApplicantType,
            },
            include: {
                lead: true,
                lenderApplications: true,
                documentRequests: true,
                stageHistory: true,
            },
        });
        return updated;
    }
    /**
     * UPDATE: Update loan stage with validation and history tracking
     */
    static async updateLoanStage(loanId, input, userId, userRole) {
        const loan = await this.getLoanById(loanId, userId, userRole);
        // Validate stage transition
        const validTransitions = {
            STARTED: ['DOCS_PENDING', 'LOST'],
            DOCS_PENDING: ['DOCS_RECEIVED', 'LOST'],
            DOCS_RECEIVED: ['CALL_SCHEDULED', 'LOST'],
            CALL_SCHEDULED: ['SANCTIONED', 'LOST'],
            SANCTIONED: ['DISBURSED', 'LOST'],
            DISBURSED: [],
            LOST: [],
        };
        if (!validTransitions[loan.loanStage].includes(input.newStage)) {
            const error = new Error(`Cannot transition from ${loan.loanStage} to ${input.newStage}`);
            error.statusCode = 400;
            error.code = 'INVALID_STAGE_TRANSITION';
            throw error;
        }
        // Update loan and create history
        const updated = await index_1.prisma.educationLoanApplication.update({
            where: { id: loanId },
            data: {
                loanStage: input.newStage,
                stageUpdatedAt: new Date(),
                completedAt: input.newStage === 'DISBURSED' ? new Date() : loan.completedAt,
                stageHistory: {
                    create: {
                        previousStage: loan.loanStage,
                        newStage: input.newStage,
                        transitionTimestamp: new Date(),
                        responsibleCounselorId: userId,
                        reason: input.reason,
                    },
                },
            },
            include: {
                lead: true,
                lenderApplications: true,
                documentRequests: true,
                stageHistory: {
                    orderBy: { transitionTimestamp: 'desc' },
                },
            },
        });
        return updated;
    }
    /**
     * DELETE: Soft-delete loan
     */
    static async deleteLoan(loanId, userId, userRole) {
        // Just verify access
        await this.getLoanById(loanId, userId, userRole);
        const archived = await index_1.prisma.educationLoanApplication.update({
            where: { id: loanId },
            data: { archivedAt: new Date() },
            include: {
                lead: true,
                lenderApplications: true,
                documentRequests: true,
                stageHistory: true,
            },
        });
        return archived;
    }
    // ─── Lender Management ─────────────────────────────────────────────────────
    /**
     * Add lender to loan
     */
    static async addLender(loanId, input, userId) {
        // Verify loan exists
        const loanCheck = await index_1.prisma.educationLoanApplication.findUnique({
            where: { id: loanId },
        });
        if (!loanCheck) {
            const error = new Error('Loan not found');
            error.statusCode = 404;
            error.code = 'LOAN_NOT_FOUND';
            throw error;
        }
        // Check if lender already added
        const existing = await index_1.prisma.lenderApplication.findFirst({
            where: { educationLoanId: loanId, lenderName: input.lenderName },
        });
        if (existing) {
            const error = new Error(`${input.lenderName} is already added to this loan`);
            error.statusCode = 409;
            error.code = 'LENDER_DUPLICATE';
            throw error;
        }
        const lender = await index_1.prisma.lenderApplication.create({
            data: {
                lenderCode: `LA-${Math.floor(Math.random() * 9000) + 1000}`,
                educationLoanId: loanId,
                lenderName: input.lenderName,
                matchScore: input.matchScore,
                recommendationSource: input.recommendationSource,
                lenderStatus: 'INTERESTED',
                statusUpdatedAt: new Date(),
                statusHistory: {
                    create: {
                        previousStatus: null,
                        newStatus: 'INTERESTED',
                        changedAt: new Date(),
                        changedBy: userId,
                    },
                },
            },
            include: {
                statusHistory: true,
            },
        });
        return lender;
    }
    /**
     * Get lenders for loan
     */
    static async getLendersForLoan(loanId, userId, userRole, filters) {
        await this.getLoanById(loanId, userId, userRole);
        const lenders = await index_1.prisma.lenderApplication.findMany({
            where: {
                educationLoanId: loanId,
                ...(filters?.status && { lenderStatus: filters.status }),
            },
            include: {
                statusHistory: {
                    orderBy: { changedAt: 'desc' },
                },
            },
            orderBy: { matchScore: 'desc' },
        });
        return lenders;
    }
    /**
     * Get specific lender
     */
    static async getLenderById(loanId, lenderId, userId, userRole) {
        await this.getLoanById(loanId, userId, userRole);
        const lender = await index_1.prisma.lenderApplication.findFirst({
            where: { id: lenderId, educationLoanId: loanId },
            include: {
                statusHistory: {
                    orderBy: { changedAt: 'desc' },
                },
            },
        });
        if (!lender) {
            const error = new Error('Lender application not found');
            error.statusCode = 404;
            error.code = 'LENDER_NOT_FOUND';
            throw error;
        }
        return lender;
    }
    /**
     * Update lender status
     */
    static async updateLenderStatus(loanId, lenderId, input, userId, userRole) {
        const lender = await this.getLenderById(loanId, lenderId, userId, userRole);
        // Validate status transition
        const validTransitions = {
            INTERESTED: ['APPLIED', 'WITHDRAWN'],
            APPLIED: ['UNDER_REVIEW', 'WITHDRAWN'],
            UNDER_REVIEW: ['APPROVED', 'REJECTED'],
            APPROVED: ['DISBURSED', 'WITHDRAWN'],
            REJECTED: [],
            DISBURSED: [],
            WITHDRAWN: [],
        };
        if (!validTransitions[lender.lenderStatus].includes(input.lenderStatus)) {
            const error = new Error(`Cannot transition lender from ${lender.lenderStatus} to ${input.lenderStatus}`);
            error.statusCode = 400;
            error.code = 'INVALID_LENDER_TRANSITION';
            throw error;
        }
        // Build update data
        const updateData = {
            lenderStatus: input.lenderStatus,
            statusUpdatedAt: new Date(),
            statusHistory: {
                create: {
                    previousStatus: lender.lenderStatus,
                    newStatus: input.lenderStatus,
                    changedAt: new Date(),
                    changedBy: userId,
                    reason: input.reason,
                },
            },
        };
        // Add approval details if transitioning to APPROVED
        if (input.lenderStatus === 'APPROVED') {
            updateData.sanctionAmount = input.sanctionAmount;
            updateData.roi = input.roi;
            updateData.processingFee = input.processingFee;
            updateData.sanctionDate = input.sanctionDate;
            updateData.sanctionValidity = input.sanctionValidity;
        }
        // Add disbursement details if transitioning to DISBURSED
        if (input.lenderStatus === 'DISBURSED') {
            updateData.disbursementAmount = input.disbursementAmount;
            updateData.disbursementDate = input.disbursementDate;
            updateData.tranchCount = input.tranchCount;
        }
        // Add rejection details if transitioning to REJECTED
        if (input.lenderStatus === 'REJECTED') {
            updateData.rejectionDate = new Date();
            updateData.rejectionReason = input.rejectionReason;
        }
        const updated = await index_1.prisma.lenderApplication.update({
            where: { id: lenderId },
            data: updateData,
            include: {
                statusHistory: {
                    orderBy: { changedAt: 'desc' },
                },
            },
        });
        return updated;
    }
    // ─── Document Management ──────────────────────────────────────────────────
    /**
     * Request documents for loan (auto-transitions to DOCS_PENDING)
     */
    static async requestDocuments(loanId, input, userId, userRole) {
        await this.getLoanById(loanId, userId, userRole);
        // Build document checklist based on categories
        const loanData = await index_1.prisma.educationLoanApplication.findUnique({
            where: { id: loanId },
        });
        if (!loanData) {
            const error = new Error('Loan not found');
            error.statusCode = 404;
            error.code = 'LOAN_NOT_FOUND';
            throw error;
        }
        const documents = this.generateDocumentChecklist(input.categories, loanData.collateralType);
        // Create document request
        const docRequest = await index_1.prisma.documentRequest.create({
            data: {
                docRequestCode: `DR-${Math.floor(Math.random() * 9000) + 1000}`,
                educationLoanId: loanId,
                categories: input.categories,
                sentDate: new Date(),
                deadline: input.deadline || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days default
                status: 'PENDING',
                documents: {
                    createMany: {
                        data: documents,
                    },
                },
            },
            include: {
                documents: true,
            },
        });
        // Auto-transition to DOCS_PENDING if not already
        if (loanData.loanStage === 'STARTED') {
            await this.updateLoanStage(loanId, { newStage: 'DOCS_PENDING', reason: 'Documents requested' }, userId, userRole);
        }
        return docRequest;
    }
    /**
     * Get document request details
     */
    static async getDocumentRequest(loanId, docRequestId, userId, userRole) {
        await this.getLoanById(loanId, userId, userRole);
        const docRequest = await index_1.prisma.documentRequest.findFirst({
            where: { id: docRequestId, educationLoanId: loanId },
            include: {
                documents: true,
            },
        });
        if (!docRequest) {
            const error = new Error('Document request not found');
            error.statusCode = 404;
            error.code = 'DOC_REQUEST_NOT_FOUND';
            throw error;
        }
        return docRequest;
    }
    /**
     * Approve document
     */
    static async approveDocument(loanId, docRequestId, documentId, userId, userRole) {
        await this.getDocumentRequest(loanId, docRequestId, userId, userRole);
        const document = await index_1.prisma.documentSubmission.findFirst({
            where: { id: documentId, documentRequestId: docRequestId },
        });
        if (!document) {
            const error = new Error('Document not found');
            error.statusCode = 404;
            error.code = 'DOCUMENT_NOT_FOUND';
            throw error;
        }
        const updated = await index_1.prisma.documentSubmission.update({
            where: { id: documentId },
            data: {
                status: 'APPROVED',
                approvedAt: new Date(),
            },
        });
        // Check if all documents are approved
        const allDocs = await index_1.prisma.documentSubmission.findMany({
            where: { documentRequestId: docRequestId },
        });
        const allApproved = allDocs.every((doc) => doc.status === 'APPROVED' || !doc.required);
        // Update request status if all approved
        if (allApproved) {
            await index_1.prisma.documentRequest.update({
                where: { id: docRequestId },
                data: {
                    status: 'COMPLETED',
                    completedAt: new Date(),
                },
            });
            // Auto-transition loan to DOCS_RECEIVED
            const loan = await index_1.prisma.educationLoanApplication.findUnique({
                where: { id: loanId },
            });
            if (loan && loan.loanStage === 'DOCS_PENDING') {
                await this.updateLoanStage(loanId, { newStage: 'DOCS_RECEIVED', reason: 'All documents received and approved' }, userId, userRole);
            }
        }
        return updated;
    }
    /**
     * Reject document
     */
    static async rejectDocument(loanId, docRequestId, documentId, reason, userId, userRole) {
        await this.getDocumentRequest(loanId, docRequestId, userId, userRole);
        const document = await index_1.prisma.documentSubmission.findFirst({
            where: { id: documentId, documentRequestId: docRequestId },
        });
        if (!document) {
            const error = new Error('Document not found');
            error.statusCode = 404;
            error.code = 'DOCUMENT_NOT_FOUND';
            throw error;
        }
        const updated = await index_1.prisma.documentSubmission.update({
            where: { id: documentId },
            data: {
                status: 'REJECTED',
                rejectedAt: new Date(),
                rejectionReason: reason,
            },
        });
        // Update request status to PARTIAL_RECEIVED
        await index_1.prisma.documentRequest.update({
            where: { id: docRequestId },
            data: {
                status: 'PARTIAL_RECEIVED',
            },
        });
        return updated;
    }
    /**
     * Generate document checklist based on categories and collateral type
     */
    static generateDocumentChecklist(categories, collateralType) {
        const documents = [];
        const docCodes = {
            KYC: [
                { name: 'PAN Card', category: 'KYC', required: true },
                { name: 'Aadhar Card', category: 'KYC', required: true },
                { name: 'Passport', category: 'KYC', required: false },
                { name: 'Student Photo', category: 'KYC', required: true },
            ],
            ACADEMICS: [
                { name: '10th Scorecard', category: 'ACADEMICS', required: true },
                { name: '12th Scorecard', category: 'ACADEMICS', required: true },
                { name: 'Admission Letter', category: 'ACADEMICS', required: true },
                { name: 'University Details', category: 'ACADEMICS', required: true },
            ],
            FINANCIALS: [
                { name: 'Salary Slips (3 months)', category: 'FINANCIALS', required: true },
                { name: 'Bank Statements (6 months)', category: 'FINANCIALS', required: true },
                { name: 'Income Tax Returns', category: 'FINANCIALS', required: false },
            ],
            COLLATERAL: [
                { name: 'Property Documents', category: 'COLLATERAL', required: collateralType === 'SECURED' },
                { name: 'Vehicle Registration', category: 'COLLATERAL', required: false },
                { name: 'Jewelry Certificate', category: 'COLLATERAL', required: false },
            ],
        };
        for (const category of categories) {
            const categoryDocs = docCodes[category] || [];
            for (const doc of categoryDocs) {
                documents.push({
                    docSubmissionCode: `DS-${Math.floor(Math.random() * 9000) + 1000}`,
                    name: doc.name,
                    category: doc.category,
                    documentType: doc.name.toLowerCase().replace(/\s+/g, '_'),
                    required: doc.required,
                    status: 'NOT_STARTED',
                    submissionMethod: 'UPLOAD',
                });
            }
        }
        return documents;
    }
    /**
     * Get loan statistics for dashboard
     */
    static async getLoanStats(userId, userRole) {
        const whereClause = { archivedAt: null };
        if (userRole === 'COUNSELOR') {
            whereClause.OR = [{ counselorZrmId: userId }];
        }
        const stats = await Promise.all([
            index_1.prisma.educationLoanApplication.count({ where: whereClause }),
            index_1.prisma.educationLoanApplication.groupBy({
                by: ['loanStage'],
                where: whereClause,
                _count: true,
            }),
            index_1.prisma.lenderApplication.groupBy({
                by: ['lenderStatus'],
                where: { educationLoan: { archivedAt: null } },
                _count: true,
            }),
        ]);
        const stageBreakdown = stats[1].reduce((acc, item) => {
            acc[item.loanStage] = item._count;
            return acc;
        }, {});
        const lenderStatusBreakdown = stats[2].reduce((acc, item) => {
            acc[item.lenderStatus] = item._count;
            return acc;
        }, {});
        return {
            totalLoans: stats[0],
            byStage: stageBreakdown,
            lenderStatusBreakdown,
        };
    }
}
exports.EducationLoanService = EducationLoanService;
//# sourceMappingURL=education-loan.service.js.map