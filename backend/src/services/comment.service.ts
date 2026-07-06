import { prisma } from '../index';
import { AppError } from '../middleware/errorHandler';

export class CommentService {
  /**
   * Create a new comment on a lead
   * @param leadId The ID of the lead
   * @param content The comment text
   * @param authorId The ID of the comment author
   * @param authorName The name of the author
   * @param authorRole The role of the author
   * @param isInternal Whether the comment is internal only
   * @returns The created comment
   * @throws 404 if lead not found
   */
  static async create(
    leadId: string,
    data: {
      content: string;
      isInternal?: boolean;
    },
    authorId: string,
    authorName: string,
    authorRole: string
  ) {
    try {
      // Verify lead exists
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        select: { id: true },
      });

      if (!lead) {
        const error = new Error('Lead not found') as AppError;
        error.statusCode = 404;
        error.code = 'LEAD_NOT_FOUND';
        throw error;
      }

      // Create comment
      const comment = await prisma.comment.create({
        data: {
          leadId,
          content: data.content,
          authorId,
          authorName,
          authorRole,
          isInternal: data.isInternal || false,
        },
        select: {
          id: true,
          content: true,
          authorId: true,
          authorName: true,
          authorRole: true,
          isInternal: true,
          createdAt: true,
          updatedAt: true,
          editedBy: true,
          deletedAt: true,
        },
      });

      // Log to audit trail
      await prisma.auditLog.create({
        data: {
          entityType: 'Comment',
          entityId: comment.id,
          action: 'CREATE',
          userId: authorId,
          userName: authorName,
          sensitiveDataAccessed: false,
        },
      });

