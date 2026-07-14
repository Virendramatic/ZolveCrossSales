export declare class LeadService {
    /**
     * Create a new lead
     * @param data Lead creation data including name, phone, email, country, intake, leadSource, notes
     * @param createdByUserId The ID of the user creating the lead
     * @returns The created lead object
     */
    static create(data: {
        name: string;
        phone: string;
        email?: string | null;
        country?: string | null;
        intake?: string | null;
        leadSource?: string | null;
        notes?: string | null;
    }, createdByUserId: string): Promise<{
        email: string | null;
        id: string;
        name: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        country: string | null;
        intake: string | null;
        leadSource: string | null;
        notes: string | null;
        globalCallStatus: import(".prisma/client").$Enums.CallStatus;
        rescheduleDate: Date | null;
        leadCode: string;
        createdByUserId: string;
        currentOwnerId: string | null;
    }>;
    /**
     * Get a lead by ID with all relationships
     * @param leadId The ID of the lead to retrieve
     * @param userId The ID of the user requesting the lead
     * @param userRole The role of the user (ADMIN or COUNSELOR)
     * @returns The lead with all relationships or null if not found
     * @throws 403 if user is COUNSELOR and doesn't own the lead
     */
    static getById(leadId: string, userId: string, userRole: string): Promise<{
        email: string | null;
        id: string;
        name: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        country: string | null;
        intake: string | null;
        leadSource: string | null;
        notes: string | null;
        globalCallStatus: import(".prisma/client").$Enums.CallStatus;
        rescheduleDate: Date | null;
        leadCode: string;
        productInstances: {
            status: string | null;
            id: string;
            createdAt: Date;
            productCode: string;
            productType: import(".prisma/client").$Enums.ProductType;
            stage: string | null;
        }[];
        comments: {
            id: string;
            createdAt: Date;
            content: string;
            authorId: string;
            authorName: string;
            authorRole: string;
            isInternal: boolean;
        }[];
        createdByUserId: string;
        currentOwnerId: string | null;
    } | null>;
    /**
     * List leads with filtering and cursor-based pagination
     * @param options Query options: userId, userRole, status, callStatus, country, intake, limit, cursor, sortBy
     * @returns Object with leads array, nextCursor, and hasMore boolean
     */
    static list(options: {
        userId: string;
        userRole: string;
        callStatus?: string;
        status?: string;
        country?: string;
        intake?: string;
        limit?: number;
        cursor?: string;
        sortBy?: string;
    }): Promise<{
        leads: {
            email: string | null;
            id: string;
            name: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            country: string | null;
            intake: string | null;
            leadSource: string | null;
            notes: string | null;
            globalCallStatus: import(".prisma/client").$Enums.CallStatus;
            rescheduleDate: Date | null;
            leadCode: string;
            archivedAt: Date | null;
            createdByUserId: string;
            currentOwnerId: string | null;
        }[];
        nextCursor: string | null;
        hasMore: boolean;
    }>;
    /**
     * Update a lead
     * @param leadId The ID of the lead to update
     * @param data The fields to update (name, phone, email, country, intake, notes)
     * @param userId The ID of the user performing the update
     * @param userRole The role of the user
     * @returns The updated lead object
     * @throws 403 if user is COUNSELOR and doesn't own the lead
     * @throws 404 if lead not found
     */
    static update(leadId: string, data: {
        name?: string;
        phone?: string;
        email?: string | null;
        country?: string | null;
        intake?: string | null;
        notes?: string | null;
    }, userId: string, userRole: string): Promise<{
        email: string | null;
        id: string;
        name: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        country: string | null;
        intake: string | null;
        leadSource: string | null;
        notes: string | null;
        globalCallStatus: import(".prisma/client").$Enums.CallStatus;
        rescheduleDate: Date | null;
        leadCode: string;
        createdByUserId: string;
        currentOwnerId: string | null;
    }>;
    /**
     * Soft delete a lead (archive it)
     * @param leadId The ID of the lead to delete
     * @param userId The ID of the user performing the delete
     * @param userRole The role of the user
     * @returns Success confirmation
     * @throws 403 if user is COUNSELOR and doesn't own the lead
     * @throws 404 if lead not found
     */
    static delete(leadId: string, userId: string, userRole: string): Promise<{
        success: boolean;
    }>;
    /**
     * Update the global call status of a lead
     * @param leadId The ID of the lead
     * @param globalCallStatus The new call status
     * @param userId The ID of the user performing the update
     * @param userRole The role of the user
     * @returns The updated lead object
     * @throws 403 if user is COUNSELOR and doesn't own the lead
     * @throws 404 if lead not found
     */
    static updateCallStatus(leadId: string, globalCallStatus: string, userId: string, userRole: string): Promise<{
        email: string | null;
        id: string;
        name: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        country: string | null;
        intake: string | null;
        leadSource: string | null;
        notes: string | null;
        globalCallStatus: import(".prisma/client").$Enums.CallStatus;
        rescheduleDate: Date | null;
        leadCode: string;
        createdByUserId: string;
        currentOwnerId: string | null;
    }>;
    /**
     * Set or update the reschedule date for a lead
     * @param leadId The ID of the lead
     * @param rescheduleDate The new reschedule date (must be in future)
     * @param userId The ID of the user performing the update
     * @param userRole The role of the user
     * @returns The updated lead object
     * @throws 400 if reschedule date is not in the future
     * @throws 403 if user is COUNSELOR and doesn't own the lead
     * @throws 404 if lead not found
     */
    static setRescheduleDate(leadId: string, rescheduleDate: Date, userId: string, userRole: string): Promise<{
        email: string | null;
        id: string;
        name: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        country: string | null;
        intake: string | null;
        leadSource: string | null;
        notes: string | null;
        globalCallStatus: import(".prisma/client").$Enums.CallStatus;
        rescheduleDate: Date | null;
        leadCode: string;
        createdByUserId: string;
        currentOwnerId: string | null;
    }>;
}
//# sourceMappingURL=lead.service.d.ts.map