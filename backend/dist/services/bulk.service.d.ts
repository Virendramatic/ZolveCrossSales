export declare class BulkService {
    /**
     * Import leads from CSV data
     * @param csvData The CSV file content as string
     * @param userId The ID of the user performing the import
     * @param userName The name of the user
     * @returns Import result with success/failure counts
     */
    static importLeads(csvData: string, userId: string, userName: string): Promise<{
        totalRows: number;
        successCount: number;
        failureCount: number;
        failures: Array<{
            row: number;
            error: string;
            data: any;
        }>;
        createdLeadIds: string[];
    }>;
    /**
     * Bulk assign leads to a counselor
     * @param leadIds Array of lead IDs to assign
     * @param targetCounselorId The ID of the target counselor
     * @param userId The ID of the user performing the assignment
     * @param userName The name of the user
     * @returns Assignment result
     */
    static assignLeads(leadIds: string[], targetCounselorId: string, userId: string, userName: string): Promise<{
        successCount: number;
        failureCount: number;
        failures: Array<{
            leadId: string;
            error: string;
        }>;
    }>;
    /**
     * Get bulk operation status
     * @returns Statistics about leads
     */
    static getStats(userId: string, userRole: string): Promise<{
        totalLeads: number;
        byCallStatus: {
            notCalled: number;
            responding: number;
            notResponding: number;
            converted: number;
        };
    }>;
}
//# sourceMappingURL=bulk.service.d.ts.map