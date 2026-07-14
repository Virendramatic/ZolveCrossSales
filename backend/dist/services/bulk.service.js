"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkService = void 0;
const index_1 = require("../index");
const csv = __importStar(require("csv-parse"));
class BulkService {
    /**
     * Import leads from CSV data
     * @param csvData The CSV file content as string
     * @param userId The ID of the user performing the import
     * @param userName The name of the user
     * @returns Import result with success/failure counts
     */
    static async importLeads(csvData, userId, userName) {
        try {
            const rows = [];
            const failures = [];
            const createdLeadIds = [];
            // Parse CSV data
            return new Promise((resolve, reject) => {
                const parser = csv.parse({
                    columns: true,
                    skip_empty_lines: true,
                    relax_column_count: true,
                });
                let rowNumber = 1;
                parser.on('readable', function () {
                    let record;
                    while ((record = parser.read()) !== null) {
                        rowNumber++;
                        rows.push(record);
                    }
                });
                parser.on('error', (error) => {
                    const appError = new Error(`CSV parsing error: ${error.message}`);
                    appError.statusCode = 400;
                    appError.code = 'CSV_PARSE_ERROR';
                    reject(appError);
                });
                parser.on('end', async () => {
                    // Process each row
                    for (let i = 0; i < rows.length; i++) {
                        const row = rows[i];
                        const rowIndex = i + 2; // +2 because header is row 1, data starts at row 2
                        try {
                            // Validate required fields
                            if (!row.name || !row.phone) {
                                failures.push({
                                    row: rowIndex,
                                    error: 'Missing required fields: name and phone are required',
                                    data: row,
                                });
                                continue;
                            }
                            // Validate phone format (basic)
                            if (!/^\+?[\d\s\-()]+$/.test(row.phone)) {
                                failures.push({
                                    row: rowIndex,
                                    error: 'Invalid phone number format',
                                    data: row,
                                });
                                continue;
                            }
                            // Validate email if provided
                            if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
                                failures.push({
                                    row: rowIndex,
                                    error: 'Invalid email format',
                                    data: row,
                                });
                                continue;
                            }
                            // Create lead
                            const lead = await index_1.prisma.lead.create({
                                data: {
                                    name: row.name.trim(),
                                    phone: row.phone.trim(),
                                    email: row.email ? row.email.trim() : null,
                                    country: row.country ? row.country.trim() : null,
                                    intake: row.intake ? row.intake.trim() : null,
                                    notes: row.notes ? row.notes.trim() : null,
                                    leadSource: 'BULK_IMPORT',
                                    createdByUserId: userId,
                                    globalCallStatus: 'NOT_CALLED',
                                },
                                select: {
                                    id: true,
                                    leadCode: true,
                                },
                            });
                            createdLeadIds.push(lead.id);
                        }
                        catch (error) {
                            failures.push({
                                row: rowIndex,
                                error: error instanceof Error ? error.message : 'Unknown error',
                                data: row,
                            });
                        }
                    }
                    // Create audit log for bulk import
                    await index_1.prisma.auditLog.create({
                        data: {
                            entityType: 'Lead',
                            entityId: 'BULK_IMPORT',
                            action: 'CREATE',
                            userId,
                            userName,
                        },
                    });
                    resolve({
                        totalRows: rows.length,
                        successCount: createdLeadIds.length,
                        failureCount: failures.length,
                        failures,
                        createdLeadIds,
                    });
                });
                parser.write(csvData);
                parser.end();
            });
        }
        catch (error) {
            if (error instanceof Error && error.statusCode) {
                throw error;
            }
            if (error instanceof Error) {
                const appError = new Error(error.message);
                appError.statusCode = 500;
                appError.code = 'BULK_IMPORT_FAILED';
                throw appError;
            }
            throw error;
        }
    }
    /**
     * Bulk assign leads to a counselor
     * @param leadIds Array of lead IDs to assign
     * @param targetCounselorId The ID of the target counselor
     * @param userId The ID of the user performing the assignment
     * @param userName The name of the user
     * @returns Assignment result
     */
    static async assignLeads(leadIds, targetCounselorId, userId, userName) {
        try {
            // Verify target counselor exists
            const counselor = await index_1.prisma.user.findUnique({
                where: { id: targetCounselorId },
                select: { id: true, role: true },
            });
            if (!counselor) {
                const error = new Error('Target counselor not found');
                error.statusCode = 404;
                error.code = 'USER_NOT_FOUND';
                throw error;
            }
            if (counselor.role !== 'COUNSELOR' && counselor.role !== 'ADMIN') {
                const error = new Error('Target user is not a counselor');
                error.statusCode = 400;
                error.code = 'INVALID_USER_ROLE';
                throw error;
            }
            const failures = [];
            let successCount = 0;
            // Process each lead
            for (const leadId of leadIds) {
                try {
                    // Verify lead exists
                    const lead = await index_1.prisma.lead.findUnique({
                        where: { id: leadId },
                        select: { id: true, currentOwnerId: true },
                    });
                    if (!lead) {
                        failures.push({
                            leadId,
                            error: 'Lead not found',
                        });
                        continue;
                    }
                    // Update lead owner
                    await index_1.prisma.lead.update({
                        where: { id: leadId },
                        data: {
                            currentOwnerId: targetCounselorId,
                            updatedAt: new Date(),
                        },
                    });
                    // Also update product instances ownership
                    await index_1.prisma.productInstance.updateMany({
                        where: {
                            leadId,
                            archivedAt: null,
                        },
                        data: {
                            ownerUserId: targetCounselorId,
                            updatedAt: new Date(),
                        },
                    });
                    successCount++;
                }
                catch (error) {
                    failures.push({
                        leadId,
                        error: error instanceof Error ? error.message : 'Unknown error',
                    });
                }
            }
            // Create audit log for bulk assignment
            await index_1.prisma.auditLog.create({
                data: {
                    entityType: 'Lead',
                    entityId: 'BULK_ASSIGN',
                    action: 'UPDATE',
                    userId,
                    userName,
                },
            });
            return {
                successCount,
                failureCount: failures.length,
                failures,
            };
        }
        catch (error) {
            if (error instanceof Error && error.statusCode) {
                throw error;
            }
            if (error instanceof Error) {
                const appError = new Error(error.message);
                appError.statusCode = 500;
                appError.code = 'BULK_ASSIGN_FAILED';
                throw appError;
            }
            throw error;
        }
    }
    /**
     * Get bulk operation status
     * @returns Statistics about leads
     */
    static async getStats(userId, userRole) {
        try {
            const where = {
                archivedAt: null,
            };
            if (userRole === 'COUNSELOR') {
                where.currentOwnerId = userId;
            }
            const [totalLeads, notCalled, responding, notResponding, converted,] = await Promise.all([
                index_1.prisma.lead.count({ where }),
                index_1.prisma.lead.count({
                    where: { ...where, globalCallStatus: 'NOT_CALLED' },
                }),
                index_1.prisma.lead.count({
                    where: { ...where, globalCallStatus: 'RESPONDING' },
                }),
                index_1.prisma.lead.count({
                    where: { ...where, globalCallStatus: 'NOT_RESPONDING' },
                }),
                index_1.prisma.lead.count({
                    where: { ...where, globalCallStatus: 'CONVERTED' },
                }),
            ]);
            return {
                totalLeads,
                byCallStatus: {
                    notCalled,
                    responding,
                    notResponding,
                    converted,
                },
            };
        }
        catch (error) {
            if (error instanceof Error) {
                const appError = new Error(error.message);
                appError.statusCode = 500;
                appError.code = 'STATS_FETCH_FAILED';
                throw appError;
            }
            throw error;
        }
    }
}
exports.BulkService = BulkService;
//# sourceMappingURL=bulk.service.js.map