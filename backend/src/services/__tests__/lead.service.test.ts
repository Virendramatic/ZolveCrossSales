import { LeadService } from '../lead.service';
import { prisma } from '../../index';

// Mock prisma
jest.mock('../../index', () => ({
  prisma: {
    lead: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    productInstance: {
      updateMany: jest.fn(),
    },
  },
}));

describe('LeadService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new lead with NOT_CALLED status', async () => {
      const leadData = {
        name: 'John Doe',
        phone: '1234567890',
        email: 'john@example.com',
        country: 'USA',
        intake: 'Fall 2025',
      };

      const mockLead = {
        id: 'lead-123',
        leadCode: 'ZL-001',
        ...leadData,
        globalCallStatus: 'NOT_CALLED',
        rescheduleDate: null,
        createdByUserId: 'user-123',
        currentOwnerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.lead.create as jest.Mock).mockResolvedValue(mockLead);

      const result = await LeadService.create(leadData, 'user-123');

      expect(result).toEqual(mockLead);
      expect(prisma.lead.create).toHaveBeenCalledWith({
        data: {
          name: leadData.name,
          phone: leadData.phone,
          email: leadData.email,
          country: leadData.country,
          intake: leadData.intake,
          leadSource: null,
          notes: null,
          createdByUserId: 'user-123',
          globalCallStatus: 'NOT_CALLED',
        },
        select: expect.any(Object),
      });
    });
  });

  describe('getById', () => {
    it('admin should be able to get any lead', async () => {
      const mockLead = {
        id: 'lead-123',
        leadCode: 'ZL-001',
        name: 'John Doe',
        phone: '1234567890',
        email: 'john@example.com',
        country: 'USA',
        intake: 'Fall 2025',
        globalCallStatus: 'NOT_CALLED',
        rescheduleDate: null,
        createdByUserId: 'user-123',
        currentOwnerId: 'user-456',
        createdAt: new Date(),
        updatedAt: new Date(),
        productInstances: [],
        comments: [],
      };

      (prisma.lead.findUnique as jest.Mock).mockResolvedValue(mockLead);

      const result = await LeadService.getById('lead-123', 'admin-user', 'ADMIN');

      expect(result).toEqual(mockLead);
    });

    it('counselor should only be able to get leads they own', async () => {
      const mockLead = {
        id: 'lead-123',
        currentOwnerId: 'other-user',
        productInstances: [],
        comments: [],
      };

      (prisma.lead.findUnique as jest.Mock).mockResolvedValue(mockLead);

      const error = await LeadService.getById('lead-123', 'counselor-user', 'COUNSELOR').catch(e => e);

      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
    });

    it('should return null if lead does not exist', async () => {
      (prisma.lead.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await LeadService.getById('nonexistent', 'user-123', 'ADMIN');

      expect(result).toBeNull();
    });
  });

  describe('list', () => {
    it('should list leads with pagination', async () => {
      const mockLeads = [
        {
          id: 'lead-1',
          leadCode: 'ZL-001',
          name: 'Lead 1',
          phone: '1111111111',
          globalCallStatus: 'NOT_CALLED',
          createdAt: new Date(),
        },
        {
          id: 'lead-2',
          leadCode: 'ZL-002',
          name: 'Lead 2',
          phone: '2222222222',
          globalCallStatus: 'RESPONDING',
          createdAt: new Date(),
        },
      ];

      (prisma.lead.findMany as jest.Mock).mockResolvedValue(mockLeads);

      const result = await LeadService.list({
        userId: 'user-123',
        userRole: 'ADMIN',
        limit: 50,
      });

      expect(result.leads).toHaveLength(2);
      expect(result.nextCursor).toBeNull();
      expect(result.hasMore).toBe(false);
    });

    it('counselor should only see leads they own', async () => {
      const mockLeads = [
        { id: 'lead-1', currentOwnerId: 'counselor-123' },
      ];

      (prisma.lead.findMany as jest.Mock).mockResolvedValue(mockLeads);

      await LeadService.list({
        userId: 'counselor-123',
        userRole: 'COUNSELOR',
      });

      expect(prisma.lead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            currentOwnerId: 'counselor-123',
          }),
        })
      );
    });
  });

  describe('update', () => {
    it('should update lead fields', async () => {
      const oldLead = {
        id: 'lead-123',
        name: 'Old Name',
        phone: '1111111111',
        email: 'old@example.com',
        country: 'USA',
        intake: 'Fall 2025',
        notes: 'Old notes',
        currentOwnerId: 'user-123',
      };

      const updatedLead = {
        ...oldLead,
        name: 'New Name',
        phone: '9999999999',
        updatedAt: new Date(),
      };

      (prisma.lead.findUnique as jest.Mock).mockResolvedValue(oldLead);
      (prisma.lead.update as jest.Mock).mockResolvedValue(updatedLead);
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

      const result = await LeadService.update(
        'lead-123',
        { name: 'New Name', phone: '9999999999' },
        'user-123',
        'ADMIN'
      );

      expect(result.name).toBe('New Name');
      expect(result.phone).toBe('9999999999');
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });

    it('counselor can only update their own leads', async () => {
      (prisma.lead.findUnique as jest.Mock).mockResolvedValue({
        id: 'lead-123',
        currentOwnerId: 'other-user',
      });

      const error = await LeadService.update(
        'lead-123',
        { name: 'New Name' },
        'counselor-user',
        'COUNSELOR'
      ).catch(e => e);

      expect(error.statusCode).toBe(403);
    });

    it('should return 404 for nonexistent lead', async () => {
      (prisma.lead.findUnique as jest.Mock).mockResolvedValue(null);

      const error = await LeadService.update(
        'nonexistent',
        { name: 'New Name' },
        'user-123',
        'ADMIN'
      ).catch(e => e);

      expect(error.statusCode).toBe(404);
    });
  });

  describe('delete', () => {
    it('should soft delete a lead and archive product instances', async () => {
      (prisma.lead.findUnique as jest.Mock).mockResolvedValue({
        id: 'lead-123',
        currentOwnerId: 'user-123',
        archivedAt: null,
      });

      (prisma.lead.update as jest.Mock).mockResolvedValue({});
      (prisma.productInstance.updateMany as jest.Mock).mockResolvedValue({});
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

      const result = await LeadService.delete('lead-123', 'user-123', 'ADMIN');

      expect(result.success).toBe(true);
      expect(prisma.lead.update).toHaveBeenCalledWith({
        where: { id: 'lead-123' },
        data: { archivedAt: expect.any(Date) },
      });
      expect(prisma.productInstance.updateMany).toHaveBeenCalledWith({
        where: { leadId: 'lead-123' },
        data: { archivedAt: expect.any(Date) },
      });
    });

    it('counselor cannot delete leads they do not own', async () => {
      (prisma.lead.findUnique as jest.Mock).mockResolvedValue({
        id: 'lead-123',
        currentOwnerId: 'other-user',
      });

      const error = await LeadService.delete(
        'lead-123',
        'counselor-user',
        'COUNSELOR'
      ).catch(e => e);

      expect(error.statusCode).toBe(403);
    });
  });

  describe('updateCallStatus', () => {
    it('should update call status with audit log', async () => {
      const oldLead = {
        id: 'lead-123',
        currentOwnerId: 'user-123',
        globalCallStatus: 'NOT_CALLED',
      };

      const updatedLead = {
        ...oldLead,
        globalCallStatus: 'RESPONDING',
        updatedAt: new Date(),
      };

      (prisma.lead.findUnique as jest.Mock).mockResolvedValue(oldLead);
      (prisma.lead.update as jest.Mock).mockResolvedValue(updatedLead);
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

      const result = await LeadService.updateCallStatus(
        'lead-123',
        'RESPONDING',
        'user-123',
        'ADMIN'
      );

      expect(result.globalCallStatus).toBe('RESPONDING');
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'UPDATE',
            changes: expect.arrayContaining([
              expect.objectContaining({
                fieldName: 'globalCallStatus',
                oldValue: 'NOT_CALLED',
                newValue: 'RESPONDING',
              }),
            ]),
          }),
        })
      );
    });

    it('should reject invalid call status', async () => {
      (prisma.lead.findUnique as jest.Mock).mockResolvedValue({
        id: 'lead-123',
        currentOwnerId: 'user-123',
      });

      const error = await LeadService.updateCallStatus(
        'lead-123',
        'INVALID_STATUS',
        'user-123',
        'ADMIN'
      ).catch(e => e);

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('INVALID_CALL_STATUS');
    });
  });

  describe('setRescheduleDate', () => {
    it('should set reschedule date in the future', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const oldLead = {
        id: 'lead-123',
        currentOwnerId: 'user-123',
        rescheduleDate: null,
      };

      const updatedLead = {
        ...oldLead,
        rescheduleDate: futureDate,
      };

      (prisma.lead.findUnique as jest.Mock).mockResolvedValue(oldLead);
      (prisma.lead.update as jest.Mock).mockResolvedValue(updatedLead);
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

      const result = await LeadService.setRescheduleDate(
        'lead-123',
        futureDate,
        'user-123',
        'ADMIN'
      );

      expect(result.rescheduleDate).toEqual(futureDate);
    });

    it('should reject past or present reschedule dates', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const error = await LeadService.setRescheduleDate(
        'lead-123',
        pastDate,
        'user-123',
        'ADMIN'
      ).catch(e => e);

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('INVALID_RESCHEDULE_DATE');
    });
  });
});
