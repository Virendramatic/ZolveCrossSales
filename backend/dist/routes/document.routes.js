"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const document_service_1 = require("../services/document.service");
const auth_1 = require("../middleware/auth");
const document_schema_1 = require("../schemas/document.schema");
const router = express_1.default.Router();
// Apply auth middleware to all routes
router.use(auth_1.authMiddleware);
/**
 * POST /api/loans/:loanId/documents
 * Upload a document for a loan
 */
router.post('/loans/:loanId/documents', async (req, res, next) => {
    try {
        const { loanId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;
        // Validate input
        const input = document_schema_1.DocumentUploadSchema.parse(req.body);
        // Upload document
        const result = await document_service_1.DocumentService.uploadDocument(loanId, input, userId, userRole);
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
 * GET /api/loans/:loanId/documents/:documentRequestId
 * Get document status and submission details
 */
router.get('/loans/:loanId/documents/:documentRequestId', async (req, res, next) => {
    try {
        const { loanId, documentRequestId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;
        const result = await document_service_1.DocumentService.getDocumentStatus(loanId, documentRequestId, userId, userRole);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/loans/:loanId/documents/:documentId/versions
 * Get document version history
 */
router.get('/loans/:loanId/documents/:documentId/versions', async (req, res, next) => {
    try {
        const { loanId, documentId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;
        const versions = await document_service_1.DocumentService.getDocumentVersions(loanId, documentId, userId, userRole);
        res.status(200).json({
            success: true,
            data: versions,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * PUT /api/loans/:loanId/documents/:documentId/approve
 * Approve a document submission
 */
router.put('/loans/:loanId/documents/:documentId/approve', async (req, res, next) => {
    try {
        // Only admins can approve documents
        if (req.user.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Only admins can approve documents',
                },
            });
            return;
        }
        const { loanId, documentId } = req.params;
        const documentRequestId = req.body.documentRequestId;
        const userId = req.user.id;
        const userRole = req.user.role;
        // Validate input
        const input = document_schema_1.DocumentApprovalSchema.parse(req.body);
        if (!documentRequestId) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Document request ID required',
                },
            });
            return;
        }
        const result = await document_service_1.DocumentService.approveDocument(loanId, documentRequestId, documentId, input, userId, userRole);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * PUT /api/loans/:loanId/documents/:documentId/reject
 * Reject a document submission
 */
router.put('/loans/:loanId/documents/:documentId/reject', async (req, res, next) => {
    try {
        // Only admins can reject documents
        if (req.user.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Only admins can reject documents',
                },
            });
            return;
        }
        const { loanId, documentId } = req.params;
        const documentRequestId = req.body.documentRequestId;
        const userId = req.user.id;
        const userRole = req.user.role;
        // Validate input
        const input = document_schema_1.DocumentRejectionSchema.parse(req.body);
        if (!documentRequestId) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Document request ID required',
                },
            });
            return;
        }
        const result = await document_service_1.DocumentService.rejectDocument(loanId, documentRequestId, documentId, input, userId, userRole);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=document.routes.js.map