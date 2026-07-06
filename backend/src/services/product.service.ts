import { prisma } from '../index';
import { AppError } from '../middleware/errorHandler';
import { ProductType } from '@prisma/client';

export class ProductService {
  /**
   * Create a product instance for a lead
   * @param leadId The ID of the lead
   * @param productType The type of product
   * @param ownerUserId The ID of the user owning this product
   * @returns The created product instance
   * @throws 404 if lead not found
   * @throws 400 if product limits violated
   */
  static async create(
    leadId: string,
    productType: ProductType,
    ownerUserId?: string
  ) {
    try {
      // Verify lead exists
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        select: { id: true, currentOwnerId: true },
      });

      if (!lead) {
        const error = new Error('Lead not found') as AppError;
        error.statusCode = 404;
        error.code = 'LEAD_NOT_FOUND';
        throw error;
      }

      // Check product limits
      const existingCount = await prisma.productInstance.count({
        where: {
          leadId,
          productType,
          archivedAt: null,
        },
      });

      // Enforce product limits: 1 for EDUCATION_LOAN, ACCOMMODATION, CREDIT_CARD; unlimited for REMITTANCE
      const maxInstances: Record<ProductType, number> = {
        EDUCATION_LOAN: 1,
        REMITTANCE: Infinity,
        ACCOMMODATION: 1,
        CREDIT_CARD: 1,
      };

      if (existingCount >= maxInstances[productType]) {
        const error = new Error(
          `Lead already has maximum number of ${productType} instances`
        ) as AppError;
        error.statusCode = 400;
        error.code = 'PRODUCT_LIMIT_EXCEEDED';
        throw error;
      }

      // Create product instance
      const product = await prisma.productInstance.create({
        data: {
          leadId,
          productType,
          ownerUserId: ownerUserId || lead.currentOwnerId,
        },
        select: {
          id: true,
          productCode: true,
          leadId: true,
          productType: true,
          status: true,
          stage: true,
          ownerUserId: true,
          createdAt: true,
          updatedAt: true,
          completedAt: true,
          archivedAt: true,
        },
      });

      // Log to audit trail
      await prisma.auditLog.create({
        data: {
          entityType: 'ProductInstance',
          entityId: product.id,
          action: 'CREATE',
          userId: ownerUserId || lead.currentOwnerId || 'system',
          userName: 'System',
        },
      });

