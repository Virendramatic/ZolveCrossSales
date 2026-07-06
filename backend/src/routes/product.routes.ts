import { Router, Response, NextFunction } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { ProductService } from '../services/product.service';
import { createProductSchema, updateProductStatusSchema } from '../schemas/product.schema';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Apply auth middleware to all product routes
router.use(authMiddleware);

/**
 * POST /api/leads/:leadId/products
 * Create a new product instance for a lead
 */
router.post(
  '/:leadId/products',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { leadId } = req.params;
      const validatedData = createProductSchema.parse(req.body);

      // Permission check: only ADMIN or current owner can create products
      if (
        req.user!.role !== 'ADMIN' &&
        validatedData.ownerUserId &&
        validatedData.ownerUserId !== req.user!.id
      ) {
        const error = new Error('You do not have permission to create this product') as AppError;
        error.statusCode = 403;
        error.code = 'FORBIDDEN';
        throw error;
      }

      const product = await ProductService.create(
        leadId,
        validatedData.productType,
        validatedData.ownerUserId || req.user!.id
      );

      res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/products/:productId
 * Get a product instance by ID
 */
router.get(
  '/:productId',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productId } = req.params;

      const product = await ProductService.getById(productId, req.user!.id, req.user!.role);

      if (!product) {
        const error = new Error('Product not found') as AppError;
        error.statusCode = 404;
        error.code = 'PRODUCT_NOT_FOUND';
        throw error;
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/leads/:leadId/products
 * List all products for a lead
 */
router.get(
  '/:leadId/products',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { leadId } = req.params;

      const products = await ProductService.listByLead(
        leadId,
        req.user!.id,
        req.user!.role
      );

      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/leads/:leadId/products/:productId/status
 * Update product status
 */
router.put(
  '/:leadId/products/:productId/status',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productId } = req.params;
      const validatedData = updateProductStatusSchema.parse(req.body);

      const product = await ProductService.updateStatus(
        productId,
        validatedData.status,
        req.user!.id,
        req.user!.role
      );

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/products/:productId
 * Archive a product instance
 */
router.delete(
  '/:productId',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productId } = req.params;

      await ProductService.delete(productId, req.user!.id, req.user!.role);

      res.json({
        success: true,
        data: { message: 'Product archived successfully' },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/leads/view/:productType
 * Get leads by product type (for tab views)
 */
router.get(
  '/view/:productType',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productType } = req.params;
      const { limit, cursor } = req.query;

      const validProductTypes = ['EDUCATION_LOAN', 'REMITTANCE', 'ACCOMMODATION', 'CREDIT_CARD'];
      if (!validProductTypes.includes(productType)) {
        const error = new Error('Invalid product type') as AppError;
        error.statusCode = 400;
        error.code = 'INVALID_PRODUCT_TYPE';
        throw error;
      }

      const result = await ProductService.getLeadsByProductType(
        productType as any,
        req.user!.id,
        req.user!.role,
        {
          limit: limit ? parseInt(limit as string) : 50,
          cursor: cursor as string,
        }
      );

      res.json({
        success: true,
        data: {
          leads: result.leads,
          nextCursor: result.nextCursor,
          hasMore: result.hasMore,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
