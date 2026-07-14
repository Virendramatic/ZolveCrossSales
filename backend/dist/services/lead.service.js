"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadService = void 0;
const index_1 = require("../index");
class LeadService {
    /**
     * Create a new lead
     * @param data Lead creation data including name, phone, email, country, intake, leadSource, notes
     * @param createdByUserId The ID of the user creating the lead
     * @returns The created lead object
     */
    static async create(data, createdByUserId) {
        try {
            // Create the lead in the database
            const lead = await index_1.prisma.lead.create({
                data: {
                    name: data.name,
                    phone: data.phone,
                    email: data.email || null,
                    country: data.country || null,
                    intake: data.intake || null,
                    leadSource: data.leadSource || null,
                    notes: data.notes || null,
                    createdByUserId,
                    globalCallStatus: 'NOT_CALLED',
                },
                select: {
                    id: true,
                    leadCode: true,
                    name: true,
                    phone: true,
                    email: true,
                    country: true,
                    intake: true,
                    leadSource: true,
                    notes: true,
                    globalCallStatus: true,
                    rescheduleDate: true,
                    createdByUserId: true,
                    currentOwnerId: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            return lead;
        }
        catch (error) {
            if (error instanceof Error) {
                const appError = new Error(error.message);
                appError.statusCode = 400;
                appError.code = 'LEAD_CREATION_FAILED';
                throw appError;
            }
            throw error;
        }
    }
    /**
     * Get a lead by ID with all relationships
     * @param leadId The ID of the lead to retrieve
     * @param userId The ID of the user requesting the lead
     * @param userRole The role of the user (ADMIN or COUNSELOR)
     * @returns The lead with all relationships or null if not found
     * @throws 403 if user is COUNSELOR and doesn't own the lead
     */
    static async getById(leadId, userId, userRole) {
        try {
            // Fetch the lead with all relationships
            const lead = await index_1.prisma.lead.findUnique({
                where: { id: leadId },
                select: {
                    id: true,
                    leadCode: true,
                    name: true,
                    phone: true,
                    email: true,
                    country: true,
                    intake: true,
                    leadSource: true,
                    notes: true,
                    globalCallStatus: true,
                    rescheduleDate: true,
                    createdByUserId: true,
                    currentOwnerId: true,
                    createdAt: true,
                    updatedAt: true,
                    productInstances: {
                        select: {
                            id: true,
                            productCode: true,
                            productType: true,
                            status: true,
                            stage: true,
                            createdAt: true,
                        },
                    },
                    comments: {
                        select: {
                            id: true,
                            content: true,
                            authorId: true,
                            authorName: true,
                            authorRole: true,
                            isInternal: true,
                            createdAt: true,
                        },
                        orderBy: {
                            createdAt: 'desc',
                        },
                    },
                },
            });
            // Lead not found
            if (!lead) {
                return null;
            }
            // Check permissions: COUNSELOR can only see leads they own
            if (userRole === 'COUNSELOR' && lead.currentOwnerId !== userId) {
                const error = new Error('You do not have permission to access this lead');
                error.statusCode = 403;
                error.code = 'FORBIDDEN';
                throw error;
            }
            return lead;
        }
        catch (error) {
            // Re-throw if it's already an AppError (from permission check)
            if (error instanceof Error && error.statusCode) {
                throw error;
            }
            if (error instanceof Error) {
                const appError = new Error(error.message);
                appError.statusCode = 500;
                appError.code = 'LEAD_FETCH_FAILED';
                throw appError;
            }
            throw error;
        }
    }
    /**
     * List leads with filtering and cursor-based pagination
     * @param options Query options: userId, userRole, status, callStatus, country, intake, limit, cursor, sortBy
     * @returns Object with leads array, nextCursor, and hasMore boolean
     */
    static async list(options) {
        try {
            const { userId, userRole, callStatus, status: leadSource, country, intake, limit = 50, cursor, sortBy = 'created', } = options;
            // Build where clause with filters
            const where = {
                archivedAt: null, // Exclude archived leads
            };
            // COUNSELOR filter: only see leads they own
            if (userRole === 'COUNSELOR') {
                where.currentOwnerId = userId;
            }
            // Optional filters
            if (callStatus) {
                where.globalCallStatus = callStatus;
            }
            if (leadSource) {
                where.leadSource = leadSource;
            }
            if (country) {
                where.country = country;
            }
            if (intake) {
                where.intake = intake;
            }
            // Determine sort order
            let orderBy = {};
            if (sortBy === 'name') {
                orderBy = { name: 'asc' };
            }
            else if (sortBy === 'status') {
                orderBy = { globalCallStatus: 'asc' };
            }
            else {
                // Default: created (descending)
                orderBy = { createdAt: 'desc' };
            }
            // Cursor pagination: fetch limit + 1 to determine if there are more results
            const fetchLimit = limit + 1;
            const skip = cursor ? 1 : 0; // Skip the cursor item itself
            const query = {
                where,
                select: {
                    id: true,
                    leadCode: true,
                    name: true,
                    phone: true,
                    email: true,
                    country: true,
                    intake: true,
                    leadSource: true,
                    globalCallStatus: true,
                    rescheduleDate: true,
                    createdByUserId: true,
                    currentOwnerId: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy,
                take: fetchLimit,
            };
            // Handle cursor
            if (cursor) {
                query.skip = skip;
                query.cursor = { id: cursor };
            }
            const leads = await index_1.prisma.lead.findMany(query);
            // Determine if there are more results
            const hasMore = leads.length > limit;
            const result = hasMore ? leads.slice(0, limit) : leads;
            // Get next cursor (last lead's id)
            const nextCursor = hasMore ? result[result.length - 1]?.id : null;
            return {
                leads: result,
                nextCursor,
                hasMore,
            };
        }
        catch (error) {
            if (error instanceof Error) {
                const appError = new Error(error.message);
                appError.statusCode = 500;
                appError.code = 'LEAD_LIST_FAILED';
                throw appError;
            }
            throw error;
        }
    }
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
    static async update(leadId, data, userId, userRole) {
        try {
            // Check if lead exists and user has permission
            const lead = await index_1.prisma.lead.findUnique({
                where: { id: leadId },
                select: {
                    id: true,
                    currentOwnerId: true,
                    name: true,
                    phone: true,
                    email: true,
                    country: true,
                    intake: true,
                    notes: true,
                },
            });
            if (!lead) {
                const error = new Error('Lead not found');
                error.statusCode = 404;
                error.code = 'LEAD_NOT_FOUND';
                throw error;
            }
            // Permission check: COUNSELOR can only update leads they own
            if (userRole === 'COUNSELOR' && lead.currentOwnerId !== userId) {
                const error = new Error('You do not have permission to update this lead');
                error.statusCode = 403;
                error.code = 'FORBIDDEN';
                throw error;
            }
            // Build update object with only provided fields
            const updateData = {};
            if (data.name !== undefined)
                updateData.name = data.name;
            if (data.phone !== undefined)
                updateData.phone = data.phone;
            if (data.email !== undefined)
                updateData.email = data.email;
            if (data.country !== undefined)
                updateData.country = data.country;
            if (data.intake !== undefined)
                updateData.intake = data.intake;
            if (data.notes !== undefined)
                updateData.notes = data.notes;
            // Track changes for audit log
            const changes = [];
            Object.keys(updateData).forEach(key => {
                if (lead[key] !== updateData[key]) {
                    changes.push({
                        fieldName: key,
                        oldValue: lead[key],
                        newValue: updateData[key],
                    });
                }
            });
            // Update the lead
            const updatedLead = await index_1.prisma.lead.update({
                where: { id: leadId },
                data: updateData,
                select: {
                    id: true,
                    leadCode: true,
                    name: true,
                    phone: true,
                    email: true,
                    country: true,
                    intake: true,
                    leadSource: true,
                    notes: true,
                    globalCallStatus: true,
                    rescheduleDate: true,
                    createdByUserId: true,
                    currentOwnerId: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            // Log to audit trail
            if (changes.length > 0) {
                await index_1.prisma.auditLog.create({
                    data: {
                        entityType: 'Lead',
                        entityId: leadId,
                        action: 'UPDATE',
                        userId,
                        userName: 'User', // In production, would get user's name
                        changes,
                    },
                });
            }
            return updatedLead;
        }
        catch (error) {
            // Re-throw if it's already an AppError
            if (error instanceof Error && error.statusCode) {
                throw error;
            }
            if (error instanceof Error) {
                const appError = new Error(error.message);
                appError.statusCode = 500;
                appError.code = 'LEAD_UPDATE_FAILED';
                throw appError;
            }
            throw error;
        }
    }
    /**
     * Soft delete a lead (archive it)
     * @param leadId The ID of the lead to delete
     * @param userId The ID of the user performing the delete
     * @param userRole The role of the user
     * @returns Success confirmation
     * @throws 403 if user is COUNSELOR and doesn't own the lead
     * @throws 404 if lead not found
     */
    static async delete(leadId, userId, userRole) {
        try {
            // Check if lead exists and user has permission
            const lead = await index_1.prisma.lead.findUnique({
                where: { id: leadId },
                select: {
                    id: true,
                    currentOwnerId: true,
                    archivedAt: true,
                },
            });
            if (!lead) {
                const error = new Error('Lead not found');
                error.statusCode = 404;
                error.code = 'LEAD_NOT_FOUND';
                throw error;
            }
            // Permission check: COUNSELOR can only delete leads they own
            if (userRole === 'COUNSELOR' && lead.currentOwnerId !== userId) {
                const error = new Error('You do not have permission to delete this lead');
                error.statusCode = 403;
                error.code = 'FORBIDDEN';
                throw error;
            }
            // Soft delete the lead
            await index_1.prisma.lead.update({
                where: { id: leadId },
                data: {
                    archivedAt: new Date(),
                },
            });
            // Also archive related product instances
            await index_1.prisma.productInstance.updateMany({
                where: { leadId },
                data: {
                    archivedAt: new Date(),
                },
            });
            // Log to audit trail
            await index_1.prisma.auditLog.create({
                data: {
                    entityType: 'Lead',
                    entityId: leadId,
                    action: 'ARCHIVE',
                    userId,
                    userName: 'User',
                },
            });
            return { success: true };
        }
        catch (error) {
            // Re-throw if it's already an AppError
            if (error instanceof Error && error.statusCode) {
                throw error;
            }
            if (error instanceof Error) {
                const appError = new Error(error.message);
                appError.statusCode = 500;
                appError.code = 'LEAD_DELETE_FAILED';
                throw appError;
            }
            throw error;
        }
    }
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
    static async updateCallStatus(leadId, globalCallStatus, userId, userRole) {
        try {
            // Check if lead exists and user has permission
            const lead = await index_1.prisma.lead.findUnique({
                where: { id: leadId },
                select: {
                    id: true,
                    currentOwnerId: true,
                    globalCallStatus: true,
                },
            });
            if (!lead) {
                const error = new Error('Lead not found');
                error.statusCode = 404;
                error.code = 'LEAD_NOT_FOUND';
                throw error;
            }
            // Permission check: COUNSELOR can only update leads they own
            if (userRole === 'COUNSELOR' && lead.currentOwnerId !== userId) {
                const error = new Error('You do not have permission to update this lead');
                error.statusCode = 403;
                error.code = 'FORBIDDEN';
                throw error;
            }
            // Validate status transition
            const validStatuses = ['NOT_CALLED', 'RESPONDING', 'NOT_RESPONDING', 'CONVERTED'];
            if (!validStatuses.includes(globalCallStatus)) {
                const error = new Error(`Invalid call status: ${globalCallStatus}`);
                error.statusCode = 400;
                error.code = 'INVALID_CALL_STATUS';
                throw error;
            }
            // Update call status
            const updatedLead = await index_1.prisma.lead.update({
                where: { id: leadId },
                data: {
                    globalCallStatus: globalCallStatus,
                },
                select: {
                    id: true,
                    leadCode: true,
                    name: true,
                    phone: true,
                    email: true,
                    country: true,
                    intake: true,
                    leadSource: true,
                    notes: true,
                    globalCallStatus: true,
                    rescheduleDate: true,
                    createdByUserId: true,
                    currentOwnerId: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            // Log to audit trail
            await index_1.prisma.auditLog.create({
                data: {
                    entityType: 'Lead',
                    entityId: leadId,
                    action: 'UPDATE',
                    userId,
                    userName: 'User',
                    changes: [
                        {
                            fieldName: 'globalCallStatus',
                            oldValue: lead.globalCallStatus,
                            newValue: globalCallStatus,
                        },
                    ],
                },
            });
            return updatedLead;
        }
        catch (error) {
            // Re-throw if it's already an AppError
            if (error instanceof Error && error.statusCode) {
                throw error;
            }
            if (error instanceof Error) {
                const appError = new Error(error.message);
                appError.statusCode = 500;
                appError.code = 'CALL_STATUS_UPDATE_FAILED';
                throw appError;
            }
            throw error;
        }
    }
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
    static async setRescheduleDate(leadId, rescheduleDate, userId, userRole) {
        try {
            // Validate that reschedule date is in the future
            const now = new Date();
            if (rescheduleDate <= now) {
                const error = new Error('Reschedule date must be in the future');
                error.statusCode = 400;
                error.code = 'INVALID_RESCHEDULE_DATE';
                throw error;
            }
            // Check if lead exists and user has permission
            const lead = await index_1.prisma.lead.findUnique({
                where: { id: leadId },
                select: {
                    id: true,
                    currentOwnerId: true,
                    rescheduleDate: true,
                },
            });
            if (!lead) {
                const error = new Error('Lead not found');
                error.statusCode = 404;
                error.code = 'LEAD_NOT_FOUND';
                throw error;
            }
            // Permission check: COUNSELOR can only update leads they own
            if (userRole === 'COUNSELOR' && lead.currentOwnerId !== userId) {
                const error = new Error('You do not have permission to update this lead');
                error.statusCode = 403;
                error.code = 'FORBIDDEN';
                throw error;
            }
            // Update reschedule date
            const updatedLead = await index_1.prisma.lead.update({
                where: { id: leadId },
                data: {
                    rescheduleDate,
                },
                select: {
                    id: true,
                    leadCode: true,
                    name: true,
                    phone: true,
                    email: true,
                    country: true,
                    intake: true,
                    leadSource: true,
                    notes: true,
                    globalCallStatus: true,
                    rescheduleDate: true,
                    createdByUserId: true,
                    currentOwnerId: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            // Log to audit trail
            await index_1.prisma.auditLog.create({
                data: {
                    entityType: 'Lead',
                    entityId: leadId,
                    action: 'UPDATE',
                    userId,
                    userName: 'User',
                    changes: [
                        {
                            fieldName: 'rescheduleDate',
                            oldValue: lead.rescheduleDate,
                            newValue: rescheduleDate,
                        },
                    ],
                },
            });
            return updatedLead;
        }
        catch (error) {
            // Re-throw if it's already an AppError
            if (error instanceof Error && error.statusCode) {
                throw error;
            }
            if (error instanceof Error) {
                const appError = new Error(error.message);
                appError.statusCode = 500;
                appError.code = 'RESCHEDULE_UPDATE_FAILED';
                throw appError;
            }
            throw error;
        }
    }
}
exports.LeadService = LeadService;
//# sourceMappingURL=lead.service.js.map