      return product;
    } catch (error) {
      if (error instanceof Error && (error as AppError).statusCode) {
        throw error;
      }
      if (error instanceof Error) {
        const appError = new Error(error.message) as AppError;
        appError.statusCode = 500;
        appError.code = 'PRODUCT_CREATE_FAILED';
        throw appError;
      }
      throw error;
    }
  }

  /**
   * Get a product instance by ID
   * @param productId The ID of the product
   * @param userId User making the request (for permission check)
   * @param userRole Role of the user
   * @returns The product instance or null if not found
   * @throws 403 if user doesn't have permission
   */
  static async getById(productId: string, userId: string, userRole: string) {
    try {
      const product = await prisma.productInstance.findUnique({
        where: { id: productId },
        select: {
          id: true,
          productCode: true,
          leadId: true,
          productType: true,
          status: true,
          stage: true,
          ownerUserId: true,
          createdAt: true,
          updatedAt: true,
          completedAt: true,
          archivedAt: true,
          educationLoan: {
            select: {
              id: true,
              loanCode: true,
              loanStage: true,
            },
          },
        },
      });

      if (!product) {
        return null;
      }

      // Permission check: COUNSELOR can only access products they own
      if (userRole === 'COUNSELOR' && product.ownerUserId !== userId) {
        const error = new Error('You do not have permission to access this product') as AppError;
        error.statusCode = 403;
        error.code = 'FORBIDDEN';
        throw error;
      }

      return product;
    } catch (error) {
      if (error instanceof Error && (error as AppError).statusCode) {
        throw error;
      }
      if (error instanceof Error) {
        const appError = new Error(error.message) as AppError;
        appError.statusCode = 500;
        appError.code = 'PRODUCT_FETCH_FAILED';
        throw appError;
      }
      throw error;
    }
  }

  /**
   * List products for a lead
   * @param leadId The ID of the lead
   * @param userId User making the request (for permission check)
   * @param userRole Role of the user
   * @returns Array of products
   */
  static async listByLead(leadId: string, userId: string, userRole: string) {
    try {
      // Verify lead exists
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        select: { id: true, currentOwnerId: true },
      });

      if (!lead) {
        const error = new Error('Lead not found') as AppError;
        error.statusCode = 404;
        error.code = 'LEAD_NOT_FOUND';
        throw error;
      }

      // Permission check: COUNSELOR can only access leads they own
      if (userRole === 'COUNSELOR' && lead.currentOwnerId !== userId) {
        const error = new Error('You do not have permission to access this lead') as AppError;
        error.statusCode = 403;
        error.code = 'FORBIDDEN';
        throw error;
      }

      const products = await prisma.productInstance.findMany({
        where: {
          leadId,
          archivedAt: null,
        },
        select: {
          id: true,
          productCode: true,
          leadId: true,
          productType: true,
          status: true,
          stage: true,
          ownerUserId: true,
          createdAt: true,
          updatedAt: true,
          completedAt: true,
          educationLoan: {
            select: {
              id: true,
              loanCode: true,
              loanStage: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      return products;
    } catch (error) {
      if (error instanceof Error && (error as AppError).statusCode) {
        throw error;
      }
      if (error instanceof Error) {
        const appError = new Error(error.message) as AppError;
        appError.statusCode = 500;
        appError.code = 'PRODUCT_LIST_FAILED';
        throw appError;
      }
      throw error;
    }
  }

  /**
   * Update product status
   * @param productId The ID of the product
   * @param status The new status
   * @param userId User making the request
   * @param userRole Role of the user
   * @returns The updated product
   * @throws 403 if user doesn't have permission
   * @throws 404 if product not found
   */
  static async updateStatus(
    productId: string,
    status: string,
    userId: string,
    userRole: string
  ) {
    try {
      // Get product for permission check
      const product = await prisma.productInstance.findUnique({
        where: { id: productId },
        select: {
          id: true,
          ownerUserId: true,
          status: true,
        },
      });

      if (!product) {
        const error = new Error('Product not found') as AppError;
        error.statusCode = 404;
        error.code = 'PRODUCT_NOT_FOUND';
        throw error;
      }

      // Permission check: COUNSELOR can only update products they own
      if (userRole === 'COUNSELOR' && product.ownerUserId !== userId) {
        const error = new Error('You do not have permission to update this product') as AppError;
        error.statusCode = 403;
        error.code = 'FORBIDDEN';
        throw error;
      }

      // Update status
      const updatedProduct = await prisma.productInstance.update({
        where: { id: productId },
        data: {
          status,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          productCode: true,
          leadId: true,
          productType: true,
          status: true,
          stage: true,
          ownerUserId: true,
          createdAt: true,
          updatedAt: true,
          completedAt: true,
        },
      });

      // Log to audit trail
      await prisma.auditLog.create({
        data: {
          entityType: 'ProductInstance',
          entityId: productId,
          action: 'UPDATE',
          userId,
          userName: 'User',
          changes: [
            {
              fieldName: 'status',
              oldValue: product.status,
              newValue: status,
            },
          ],
        },
      });

      return updatedProduct;
    } catch (error) {
      if (error instanceof Error && (error as AppError).statusCode) {
        throw error;
      }
      if (error instanceof Error) {
        const appError = new Error(error.message) as AppError;
        appError.statusCode = 500;
        appError.code = 'PRODUCT_UPDATE_FAILED';
        throw appError;
      }
      throw error;
    }
  }

  /**
   * Archive a product instance
   * @param productId The ID of the product
   * @param userId User making the request
   * @param userRole Role of the user
   * @returns Success confirmation
   * @throws 403 if user doesn't have permission
   * @throws 404 if product not found
   */
  static async delete(productId: string, userId: string, userRole: string) {
    try {
      // Get product for permission check
      const product = await prisma.productInstance.findUnique({
        where: { id: productId },
        select: {
          id: true,
          ownerUserId: true,
        },
      });

      if (!product) {
        const error = new Error('Product not found') as AppError;
        error.statusCode = 404;
        error.code = 'PRODUCT_NOT_FOUND';
        throw error;
      }

      // Permission check: COUNSELOR can only delete products they own
      if (userRole === 'COUNSELOR' && product.ownerUserId !== userId) {
        const error = new Error('You do not have permission to delete this product') as AppError;
        error.statusCode = 403;
        error.code = 'FORBIDDEN';
        throw error;
      }

      // Soft delete
      await prisma.productInstance.update({
        where: { id: productId },
        data: {
          archivedAt: new Date(),
        },
      });

      // Log to audit trail
      await prisma.auditLog.create({
        data: {
          entityType: 'ProductInstance',
          entityId: productId,
          action: 'ARCHIVE',
          userId,
          userName: 'User',
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
        appError.code = 'PRODUCT_DELETE_FAILED';
        throw appError;
      }
      throw error;
    }
  }

  /**
   * Get products by type (for tab views)
   * @param productType The type of products to fetch
   * @param userId User making the request
   * @param userRole Role of the user
   * @returns Leads with this product type
   */
  static async getLeadsByProductType(
    productType: ProductType,
    userId: string,
    userRole: string,
    options: {
      limit?: number;
      cursor?: string;
    } = {}
  ) {
    try {
      const { limit = 50, cursor } = options;

      // Build where clause
      const where: any = {
        productInstances: {
          some: {
            productType,
            archivedAt: null,
          },
        },
        archivedAt: null,
      };

      // COUNSELOR filter: only see leads they own
      if (userRole === 'COUNSELOR') {
        where.currentOwnerId = userId;
      }

      // Build query
      const query: any = {
        where,
        select: {
          id: true,
          leadCode: true,
          name: true,
          phone: true,
          email: true,
          country: true,
          intake: true,
          globalCallStatus: true,
          rescheduleDate: true,
          createdAt: true,
          updatedAt: true,
          productInstances: {
            where: {
              productType,
              archivedAt: null,
            },
            select: {
              id: true,
              productCode: true,
              productType: true,
              status: true,
              stage: true,
            },
          },
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

      const leads = await prisma.lead.findMany(query);

      // Determine if there are more results
      const hasMore = leads.length > limit;
      const result = hasMore ? leads.slice(0, limit) : leads;
      const nextCursor = hasMore ? result[result.length - 1]?.id : null;

      return {
        leads: result,
        nextCursor,
        hasMore,
      };
    } catch (error) {
      if (error instanceof Error) {
        const appError = new Error(error.message) as AppError;
        appError.statusCode = 500;
        appError.code = 'PRODUCT_TAB_VIEW_FAILED';
        throw appError;
      }
      throw error;
    }
  }
}
