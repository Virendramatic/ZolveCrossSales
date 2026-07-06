import { Router, Response, NextFunction } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { createLeadSchema, listLeadsSchema, updateLeadSchema, callStatusSchema, rescheduleSchema } from '../schemas/lead.schema';
import { LeadService } from '../services/lead.service';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Apply auth middleware to all lead routes
router.use(authMiddleware);

/**
 * POST /api/leads
 * Create a new lead
 */
router.post(
  '/',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate input
      const validatedData = createLeadSchema.parse(req.body);

      // Create the lead
      const lead = await LeadService.create(validatedData, req.user!.id);

      res.status(201).json({
        success: true,
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/leads
 * List all leads with filtering and cursor-based pagination
 */
router.get(
  '/',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate query parameters
      const validatedQuery = listLeadsSchema.parse(req.query);

      // List leads
      const result = await LeadService.list({
        userId: req.user!.id,
        userRole: req.user!.role,
        callStatus: validatedQuery.callStatus,
        status: validatedQuery.status,
        country: validatedQuery.country,
        intake: validatedQuery.intake,
        limit: validatedQuery.limit,
        cursor: validatedQuery.cursor,
        sortBy: validatedQuery.sortBy,
      });

      res.json({
        success: true,
        data: {
          leads: result.leads,
          nextCursor: result.nextCursor,
          hasMore: result.hasMore,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/leads/:id
 * Get a specific lead by ID with all relationships
 */
router.get(
  '/:id',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      // Get the lead
      const lead = await LeadService.getById(id, req.user!.id, req.user!.role);

      // Lead not found
      if (!lead) {
        const error = new Error('Lead not found') as AppError;
        error.statusCode = 404;
        error.code = 'LEAD_NOT_FOUND';
        throw error;
      }

      res.json({
        success: true,
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/leads/:id
 * Update a lead
 */
router.put(
  '/:id',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      // Validate input
      const validatedData = updateLeadSchema.parse(req.body);

      // Update the lead
      const lead = await LeadService.update(id, validatedData, req.user!.id, req.user!.role);

      res.json({
        success: true,
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/leads/:id
 * Soft delete a lead (archive it)
 */
router.delete(
  '/:id',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      // Delete the lead
      await LeadService.delete(id, req.user!.id, req.user!.role);

      res.json({
        success: true,
        data: { message: 'Lead archived successfully' },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/leads/:id/call-status
 * Update the global call status of a lead
 */
router.put(
  '/:id/call-status',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      // Validate input
      const validatedData = callStatusSchema.parse(req.body);

      // Update call status
      const lead = await LeadService.updateCallStatus(id, validatedData.globalCallStatus, req.user!.id, req.user!.role);

      res.json({
        success: true,
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/leads/:id/reschedule
 * Set or update the reschedule date for a lead
 */
router.put(
  '/:id/reschedule',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      // Validate input
      const validatedData = rescheduleSchema.parse(req.body);

      // Update reschedule date
      const lead = await LeadService.setRescheduleDate(id, validatedData.rescheduleDate, req.user!.id, req.user!.role);

      res.json({
        success: true,
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
