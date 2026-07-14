"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const product_service_1 = require("../services/product.service");
const product_schema_1 = require("../schemas/product.schema");
const router = (0, express_1.Router)();
// Apply auth middleware to all product routes
router.use(auth_1.authMiddleware);
/**
 * POST /api/leads/:leadId/products
 * Create a new product instance for a lead
 */
router.post('/:leadId/products', async (req, res, next) => {
    try {
        const { leadId } = req.params;
        const validatedData = product_schema_1.createProductSchema.parse(req.body);
        // Permission check: only ADMIN or current owner can create products
        if (req.user.role !== 'ADMIN' &&
            validatedData.ownerUserId &&
            validatedData.ownerUserId !== req.user.id) {
            const error = new Error('You do not have permission to create this product');
            error.statusCode = 403;
            error.code = 'FORBIDDEN';
            throw error;
        }
        const product = await product_service_1.ProductService.create(leadId, validatedData.productType, validatedData.ownerUserId || req.user.id);
        res.status(201).json({
            success: true,
            data: product,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/products/:productId
 * Get a product instance by ID
 */
router.get('/:productId', async (req, res, next) => {
    try {
        const { productId } = req.params;
        const product = await product_service_1.ProductService.getById(productId, req.user.id, req.user.role);
        if (!product) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            error.code = 'PRODUCT_NOT_FOUND';
            throw error;
        }
        res.json({
            success: true,
            data: product,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/leads/:leadId/products
 * List all products for a lead
 */
router.get('/:leadId/products', async (req, res, next) => {
    try {
        const { leadId } = req.params;
        const products = await product_service_1.ProductService.listByLead(leadId, req.user.id, req.user.role);
        res.json({
            success: true,
            data: products,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * PUT /api/leads/:leadId/products/:productId/status
 * Update product status
 */
router.put('/:leadId/products/:productId/status', async (req, res, next) => {
    try {
        const { productId } = req.params;
        const validatedData = product_schema_1.updateProductStatusSchema.parse(req.body);
        const product = await product_service_1.ProductService.updateStatus(productId, validatedData.status, req.user.id, req.user.role);
        res.json({
            success: true,
            data: product,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * DELETE /api/products/:productId
 * Archive a product instance
 */
router.delete('/:productId', async (req, res, next) => {
    try {
        const { productId } = req.params;
        await product_service_1.ProductService.delete(productId, req.user.id, req.user.role);
        res.json({
            success: true,
            data: { message: 'Product archived successfully' },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/leads/view/:productType
 * Get leads by product type (for tab views)
 */
router.get('/view/:productType', async (req, res, next) => {
    try {
        const { productType } = req.params;
        const { limit, cursor } = req.query;
        const validProductTypes = ['EDUCATION_LOAN', 'REMITTANCE', 'ACCOMMODATION', 'CREDIT_CARD'];
        if (!validProductTypes.includes(productType)) {
            const error = new Error('Invalid product type');
            error.statusCode = 400;
            error.code = 'INVALID_PRODUCT_TYPE';
            throw error;
        }
        const result = await product_service_1.ProductService.getLeadsByProductType(productType, req.user.id, req.user.role, {
            limit: limit ? parseInt(limit) : 50,
            cursor: cursor,
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
exports.default = router;
//# sourceMappingURL=product.routes.js.map