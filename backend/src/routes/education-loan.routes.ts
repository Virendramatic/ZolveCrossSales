import { Router, Response, NextFunction } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { EducationLoanService } from '../services/education-loan.service';
import { MatcherService } from '../services/matcher.service';
import {
  createEducationLoanSchema,
  updateEducationLoanSchema,
  updateLoanStageSchema,
  addLenderSchema,
  updateLenderStatusSchema,
  requestDocumentsSchema,
  listLoansFilterSchema,
  listLendersFilterSchema,
} from '../schemas/education-loan.schema';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// ─── Loan CRUD Operations ─────────────────────────────────────────────────────

/**
 * POST /api/loans
 * Create new education loan application
 */
router.post('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { leadId, ...loanData } = req.body;
    const validatedData = createEducationLoanSchema.parse(loanData);

    const loan = await EducationLoanService.createLoan(
      leadId,
      validatedData,
      req.user!.id,
      req.user!.role
    );

    res.status(201).json({
      success: true,
      data: loan,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/loans/:loanId
 * Get loan details with all relationships
 */
router.get('/:loanId', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { loanId } = req.params;

    const loan = await EducationLoanService.getLoanById(loanId, req.user!.id, req.user!.role);

    res.json({
      success: true,
      data: loan,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/loans
 * List loans with filtering and pagination
 */
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filters = listLoansFilterSchema.parse(req.query);

    const result = await EducationLoanService.listLoans(req.user!.id, req.user!.role, filters);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/loans/:loanId
 * Update loan details (only in STARTED stage)
 */
router.put('/:loanId', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { loanId } = req.params;
    const validatedData = updateEducationLoanSchema.parse(req.body);

    const loan = await EducationLoanService.updateLoanDetails(
      loanId,
      validatedData,
      req.user!.id,
      req.user!.role
    );

    res.json({
      success: true,
      data: loan,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/loans/:loanId
 * Soft-delete loan
 */
router.delete('/:loanId', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { loanId } = req.params;

    const loan = await EducationLoanService.deleteLoan(loanId, req.user!.id, req.user!.role);

    res.json({
      success: true,
      data: loan,
      message: 'Loan archived successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ─── Loan Stage Management ────────────────────────────────────────────────────

/**
 * PUT /api/loans/:loanId/stage
 * Update loan stage with validation
 */
router.put('/:loanId/stage', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { loanId } = req.params;
    const validatedData = updateLoanStageSchema.parse(req.body);

    const loan = await EducationLoanService.updateLoanStage(
      loanId,
      validatedData,
      req.user!.id,
      req.user!.role
    );

    res.json({
      success: true,
      data: loan,
      message: `Loan transitioned to ${validatedData.newStage}`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/loans/:loanId/stage-history
 * Get loan stage progression history
 */
router.get('/:loanId/stage-history', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { loanId } = req.params;

    const loan = await EducationLoanService.getLoanById(loanId, req.user!.id, req.user!.role);

    // stageHistory is included in the getLoanById call
    const stageHistory = (loan as any).stageHistory || [];
    res.json({
      success: true,
      data: stageHistory,
    });
  } catch (error) {
    next(error);
  }
});

// ─── Lender Management ────────────────────────────────────────────────────────

/**
 * POST /api/loans/:loanId/lenders
 * Add lender to loan
 */
router.post('/:loanId/lenders', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { loanId } = req.params;
    const validatedData = addLenderSchema.parse(req.body);

    const lender = await EducationLoanService.addLender(
      loanId,
      validatedData,
      req.user!.id
    );

    res.status(201).json({
      success: true,
      data: lender,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/loans/:loanId/lenders
 * Get all lenders for loan
 */
router.get('/:loanId/lenders', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { loanId } = req.params;
    const filters = listLendersFilterSchema.parse(req.query);

    const lenders = await EducationLoanService.getLendersForLoan(
      loanId,
      req.user!.id,
      req.user!.role,
      filters
    );

    res.json({
      success: true,
      data: lenders,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/loans/:loanId/lenders/:lenderId
 * Get specific lender details
 */
router.get('/:loanId/lenders/:lenderId', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { loanId, lenderId } = req.params;

    const lender = await EducationLoanService.getLenderById(
      loanId,
      lenderId,
      req.user!.id,
      req.user!.role
    );

    res.json({
      success: true,
      data: lender,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/loans/:loanId/lenders/:lenderId
 * Update lender status
 */
router.put('/:loanId/lenders/:lenderId', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { loanId, lenderId } = req.params;
    const validatedData = updateLenderStatusSchema.parse(req.body);

    const lender = await EducationLoanService.updateLenderStatus(
      loanId,
      lenderId,
      validatedData,
      req.user!.id,
      req.user!.role
    );

    res.json({
      success: true,
      data: lender,
      message: `Lender status updated to ${validatedData.lenderStatus}`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/loans/:loanId/lenders/:lenderId
 * Remove lender from loan
 */
router.delete('/:loanId/lenders/:lenderId', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { loanId, lenderId } = req.params;

    const lender = await EducationLoanService.getLenderById(
      loanId,
      lenderId,
      req.user!.id,
      req.user!.role
    );

    // Can only remove if not applied or rejected
    if (!['INTERESTED', 'WITHDRAWN'].includes(lender.lenderStatus)) {
      const error = new Error('Can only remove lenders that are INTERESTED or WITHDRAWN') as AppError;
      error.statusCode = 400;
      error.code = 'INVALID_LENDER_STATE_FOR_REMOVAL';
      throw error;
    }

    // Soft-delete by withdrawing
    const updated = await EducationLoanService.updateLenderStatus(
      loanId,
      lenderId,
      { lenderStatus: 'WITHDRAWN', reason: 'Removed by counselor' },
      req.user!.id,
      req.user!.role
    );

    res.json({
      success: true,
      data: updated,
      message: 'Lender removed successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ─── Document Management ──────────────────────────────────────────────────────

/**
 * POST /api/loans/:loanId/document-request
 * Create document request
 */
router.post('/:loanId/document-request', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { loanId } = req.params;
    const validatedData = requestDocumentsSchema.parse(req.body);

    const docRequest = await EducationLoanService.requestDocuments(
      loanId,
      validatedData,
      req.user!.id,
      req.user!.role
    );

    res.status(201).json({
      success: true,
      data: docRequest,
      message: 'Document request created and loan transitioned to DOCS_PENDING',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/loans/:loanId/document-request/:docRequestId
 * Get document request details
 */
router.get('/:loanId/document-request/:docRequestId', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { loanId, docRequestId } = req.params;

    const docRequest = await EducationLoanService.getDocumentRequest(
      loanId,
      docRequestId,
      req.user!.id,
      req.user!.role
    );

    res.json({
      success: true,
      data: docRequest,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/loans/:loanId/document-request/:docRequestId/documents/:documentId/approve
 * Approve document
 */
router.put('/:loanId/document-request/:docRequestId/documents/:documentId/approve', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { loanId, docRequestId, documentId } = req.params;

    const document = await EducationLoanService.approveDocument(
      loanId,
      docRequestId,
      documentId,
      req.user!.id,
      req.user!.role
    );

    res.json({
      success: true,
      data: document,
      message: 'Document approved',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/loans/:loanId/document-request/:docRequestId/documents/:documentId/reject
 * Reject document
 */
router.put('/:loanId/document-request/:docRequestId/documents/:documentId/reject', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { loanId, docRequestId, documentId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      const error = new Error('Rejection reason is required') as AppError;
      error.statusCode = 400;
      error.code = 'MISSING_REJECTION_REASON';
      throw error;
    }

    const document = await EducationLoanService.rejectDocument(
      loanId,
      docRequestId,
      documentId,
      reason,
      req.user!.id,
      req.user!.role
    );

    res.json({
      success: true,
      data: document,
      message: 'Document rejected',
    });
  } catch (error) {
    next(error);
  }
});

// ─── Statistics ───────────────────────────────────────────────────────────────

/**
 * GET /api/loans/stats
 * Get loan statistics for dashboard
 */
router.get('/stats', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await EducationLoanService.getLoanStats(req.user!.id, req.user!.role);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

// ─── Lender Matching ──────────────────────────────────────────────────────────

/**
 * POST /api/loans/:loanId/match
 * Get lender recommendations and auto-create applications
 */
router.post('/:loanId/match', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { loanId } = req.params;

    // Get recommendations from matcher
    const recommendations = await MatcherService.generateRecommendations(
      loanId,
      req.user!.id,
      req.user!.role
    );

    // Auto-create lender applications for recommended lenders
    const createdLenders = [];
    for (const rec of recommendations.slice(0, 5)) {
      // Create top 5 recommendations
      try {
        const lender = await EducationLoanService.addLender(
          loanId,
          {
            lenderName: rec.lenderName,
            matchScore: rec.matchScore,
            recommendationSource: 'SYSTEM_MATCH',
          },
          req.user!.id
        );
        createdLenders.push(lender);
      } catch (err) {
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
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/loans/:loanId/match
 * Get lender recommendations without creating applications
 */
router.get('/:loanId/match', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { loanId } = req.params;

    const recommendations = await MatcherService.generateRecommendations(
      loanId,
      req.user!.id,
      req.user!.role
    );

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/loans/:loanId/match/rerun
 * Re-run matcher and update recommendations
 */
router.post('/:loanId/match/rerun', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { loanId } = req.params;

    const recommendations = await MatcherService.generateRecommendations(
      loanId,
      req.user!.id,
      req.user!.role
    );

    res.json({
      success: true,
      data: {
        message: 'Matcher re-run complete',
        recommendations,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
