import express, { Response, NextFunction } from 'express';
import { DocumentService } from '../services/document.service';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { DocumentUploadSchema, DocumentApprovalSchema, DocumentRejectionSchema } from '../schemas/document.schema';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * POST /api/loans/:loanId/documents
 * Upload a document for a loan
 */
router.post(
  '/loans/:loanId/documents',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { loanId } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      // Validate input
      const input = DocumentUploadSchema.parse(req.body);

      // Upload document
      const result = await DocumentService.uploadDocument(loanId, input, userId, userRole);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/loans/:loanId/documents/:documentRequestId
 * Get document status and submission details
 */
router.get(
  '/loans/:loanId/documents/:documentRequestId',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { loanId, documentRequestId } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      const result = await DocumentService.getDocumentStatus(
        loanId,
        documentRequestId,
        userId,
        userRole
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/loans/:loanId/documents/:documentId/versions
 * Get document version history
 */
router.get(
  '/loans/:loanId/documents/:documentId/versions',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { loanId, documentId } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      const versions = await DocumentService.getDocumentVersions(
        loanId,
        documentId,
        userId,
        userRole
      );

      res.status(200).json({
        success: true,
        data: versions,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/loans/:loanId/documents/:documentId/approve
 * Approve a document submission
 */
router.put(
  '/loans/:loanId/documents/:documentId/approve',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Only admins can approve documents
      if (req.user!.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Only admins can approve documents',
          },
        });
        return;
      }

      const { loanId, documentId } = req.params;
      const documentRequestId = req.body.documentRequestId;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      // Validate input
      const input = DocumentApprovalSchema.parse(req.body);

      if (!documentRequestId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Document request ID required',
          },
        });
        return;
      }

      const result = await DocumentService.approveDocument(
        loanId,
        documentRequestId,
        documentId,
        input,
        userId,
        userRole
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/loans/:loanId/documents/:documentId/reject
 * Reject a document submission
 */
router.put(
  '/loans/:loanId/documents/:documentId/reject',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Only admins can reject documents
      if (req.user!.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Only admins can reject documents',
          },
        });
        return;
      }

      const { loanId, documentId } = req.params;
      const documentRequestId = req.body.documentRequestId;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      // Validate input
      const input = DocumentRejectionSchema.parse(req.body);

      if (!documentRequestId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Document request ID required',
          },
        });
        return;
      }

      const result = await DocumentService.rejectDocument(
        loanId,
        documentRequestId,
        documentId,
        input,
        userId,
        userRole
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