      return comment;
    } catch (error) {
      if (error instanceof Error && (error as AppError).statusCode) {
        throw error;
      }
      if (error instanceof Error) {
        const appError = new Error(error.message) as AppError;
        appError.statusCode = 500;
        appError.code = 'COMMENT_CREATE_FAILED';
        throw appError;
      }
      throw error;
    }
  }

  /**
   * Get comments for a lead (paginated, reverse chronological)
   * @param leadId The ID of the lead
   * @param limit Number of comments per page
   * @param cursor Pagination cursor
   * @returns Array of comments with pagination info
   */
  static async listByLead(
    leadId: string,
    options: {
      limit?: number;
      cursor?: string;
    } = {}
  ) {
    try {
      const { limit = 20, cursor } = options;

      // Verify lead exists
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        select: { id: true },
      });

      if (!lead) {
        const error = new Error('Lead not found') as AppError;
        error.statusCode = 404;
        error.code = 'LEAD_NOT_FOUND';
        throw error;
      }

      // Build query
      const query: any = {
        where: {
          leadId,
          deletedAt: null,
        },
        select: {
          id: true,
          content: true,
          authorId: true,
          authorName: true,
          authorRole: true,
          isInternal: true,
          createdAt: true,
          updatedAt: true,
          editedBy: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit + 1,
      };

      if (cursor) {
        query.skip = 1;
        query.cursor = { id: cursor };
      }

      const comments = await prisma.comment.findMany(query);

      // Determine if there are more results
      const hasMore = comments.length > limit;
      const result = hasMore ? comments.slice(0, limit) : comments;
      const nextCursor = hasMore ? result[result.length - 1]?.id : null;

      return {
        comments: result,
        nextCursor,
        hasMore,
      };
    } catch (error) {
      if (error instanceof Error && (error as AppError).statusCode) {
        throw error;
      }
      if (error instanceof Error) {
        const appError = new Error(error.message) as AppError;
        appError.statusCode = 500;
        appError.code = 'COMMENT_LIST_FAILED';
        throw appError;
      }
      throw error;
    }
  }

  /**
   * Get a single comment by ID
   * @param commentId The ID of the comment
   * @returns The comment or null if not found
   */
  static async getById(commentId: string) {
    try {
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: {
          id: true,
          leadId: true,
          content: true,
          authorId: true,
          authorName: true,
          authorRole: true,
          isInternal: true,
          createdAt: true,
          updatedAt: true,
          editedBy: true,
          deletedAt: true,
        },
      });

      return comment;
    } catch (error) {
      if (error instanceof Error) {
        const appError = new Error(error.message) as AppError;
        appError.statusCode = 500;
        appError.code = 'COMMENT_FETCH_FAILED';
        throw appError;
      }
      throw error;
    }
  }

  /**
   * Update a comment (edit text)
   * @param commentId The ID of the comment
   * @param content New comment text
   * @param userId The ID of the user editing
   * @param userName The name of the user editing
   * @returns The updated comment
   * @throws 403 if user is not author/admin
   * @throws 404 if comment not found
   */
  static async update(
    commentId: string,
    content: string,
    userId: string,
    userName: string,
    userRole: string
  ) {
    try {
      // Get comment to check permissions
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: {
          id: true,
          authorId: true,
          content: true,
          editedBy: true,
        },
      });

      if (!comment) {
        const error = new Error('Comment not found') as AppError;
        error.statusCode = 404;
        error.code = 'COMMENT_NOT_FOUND';
        throw error;
      }

      // Permission check: only author or admin can edit
      if (userRole !== 'ADMIN' && comment.authorId !== userId) {
        const error = new Error('You do not have permission to edit this comment') as AppError;
        error.statusCode = 403;
        error.code = 'FORBIDDEN';
        throw error;
      }

      // Update comment
      const updatedComment = await prisma.comment.update({
        where: { id: commentId },
        data: {
          content,
          updatedAt: new Date(),
          editedBy: userId,
        },
        select: {
          id: true,
          content: true,
          authorId: true,
          authorName: true,
          authorRole: true,
          isInternal: true,
          createdAt: true,
          updatedAt: true,
          editedBy: true,
          deletedAt: true,
        },
      });

      // Log to audit trail
      await prisma.auditLog.create({
        data: {
          entityType: 'Comment',
          entityId: commentId,
          action: 'UPDATE',
          userId,
          userName,
          changes: [
            {
              fieldName: 'content',
              oldValue: comment.content,
              newValue: content,
            },
          ],
        },
      });

      return updatedComment;
    } catch (error) {
      if (error instanceof Error && (error as AppError).statusCode) {
        throw error;
      }
      if (error instanceof Error) {
        const appError = new Error(error.message) as AppError;
        appError.statusCode = 500;
        appError.code = 'COMMENT_UPDATE_FAILED';
        throw appError;
      }
      throw error;
    }
  }

  /**
   * Soft delete a comment
   * @param commentId The ID of the comment
   * @param userId The ID of the user deleting
   * @param userName The name of the user deleting
   * @returns Success confirmation
   * @throws 403 if user is not author/admin
   * @throws 404 if comment not found
   */
  static async delete(
    commentId: string,
    userId: string,
    userName: string,
    userRole: string
  ) {
    try {
      // Get comment to check permissions
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: {
          id: true,
          authorId: true,
        },
      });

      if (!comment) {
        const error = new Error('Comment not found') as AppError;
        error.statusCode = 404;
        error.code = 'COMMENT_NOT_FOUND';
        throw error;
      }

      // Permission check: only author or admin can delete
      if (userRole !== 'ADMIN' && comment.authorId !== userId) {
        const error = new Error('You do not have permission to delete this comment') as AppError;
        error.statusCode = 403;
        error.code = 'FORBIDDEN';
        throw error;
      }

      // Soft delete comment
      await prisma.comment.update({
        where: { id: commentId },
        data: {
          deletedAt: new Date(),
        },
      });

      // Log to audit trail
      await prisma.auditLog.create({
        data: {
          entityType: 'Comment',
          entityId: commentId,
          action: 'DELETE',
          userId,
          userName,
        },
      });

      return { success: true };
    } catch (error) {
      if (error instanceof Error && (error as AppError).statusCode) {
        throw error;
      }
      if (error instanceof Error) {
        const appError = new Error(error.message) as AppError;
        appError.statusCode = 500;
        appError.code = 'COMMENT_DELETE_FAILED';
        throw appError;
      }
      throw error;
    }
  }

  /**
   * Search comments by content
   * @param query Search query string
   * @param options Filter options (authorId, dateRange)
   * @returns Array of matching comments
   */
  static async search(
    query: string,
    options: {
      authorId?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    } = {}
  ) {
    try {
      const { authorId, startDate, endDate, limit = 50 } = options;

      // Build where clause
      const where: any = {
        deletedAt: null,
        content: {
          search: query.split(' ').join(' & '),
        },
      };

      if (authorId) {
        where.authorId = authorId;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      // Search comments
      const comments = await prisma.comment.findMany({
        where,
        select: {
          id: true,
          leadId: true,
          content: true,
          authorId: true,
          authorName: true,
          authorRole: true,
          isInternal: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      });

      return comments;
    } catch (error) {
      if (error instanceof Error) {
        const appError = new Error(error.message) as AppError;
        appError.statusCode = 500;
        appError.code = 'COMMENT_SEARCH_FAILED';
        throw appError;
      }
      throw error;
    }
  }
}
