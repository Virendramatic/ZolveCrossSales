"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const comment_service_1 = require("../services/comment.service");
const comment_schema_1 = require("../schemas/comment.schema");
const router = (0, express_1.Router)();
// Apply auth middleware to all comment routes
router.use(auth_1.authMiddleware);
/**
 * POST /api/leads/:leadId/comments
 * Create a new comment on a lead
 */
router.post('/:leadId/comments', async (req, res, next) => {
    try {
        const { leadId } = req.params;
        const validatedData = comment_schema_1.createCommentSchema.parse(req.body);
        const comment = await comment_service_1.CommentService.create(leadId, validatedData, req.user.id, req.user.name, req.user.role);
        res.status(201).json({
            success: true,
            data: comment,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/leads/:leadId/comments
 * List comments for a lead (paginated, reverse chronological)
 */
router.get('/:leadId/comments', async (req, res, next) => {
    try {
        const { leadId } = req.params;
        const { limit, cursor } = req.query;
        const result = await comment_service_1.CommentService.listByLead(leadId, {
            limit: limit ? parseInt(limit) : 20,
            cursor: cursor,
        });
        res.json({
            success: true,
            data: {
                comments: result.comments,
                nextCursor: result.nextCursor,
                hasMore: result.hasMore,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/comments/:commentId
 * Get a single comment
 */
router.get('/comment/:commentId', async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const comment = await comment_service_1.CommentService.getById(commentId);
        if (!comment) {
            const error = new Error('Comment not found');
            error.statusCode = 404;
            error.code = 'COMMENT_NOT_FOUND';
            throw error;
        }
        res.json({
            success: true,
            data: comment,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * PUT /api/comments/:commentId
 * Update a comment (edit text)
 */
router.put('/:commentId', async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const validatedData = comment_schema_1.updateCommentSchema.parse(req.body);
        const comment = await comment_service_1.CommentService.update(commentId, validatedData.content, req.user.id, req.user.name, req.user.role);
        res.json({
            success: true,
            data: comment,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * DELETE /api/comments/:commentId
 * Delete a comment (soft delete)
 */
router.delete('/:commentId', async (req, res, next) => {
    try {
        const { commentId } = req.params;
        await comment_service_1.CommentService.delete(commentId, req.user.id, req.user.name, req.user.role);
        res.json({
            success: true,
            data: { message: 'Comment deleted successfully' },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/comments/search
 * Search comments
 */
router.get('/search', async (req, res, next) => {
    try {
        const { q, authorId, startDate, endDate, limit } = req.query;
        const validatedQuery = comment_schema_1.searchCommentsSchema.parse({
            q,
            authorId,
            startDate,
            endDate,
            limit,
        });
        const results = await comment_service_1.CommentService.search(validatedQuery.q, {
            authorId: validatedQuery.authorId,
            startDate: validatedQuery.startDate ? new Date(validatedQuery.startDate) : undefined,
            endDate: validatedQuery.endDate ? new Date(validatedQuery.endDate) : undefined,
            limit: validatedQuery.limit,
        });
        res.json({
            success: true,
            data: results,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=comment.routes.js.map