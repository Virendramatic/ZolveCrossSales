import { prisma } from '../index';
import { AppError } from '../middleware/errorHandler';
import * as csv from 'csv-parse';

interface BulkLeadImportRow {
  name: string;
  phone: string;
  email?: string;
  country?: string;
  intake?: string;
  notes?: string;
}

export class BulkService {
  /**
   * Import leads from CSV data
   * @param csvData The CSV file content as string
   * @param userId The ID of the user performing the import
   * @param userName The name of the user
   * @returns Import result with success/failure counts
   */
  static async importLeads(
    csvData: string,
    userId: string,
    userName: string
  ): Promise<{
    totalRows: number;
    successCount: number;
    failureCount: number;
    failures: Array<{
      row: number;
      error: string;
      data: any;
    }>;
    createdLeadIds: string[];
  }> {
    try {
      const rows: BulkLeadImportRow[] = [];
      const failures: Array<{
        row: number;
        error: string;
        data: any;
      }> = [];
      const createdLeadIds: string[] = [];

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
          const appError = new Error(`CSV parsing error: ${error.message}`) as AppError;
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
              const lead = await prisma.lead.create({
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
            } catch (error) {
              failures.push({
                row: rowIndex,
                error: error instanceof Error ? error.message : 'Unknown error',
                data: row,
              });
            }
          }

          // Create audit log for bulk import
          await prisma.auditLog.create({
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
    } catch (error) {
      if (error instanceof Error && (error as AppError).statusCode) {
        throw error;
      }
      if (error instanceof Error) {
        const appError = new Error(error.message) as AppError;
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
  static async assignLeads(
    leadIds: string[],
    targetCounselorId: string,
    userId: string,
    userName: string
  ): Promise<{
    successCount: number;
    failureCount: number;
    failures: Array<{
      leadId: string;
      error: string;
    }>;
  }> {
    try {
      // Verify target counselor exists
      const counselor = await prisma.user.findUnique({
        where: { id: targetCounselorId },
        select: { id: true, role: true },
      });

      if (!counselor) {
        const error = new Error('Target counselor not found') as AppError;
        error.statusCode = 404;
        error.code = 'USER_NOT_FOUND';
        throw error;
      }

      if (counselor.role !== 'COUNSELOR' && counselor.role !== 'ADMIN') {
        const error = new Error('Target user is not a counselor') as AppError;
        error.statusCode = 400;
        error.code = 'INVALID_USER_ROLE';
        throw error;
      }

      const failures: Array<{
        leadId: string;
        error: string;
      }> = [];
      let successCount = 0;

      // Process each lead
      for (const leadId of leadIds) {
        try {
          // Verify lead exists
          const lead = await prisma.lead.findUnique({
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
          await prisma.lead.update({
            where: { id: leadId },
            data: {
              currentOwnerId: targetCounselorId,
              updatedAt: new Date(),
            },
          });

          // Also update product instances ownership
          await prisma.productInstance.updateMany({
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
        } catch (error) {
          failures.push({
            leadId,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      // Create audit log for bulk assignment
      await prisma.auditLog.create({
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
    } catch (error) {
      if (error instanceof Error && (error as AppError).statusCode) {
        throw error;
      }
      if (error instanceof Error) {
        const appError = new Error(error.message) as AppError;
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
  static async getStats(userId: string, userRole: string) {
    try {
      const where: any = {
        archivedAt: null,
      };

      if (userRole === 'COUNSELOR') {
        where.currentOwnerId = userId;
      }

      const [
        totalLeads,
        notCalled,
        responding,
        notResponding,
        converted,
      ] = await Promise.all([
        prisma.lead.count({ where }),
        prisma.lead.count({
          where: { ...where, globalCallStatus: 'NOT_CALLED' },
        }),
        prisma.lead.count({
          where: { ...where, globalCallStatus: 'RESPONDING' },
        }),
        prisma.lead.count({
          where: { ...where, globalCallStatus: 'NOT_RESPONDING' },
        }),
        prisma.lead.count({
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
    } catch (error) {
      if (error instanceof Error) {
        const appError = new Error(error.message) as AppError;
        appError.statusCode = 500;
        appError.code = 'STATS_FETCH_FAILED';
        throw appError;
      }
      throw error;
    }
  }
}
