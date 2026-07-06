import { Router, Response, NextFunction } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { BulkService } from '../services/bulk.service';
import { bulkAssignSchema } from '../schemas/bulk.schema';
import { AppError } from '../middleware/errorHandler';
import multer from 'multer';

const router = Router();

// Apply auth middleware to all bulk routes
router.use(authMiddleware);

// File upload middleware
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

/**
 * POST /api/leads/bulk-import
 * Import leads from CSV file
 */
router.post(
  '/bulk-import',
  upload.single('file'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check if file is provided
      if (!req.file) {
        const error = new Error('No file uploaded') as AppError;
        error.statusCode = 400;
        error.code = 'NO_FILE';
        throw error;
      }

      // Only ADMIN can bulk import
      if (req.user!.role !== 'ADMIN') {
        const error = new Error('Only admins can perform bulk imports') as AppError;
        error.statusCode = 403;
        error.code = 'FORBIDDEN';
        throw error;
      }

      // Convert buffer to string
      const csvData = req.file.buffer.toString('utf-8');

      // Perform import
      const result = await BulkService.importLeads(
        csvData,
        req.user!.id,
        req.user!.name
      );

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
 * POST /api/leads/bulk-assign
 * Assign multiple leads to a counselor
 */
router.post(
  '/bulk-assign',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Only ADMIN can bulk assign
      if (req.user!.role !== 'ADMIN') {
        const error = new Error('Only admins can perform bulk assignments') as AppError;
        error.statusCode = 403;
        error.code = 'FORBIDDEN';
        throw error;
      }

      const validatedData = bulkAssignSchema.parse(req.body);

      const result = await BulkService.assignLeads(
        validatedData.leadIds,
        validatedData.targetCounselorId,
        req.user!.id,
        req.user!.name
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/leads/bulk/stats
 * Get bulk operation statistics
 */
router.get(
  '/stats',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await BulkService.getStats(req.user!.id, req.user!.role);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
