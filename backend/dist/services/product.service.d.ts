import { ProductType } from '@prisma/client';
export declare class ProductService {
    /**
     * Create a product instance for a lead
     * @param leadId The ID of the lead
     * @param productType The type of product
     * @param ownerUserId The ID of the user owning this product
     * @returns The created product instance
     * @throws 404 if lead not found
     * @throws 400 if product limits violated
     */
    static create(leadId: string, productType: ProductType, ownerUserId?: string): Promise<{
        status: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        archivedAt: Date | null;
        productCode: string;
        leadId: string;
        productType: import(".prisma/client").$Enums.ProductType;
        stage: string | null;
        ownerUserId: string | null;
        completedAt: Date | null;
    }>;
    /**
     * Get a product instance by ID
     * @param productId The ID of the product
     * @param userId User making the request (for permission check)
     * @param userRole Role of the user
     * @returns The product instance or null if not found
     * @throws 403 if user doesn't have permission
     */
    static getById(productId: string, userId: string, userRole: string): Promise<{
        status: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        archivedAt: Date | null;
        productCode: string;
        leadId: string;
        productType: import(".prisma/client").$Enums.ProductType;
        stage: string | null;
        ownerUserId: string | null;
        completedAt: Date | null;
        educationLoan: {
            id: string;
            loanCode: string;
            loanStage: import(".prisma/client").$Enums.LoanStage;
        } | null;
    } | null>;
    /**
     * List products for a lead
     * @param leadId The ID of the lead
     * @param userId User making the request (for permission check)
     * @param userRole Role of the user
     * @returns Array of products
     */
    static listByLead(leadId: string, userId: string, userRole: string): Promise<{
        status: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productCode: string;
        leadId: string;
        productType: import(".prisma/client").$Enums.ProductType;
        stage: string | null;
        ownerUserId: string | null;
        completedAt: Date | null;
        educationLoan: {
            id: string;
            loanCode: string;
            loanStage: import(".prisma/client").$Enums.LoanStage;
        } | null;
    }[]>;
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
    static updateStatus(productId: string, status: string, userId: string, userRole: string): Promise<{
        status: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productCode: string;
        leadId: string;
        productType: import(".prisma/client").$Enums.ProductType;
        stage: string | null;
        ownerUserId: string | null;
        completedAt: Date | null;
    }>;
    /**
     * Archive a product instance
     * @param productId The ID of the product
     * @param userId User making the request
     * @param userRole Role of the user
     * @returns Success confirmation
     * @throws 403 if user doesn't have permission
     * @throws 404 if product not found
     */
    static delete(productId: string, userId: string, userRole: string): Promise<{
        success: boolean;
    }>;
    /**
     * Get products by type (for tab views)
     * @param productType The type of products to fetch
     * @param userId User making the request
     * @param userRole Role of the user
     * @returns Leads with this product type
     */
    static getLeadsByProductType(productType: ProductType, userId: string, userRole: string, options?: {
        limit?: number;
        cursor?: string;
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
}
//# sourceMappingURL=product.service.d.ts.map