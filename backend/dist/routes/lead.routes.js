"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const lead_schema_1 = require("../schemas/lead.schema");
const lead_service_1 = require("../services/lead.service");
const router = (0, express_1.Router)();
// Apply auth middleware to all lead routes
router.use(auth_1.authMiddleware);
/**
 * POST /api/leads
 * Create a new lead
 */
router.post('/', async (req, res, next) => {
    try {
        // Validate input
        const validatedData = lead_schema_1.createLeadSchema.parse(req.body);
        // Create the lead
        const lead = await lead_service_1.LeadService.create(validatedData, req.user.id);
        res.status(201).json({
            success: true,
            data: lead,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/leads
 * List all leads with filtering and cursor-based pagination
 */
router.get('/', async (req, res, next) => {
    try {
        // Validate query parameters
        const validatedQuery = lead_schema_1.listLeadsSchema.parse(req.query);
        // List leads
        const result = await lead_service_1.LeadService.list({
            userId: req.user.id,
            userRole: req.user.role,
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
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/leads/:id
 * Get a specific lead by ID with all relationships
 */
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        // Get the lead
        const lead = await lead_service_1.LeadService.getById(id, req.user.id, req.user.role);
        // Lead not found
        if (!lead) {
            const error = new Error('Lead not found');
            error.statusCode = 404;
            error.code = 'LEAD_NOT_FOUND';
            throw error;
        }
        res.json({
            success: true,
            data: lead,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * PUT /api/leads/:id
 * Update a lead
 */
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        // Validate input
        const validatedData = lead_schema_1.updateLeadSchema.parse(req.body);
        // Update the lead
        const lead = await lead_service_1.LeadService.update(id, validatedData, req.user.id, req.user.role);
        res.json({
            success: true,
            data: lead,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * DELETE /api/leads/:id
 * Soft delete a lead (archive it)
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        // Delete the lead
        await lead_service_1.LeadService.delete(id, req.user.id, req.user.role);
        res.json({
            success: true,
            data: { message: 'Lead archived successfully' },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * PUT /api/leads/:id/call-status
 * Update the global call status of a lead
 */
router.put('/:id/call-status', async (req, res, next) => {
    try {
        const { id } = req.params;
        // Validate input
        const validatedData = lead_schema_1.callStatusSchema.parse(req.body);
        // Update call status
        const lead = await lead_service_1.LeadService.updateCallStatus(id, validatedData.globalCallStatus, req.user.id, req.user.role);
        res.json({
            success: true,
            data: lead,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * PUT /api/leads/:id/reschedule
 * Set or update the reschedule date for a lead
 */
router.put('/:id/reschedule', async (req, res, next) => {
    try {
        const { id } = req.params;
        // Validate input
        const validatedData = lead_schema_1.rescheduleSchema.parse(req.body);
        // Update reschedule date
        const lead = await lead_service_1.LeadService.setRescheduleDate(id, validatedData.rescheduleDate, req.user.id, req.user.role);
        res.json({
            success: true,
            data: lead,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=lead.routes.js.map