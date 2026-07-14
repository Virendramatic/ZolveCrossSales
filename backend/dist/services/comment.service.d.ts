export declare class CommentService {
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
    static create(leadId: string, data: {
        content: string;
        isInternal?: boolean;
    }, authorId: string, authorName: string, authorRole: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date | null;
        content: string;
        authorId: string;
        authorName: string;
        authorRole: string;
        isInternal: boolean;
        editedBy: string | null;
        deletedAt: Date | null;
    }>;
    /**
     * Get comments for a lead (paginated, reverse chronological)
     * @param leadId The ID of the lead
     * @param limit Number of comments per page
     * @param cursor Pagination cursor
     * @returns Array of comments with pagination info
     */
    static listByLead(leadId: string, options?: {
        limit?: number;
        cursor?: string;
    }): Promise<{
        comments: {
            id: string;
            createdAt: Date;
            updatedAt: Date | null;
            leadId: string;
            content: string;
            authorId: string;
            authorName: string;
            authorRole: string;
            isInternal: boolean;
            editedBy: string | null;
            deletedAt: Date | null;
        }[];
        nextCursor: string | null;
        hasMore: boolean;
    }>;
    /**
     * Get a single comment by ID
     * @param commentId The ID of the comment
     * @returns The comment or null if not found
     */
    static getById(commentId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date | null;
        leadId: string;
        content: string;
        authorId: string;
        authorName: string;
        authorRole: string;
        isInternal: boolean;
        editedBy: string | null;
        deletedAt: Date | null;
    } | null>;
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
    static update(commentId: string, content: string, userId: string, userName: string, userRole: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date | null;
        content: string;
        authorId: string;
        authorName: string;
        authorRole: string;
        isInternal: boolean;
        editedBy: string | null;
        deletedAt: Date | null;
    }>;
    /**
     * Soft delete a comment
     * @param commentId The ID of the comment
     * @param userId The ID of the user deleting
     * @param userName The name of the user deleting
     * @returns Success confirmation
     * @throws 403 if user is not author/admin
     * @throws 404 if comment not found
     */
    static delete(commentId: string, userId: string, userName: string, userRole: string): Promise<{
        success: boolean;
    }>;
    /**
     * Search comments by content
     * @param query Search query string
     * @param options Filter options (authorId, dateRange)
     * @returns Array of matching comments
     */
    static search(query: string, options?: {
        authorId?: string;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date | null;
        leadId: string;
        content: string;
        authorId: string;
        authorName: string;
        authorRole: string;
        isInternal: boolean;
    }[]>;
}
//# sourceMappingURL=comment.service.d.ts.map