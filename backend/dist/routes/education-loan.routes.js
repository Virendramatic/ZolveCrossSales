"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const education_loan_service_1 = require("../services/education-loan.service");
const matcher_service_1 = require("../services/matcher.service");
const education_loan_schema_1 = require("../schemas/education-loan.schema");
const router = (0, express_1.Router)();
// Apply auth middleware to all routes
router.use(auth_1.authMiddleware);
// ─── Loan CRUD Operations ─────────────────────────────────────────────────────
/**
 * POST /api/loans
 * Create new education loan application
 */
router.post('/', async (req, res, next) => {
    try {
        const { leadId, ...loanData } = req.body;
        const validatedData = education_loan_schema_1.createEducationLoanSchema.parse(loanData);
        const loan = await education_loan_service_1.EducationLoanService.createLoan(leadId, validatedData, req.user.id, req.user.role);
        res.status(201).json({
            success: true,
            data: loan,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/loans/:loanId
 * Get loan details with all relationships
 */
router.get('/:loanId', async (req, res, next) => {
    try {
        const { loanId } = req.params;
        const loan = await education_loan_service_1.EducationLoanService.getLoanById(loanId, req.user.id, req.user.role);
        res.json({
            success: true,
            data: loan,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/loans
 * List loans with filtering and pagination
 */
router.get('/', async (req, res, next) => {
    try {
        const filters = education_loan_schema_1.listLoansFilterSchema.parse(req.query);
        const result = await education_loan_service_1.EducationLoanService.listLoans(req.user.id, req.user.role, filters);
        res.json({
            success: true,
            data: result.data,
            pagination: {
                total: result.total,
                limit: result.limit,
                offset: result.offset,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * PUT /api/loans/:loanId
 * Update loan details (only in STARTED stage)
 */
router.put('/:loanId', async (req, res, next) => {
    try {
        const { loanId } = req.params;
        const validatedData = education_loan_schema_1.updateEducationLoanSchema.parse(req.body);
        const loan = await education_loan_service_1.EducationLoanService.updateLoanDetails(loanId, validatedData, req.user.id, req.user.role);
        res.json({
            success: true,
            data: loan,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * DELETE /api/loans/:loanId
 * Soft-delete loan
 */
router.delete('/:loanId', async (req, res, next) => {
    try {
        const { loanId } = req.params;
        const loan = await education_loan_service_1.EducationLoanService.deleteLoan(loanId, req.user.id, req.user.role);
        res.json({
            success: true,
            data: loan,
            message: 'Loan archived successfully',
        });
    }
    catch (error) {
        next(error);
    }
});
// ─── Loan Stage Management ────────────────────────────────────────────────────
/**
 * PUT /api/loans/:loanId/stage
 * Update loan stage with validation
 */
router.put('/:loanId/stage', async (req, res, next) => {
    try {
        const { loanId } = req.params;
        const validatedData = education_loan_schema_1.updateLoanStageSchema.parse(req.body);
        const loan = await education_loan_service_1.EducationLoanService.updateLoanStage(loanId, validatedData, req.user.id, req.user.role);
        res.json({
            success: true,
            data: loan,
            message: `Loan transitioned to ${validatedData.newStage}`,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/loans/:loanId/stage-history
 * Get loan stage progression history
 */
router.get('/:loanId/stage-history', async (req, res, next) => {
    try {
        const { loanId } = req.params;
        const loan = await education_loan_service_1.EducationLoanService.getLoanById(loanId, req.user.id, req.user.role);
        // stageHistory is included in the getLoanById call
        const stageHistory = loan.stageHistory || [];
        res.json({
            success: true,
            data: stageHistory,
        });
    }
    catch (error) {
        next(error);
    }
});
// ─── Lender Management ────────────────────────────────────────────────────────
/**
 * POST /api/loans/:loanId/lenders
 * Add lender to loan
 */
router.post('/:loanId/lenders', async (req, res, next) => {
    try {
        const { loanId } = req.params;
        const validatedData = education_loan_schema_1.addLenderSchema.parse(req.body);
        const lender = await education_loan_service_1.EducationLoanService.addLender(loanId, validatedData, req.user.id);
        res.status(201).json({
            success: true,
            data: lender,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/loans/:loanId/lenders
 * Get all lenders for loan
 */
router.get('/:loanId/lenders', async (req, res, next) => {
    try {
        const { loanId } = req.params;
        const filters = education_loan_schema_1.listLendersFilterSchema.parse(req.query);
        const lenders = await education_loan_service_1.EducationLoanService.getLendersForLoan(loanId, req.user.id, req.user.role, filters);
        res.json({
            success: true,
            data: lenders,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/loans/:loanId/lenders/:lenderId
 * Get specific lender details
 */
router.get('/:loanId/lenders/:lenderId', async (req, res, next) => {
    try {
        const { loanId, lenderId } = req.params;
        const lender = await education_loan_service_1.EducationLoanService.getLenderById(loanId, lenderId, req.user.id, req.user.role);
        res.json({
            success: true,
            data: lender,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * PUT /api/loans/:loanId/lenders/:lenderId
 * Update lender status
 */
router.put('/:loanId/lenders/:lenderId', async (req, res, next) => {
    try {
        const { loanId, lenderId } = req.params;
        const validatedData = education_loan_schema_1.updateLenderStatusSchema.parse(req.body);
        const lender = await education_loan_service_1.EducationLoanService.updateLenderStatus(loanId, lenderId, validatedData, req.user.id, req.user.role);
        res.json({
            success: true,
            data: lender,
            message: `Lender status updated to ${validatedData.lenderStatus}`,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * DELETE /api/loans/:loanId/lenders/:lenderId
 * Remove lender from loan
 */
router.delete('/:loanId/lenders/:lenderId', async (req, res, next) => {
    try {
        const { loanId, lenderId } = req.params;
        const lender = await education_loan_service_1.EducationLoanService.getLenderById(loanId, lenderId, req.user.id, req.user.role);
        // Can only remove if not applied or rejected
        if (!['INTERESTED', 'WITHDRAWN'].includes(lender.lenderStatus)) {
            const error = new Error('Can only remove lenders that are INTERESTED or WITHDRAWN');
            error.statusCode = 400;
            error.code = 'INVALID_LENDER_STATE_FOR_REMOVAL';
            throw error;
        }
        // Soft-delete by withdrawing
        const updated = await education_loan_service_1.EducationLoanService.updateLenderStatus(loanId, lenderId, { lenderStatus: 'WITHDRAWN', reason: 'Removed by counselor' }, req.user.id, req.user.role);
        res.json({
            success: true,
            data: updated,
            message: 'Lender removed successfully',
        });
    }
    catch (error) {
        next(error);
    }
});
// ─── Document Management ──────────────────────────────────────────────────────
/**
 * POST /api/loans/:loanId/document-request
 * Create document request
 */
router.post('/:loanId/document-request', async (req, res, next) => {
    try {
        const { loanId } = req.params;
        const validatedData = education_loan_schema_1.requestDocumentsSchema.parse(req.body);
        const docRequest = await education_loan_service_1.EducationLoanService.requestDocuments(loanId, validatedData, req.user.id, req.user.role);
        res.status(201).json({
            success: true,
            data: docRequest,
            message: 'Document request created and loan transitioned to DOCS_PENDING',
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/loans/:loanId/document-request/:docRequestId
 * Get document request details
 */
router.get('/:loanId/document-request/:docRequestId', async (req, res, next) => {
    try {
        const { loanId, docRequestId } = req.params;
        const docRequest = await education_loan_service_1.EducationLoanService.getDocumentRequest(loanId, docRequestId, req.user.id, req.user.role);
        res.json({
            success: true,
            data: docRequest,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * PUT /api/loans/:loanId/document-request/:docRequestId/documents/:documentId/approve
 * Approve document
 */
router.put('/:loanId/document-request/:docRequestId/documents/:documentId/approve', async (req, res, next) => {
    try {
        const { loanId, docRequestId, documentId } = req.params;
        const document = await education_loan_service_1.EducationLoanService.approveDocument(loanId, docRequestId, documentId, req.user.id, req.user.role);
        res.json({
            success: true,
            data: document,
            message: 'Document approved',
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * PUT /api/loans/:loanId/document-request/:docRequestId/documents/:documentId/reject
 * Reject document
 */
router.put('/:loanId/document-request/:docRequestId/documents/:documentId/reject', async (req, res, next) => {
    try {
        const { loanId, docRequestId, documentId } = req.params;
        const { reason } = req.body;
        if (!reason) {
            const error = new Error('Rejection reason is required');
            error.statusCode = 400;
            error.code = 'MISSING_REJECTION_REASON';
            throw error;
        }
        const document = await education_loan_service_1.EducationLoanService.rejectDocument(loanId, docRequestId, documentId, reason, req.user.id, req.user.role);
        res.json({
            success: true,
            data: document,
            message: 'Document rejected',
        });
    }
    catch (error) {
        next(error);
    }
});
// ─── Statistics ───────────────────────────────────────────────────────────────
/**
 * GET /api/loans/stats
 * Get loan statistics for dashboard
 */
router.get('/stats', async (req, res, next) => {
    try {
        const stats = await education_loan_service_1.EducationLoanService.getLoanStats(req.user.id, req.user.role);
        res.json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        next(error);
    }
});
// ─── Lender Matching ──────────────────────────────────────────────────────────
/**
 * POST /api/loans/:loanId/match
 * Get lender recommendations and auto-create applications
 */
router.post('/:loanId/match', async (req, res, next) => {
    try {
        const { loanId } = req.params;
        // Get recommendations from matcher
        const recommendations = await matcher_service_1.MatcherService.generateRecommendations(loanId, req.user.id, req.user.role);
        // Auto-create lender applications for recommended lenders
        const createdLenders = [];
        for (const rec of recommendations.slice(0, 5)) {
            // Create top 5 recommendations
            try {
                const lender = await education_loan_service_1.EducationLoanService.addLender(loanId, {
                    lenderName: rec.lenderName,
                    matchScore: rec.matchScore,
                    recommendationSource: 'SYSTEM_MATCH',
                }, req.user.id);
                createdLenders.push(lender);
            }
            catch (err) {
                // Skip if lender already exists
            }
        }
        res.status(201).json({
            success: true,
            data: {
                recommendations,
                createdLenders,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/loans/:loanId/match
 * Get lender recommendations without creating applications
 */
router.get('/:loanId/match', async (req, res, next) => {
    try {
        const { loanId } = req.params;
        const recommendations = await matcher_service_1.MatcherService.generateRecommendations(loanId, req.user.id, req.user.role);
        res.json({
            success: true,
            data: recommendations,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/loans/:loanId/match/rerun
 * Re-run matcher and update recommendations
 */
router.post('/:loanId/match/rerun', async (req, res, next) => {
    try {
        const { loanId } = req.params;
        const recommendations = await matcher_service_1.MatcherService.generateRecommendations(loanId, req.user.id, req.user.role);
        res.json({
            success: true,
            data: {
                message: 'Matcher re-run complete',
                recommendations,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=education-loan.routes.js.map