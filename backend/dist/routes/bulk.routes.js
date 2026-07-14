"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const bulk_service_1 = require("../services/bulk.service");
const bulk_schema_1 = require("../schemas/bulk.schema");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
// Apply auth middleware to all bulk routes
router.use(auth_1.authMiddleware);
// File upload middleware
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only CSV files are allowed'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});
/**
 * POST /api/leads/bulk-import
 * Import leads from CSV file
 */
router.post('/bulk-import', upload.single('file'), async (req, res, next) => {
    try {
        // Check if file is provided
        if (!req.file) {
            const error = new Error('No file uploaded');
            error.statusCode = 400;
            error.code = 'NO_FILE';
            throw error;
        }
        // Only ADMIN can bulk import
        if (req.user.role !== 'ADMIN') {
            const error = new Error('Only admins can perform bulk imports');
            error.statusCode = 403;
            error.code = 'FORBIDDEN';
            throw error;
        }
        // Convert buffer to string
        const csvData = req.file.buffer.toString('utf-8');
        // Perform import
        const result = await bulk_service_1.BulkService.importLeads(csvData, req.user.id, req.user.name);
        res.status(201).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/leads/bulk-assign
 * Assign multiple leads to a counselor
 */
router.post('/bulk-assign', async (req, res, next) => {
    try {
        // Only ADMIN can bulk assign
        if (req.user.role !== 'ADMIN') {
            const error = new Error('Only admins can perform bulk assignments');
            error.statusCode = 403;
            error.code = 'FORBIDDEN';
            throw error;
        }
        const validatedData = bulk_schema_1.bulkAssignSchema.parse(req.body);
        const result = await bulk_service_1.BulkService.assignLeads(validatedData.leadIds, validatedData.targetCounselorId, req.user.id, req.user.name);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/leads/bulk/stats
 * Get bulk operation statistics
 */
router.get('/stats', async (req, res, next) => {
    try {
        const stats = await bulk_service_1.BulkService.getStats(req.user.id, req.user.role);
        res.json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=bulk.routes.js.map