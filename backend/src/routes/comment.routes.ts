import { Router, Response, NextFunction } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { CommentService } from '../services/comment.service';
import { createCommentSchema, updateCommentSchema, searchCommentsSchema } from '../schemas/comment.schema';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Apply auth middleware to all comment routes
router.use(authMiddleware);

/**
 * POST /api/leads/:leadId/comments
 * Create a new comment on a lead
 */
router.post(
  '/:leadId/comments',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { leadId } = req.params;
      const validatedData = createCommentSchema.parse(req.body);

      const comment = await CommentService.create(
        leadId,
        validatedData,
        req.user!.id,
        req.user!.name,
        req.user!.role
      );

      res.status(201).json({
        success: true,
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/leads/:leadId/comments
 * List comments for a lead (paginated, reverse chronological)
 */
router.get(
  '/:leadId/comments',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { leadId } = req.params;
      const { limit, cursor } = req.query;

      const result = await CommentService.listByLead(leadId, {
        limit: limit ? parseInt(limit as string) : 20,
        cursor: cursor as string,
      });

      res.json({
        success: true,
        data: {
          comments: result.comments,
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
 * GET /api/comments/:commentId
 * Get a single comment
 */
router.get(
  '/comment/:commentId',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { commentId } = req.params;
      const comment = await CommentService.getById(commentId);

      if (!comment) {
        const error = new Error('Comment not found') as AppError;
        error.statusCode = 404;
        error.code = 'COMMENT_NOT_FOUND';
        throw error;
      }

      res.json({
        success: true,
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/comments/:commentId
 * Update a comment (edit text)
 */
router.put(
  '/:commentId',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { commentId } = req.params;
      const validatedData = updateCommentSchema.parse(req.body);

      const comment = await CommentService.update(
        commentId,
        validatedData.content,
        req.user!.id,
        req.user!.name,
        req.user!.role
      );

      res.json({
        success: true,
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/comments/:commentId
 * Delete a comment (soft delete)
 */
router.delete(
  '/:commentId',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { commentId } = req.params;

      await CommentService.delete(
        commentId,
        req.user!.id,
        req.user!.name,
        req.user!.role
      );

      res.json({
        success: true,
        data: { message: 'Comment deleted successfully' },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/comments/search
 * Search comments
 */
router.get(
  '/search',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { q, authorId, startDate, endDate, limit } = req.query;

      const validatedQuery = searchCommentsSchema.parse({
        q,
        authorId,
        startDate,
        endDate,
        limit,
      });

      const results = await CommentService.search(validatedQuery.q, {
        authorId: validatedQuery.authorId,
        startDate: validatedQuery.startDate ? new Date(validatedQuery.startDate) : undefined,
        endDate: validatedQuery.endDate ? new Date(validatedQuery.endDate) : undefined,
        limit: validatedQuery.limit,
      });

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
