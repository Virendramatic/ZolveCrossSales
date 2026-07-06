import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { prisma } from '../index';
import { EducationLoanService } from '../services/education-loan.service';

// Test fixtures
let testUserId: string;
let testLeadId: string;
let testLoanId: string;
let testLenderId: string;
let testDocRequestId: string;
let testDocumentId: string;

const TEST_USER_EMAIL = `testuser-${Date.now()}@test.com`;
const TEST_LEAD_NAME = `Test Lead ${Date.now()}`;

describe('Education Loan Service', () => {
  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: TEST_USER_EMAIL,
        name: 'Test Counselor',
        passwordHash: 'hashed_password',
        role: 'COUNSELOR',
      },
    });
    testUserId = user.id;

    // Create test lead
    const lead = await prisma.lead.create({
      data: {
        name: TEST_LEAD_NAME,
        phone: '9999999999',
        email: 'student@test.com',
        leadCode: `TEST-${Date.now()}`,
        createdByUserId: testUserId,
        currentOwnerId: testUserId,
      },
    });
    testLeadId = lead.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.educationLoanApplication.deleteMany({});
    await prisma.lead.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('Loan CRUD Operations', () => {
    it('should create an education loan application', async () => {
      const loanData = {
        university: 'Carnegie Mellon University',
        course: 'MS Computer Science',
        targetCountry: 'USA',
        totalLoanAmount: BigInt(4500000),
        expectedIntake: 'Fall 26',
        collateralType: 'NON_COLLATERAL' as const,
        coApplicantName: 'Parent Name',
        coApplicantType: 'SALARIED' as const,
      };

      const loan = await EducationLoanService.createLoan(
        testLeadId,
        loanData,
        testUserId,
        'COUNSELOR'
      );

      testLoanId = loan.id;

      expect(loan).toBeDefined();
      expect(loan.loanCode).toMatch(/^EL-\d+$/);
      expect(loan.university).toBe('Carnegie Mellon University');
      expect(loan.loanStage).toBe('STARTED');
      expect(loan.counselorZrmId).toBe(testUserId);
    });

    it('should prevent duplicate loans for same lead', async () => {
      const loanData = {
        university: 'MIT',
        course: 'MS Data Science',
        totalLoanAmount: BigInt(5000000),
        collateralType: 'NON_COLLATERAL' as const,
      };

      await expect(
        EducationLoanService.createLoan(testLeadId, loanData, testUserId, 'COUNSELOR')
      ).rejects.toThrow('Lead already has an active education loan');
    });

    it('should retrieve loan with relationships', async () => {
      const loan = await EducationLoanService.getLoanById(testLoanId, testUserId, 'COUNSELOR');

      expect(loan).toBeDefined();
      expect(loan.id).toBe(testLoanId);
      expect((loan as any).lead).toBeDefined();
      expect(Array.isArray((loan as any).lenderApplications)).toBe(true);
      expect(Array.isArray((loan as any).documentRequests)).toBe(true);
    });

    it('should list loans with pagination', async () => {
      const result = await EducationLoanService.listLoans(testUserId, 'COUNSELOR', {
        limit: 10,
        offset: 0,
      });

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.total).toBeGreaterThanOrEqual(1);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
    });

    it('should update loan details in STARTED stage', async () => {
      const updateData = {
        university: 'University of Chicago',
        totalLoanAmount: BigInt(4800000),
      };

      const updated = await EducationLoanService.updateLoanDetails(
        testLoanId,
        updateData,
        testUserId,
        'COUNSELOR'
      );

      expect(updated.university).toBe('University of Chicago');
      expect(updated.totalLoanAmount).toBe(BigInt(4800000));
    });

    it('should prevent updates to loan details after STARTED stage', async () => {
      // Move to DOCS_PENDING
      await EducationLoanService.updateLoanStage(
        testLoanId,
        { newStage: 'DOCS_PENDING' },
        testUserId,
        'COUNSELOR'
      );

      const updateData = {
        university: 'Another University',
      };

      await expect(
        EducationLoanService.updateLoanDetails(testLoanId, updateData, testUserId, 'COUNSELOR')
      ).rejects.toThrow('Loan details can only be updated in STARTED stage');
    });

    it('should soft-delete loan', async () => {
      // Create another loan for deletion
      const lead2 = await prisma.lead.create({
        data: {
          name: `Test Lead 2 ${Date.now()}`,
          phone: '8888888888',
          leadCode: `TEST2-${Date.now()}`,
          createdByUserId: testUserId,
          currentOwnerId: testUserId,
        },
      });

      const loanData = {
        university: 'Stanford University',
        course: 'MBA',
        totalLoanAmount: BigInt(3000000),
        collateralType: 'NON_COLLATERAL' as const,
      };

      const loan = await EducationLoanService.createLoan(
        lead2.id,
        loanData,
        testUserId,
        'COUNSELOR'
      );

      const archived = await EducationLoanService.deleteLoan(loan.id, testUserId, 'COUNSELOR');

      expect(archived.archivedAt).not.toBeNull();

      // Verify it's not in active list
      const result = await EducationLoanService.listLoans(testUserId, 'COUNSELOR', {});
      const archivedLoan = result.data.find((l) => l.id === loan.id);
      expect(archivedLoan).toBeUndefined();

      // Cleanup
      await prisma.lead.delete({ where: { id: lead2.id } });
    });
  });

  describe('Loan Stage Management', () => {
    it('should update loan stage with valid transition', async () => {
      const updated = await EducationLoanService.updateLoanStage(
        testLoanId,
        { newStage: 'DOCS_RECEIVED', reason: 'Test transition' },
        testUserId,
        'COUNSELOR'
      );

      expect(updated.loanStage).toBe('DOCS_RECEIVED');
    });

    it('should prevent invalid stage transitions', async () => {
      await expect(
        EducationLoanService.updateLoanStage(
          testLoanId,
          { newStage: 'STARTED' },
          testUserId,
          'COUNSELOR'
        )
      ).rejects.toThrow('Cannot transition from DOCS_RECEIVED to STARTED');
    });

    it('should track stage history', async () => {
      // Transition through multiple stages
      await EducationLoanService.updateLoanStage(
        testLoanId,
        { newStage: 'CALL_SCHEDULED' },
        testUserId,
        'COUNSELOR'
      );

      const loan = await EducationLoanService.getLoanById(testLoanId, testUserId, 'COUNSELOR');
      expect((loan as any).stageHistory).toBeDefined();
      expect((loan as any).stageHistory.length).toBeGreaterThan(0);
      expect((loan as any).stageHistory[0].newStage).toBe('CALL_SCHEDULED');
    });
  });

  describe('Lender Management', () => {
    it('should add lender to loan', async () => {
      const lenderData = {
        lenderName: 'HDFC Credila',
        matchScore: 85,
        recommendationSource: 'AUTO_RECOMMENDED' as const,
      };

      const lender = await EducationLoanService.addLender(
        testLoanId,
        lenderData,
        testUserId
      );

      testLenderId = lender.id;

      expect(lender).toBeDefined();
      expect(lender.lenderCode).toMatch(/^LA-\d+$/);
      expect(lender.lenderName).toBe('HDFC Credila');
      expect(lender.lenderStatus).toBe('INTERESTED');
      expect(lender.matchScore).toBe(85);
    });

    it('should prevent duplicate lenders', async () => {
      const lenderData = {
        lenderName: 'HDFC Credila',
        matchScore: 80,
        recommendationSource: 'MANUAL' as const,
      };

      await expect(
        EducationLoanService.addLender(testLoanId, lenderData, testUserId)
      ).rejects.toThrow('already added');
    });

    it('should retrieve lenders for loan', async () => {
      const lenders = await EducationLoanService.getLendersForLoan(
        testLoanId,
        testUserId,
        'COUNSELOR'
      );

      expect(Array.isArray(lenders)).toBe(true);
      expect(lenders.length).toBeGreaterThan(0);
      expect(lenders[0].lenderName).toBeDefined();
    });

    it('should get specific lender details', async () => {
      const lender = await EducationLoanService.getLenderById(
        testLoanId,
        testLenderId,
        testUserId,
        'COUNSELOR'
      );

      expect(lender).toBeDefined();
      expect(lender.id).toBe(testLenderId);
      expect((lender as any).statusHistory).toBeDefined();
    });

    it('should update lender status with valid transition', async () => {
      const statusUpdate = {
        lenderStatus: 'APPLIED' as const,
        reason: 'Documents submitted',
      };

      const updated = await EducationLoanService.updateLenderStatus(
        testLoanId,
        testLenderId,
        statusUpdate,
        testUserId,
        'COUNSELOR'
      );

      expect(updated.lenderStatus).toBe('APPLIED');
    });

    it('should update lender to APPROVED with sanction details', async () => {
      const statusUpdate = {
        lenderStatus: 'UNDER_REVIEW' as const,
      };

      await EducationLoanService.updateLenderStatus(
        testLoanId,
        testLenderId,
        statusUpdate,
        testUserId,
        'COUNSELOR'
      );

      const approvalUpdate = {
        lenderStatus: 'APPROVED' as const,
        sanctionAmount: BigInt(4200000),
        roi: 11.5,
        processingFee: BigInt(42000),
        sanctionDate: new Date(),
        sanctionValidity: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      };

      const approved = await EducationLoanService.updateLenderStatus(
        testLoanId,
        testLenderId,
        approvalUpdate,
        testUserId,
        'COUNSELOR'
      );

      expect(approved.lenderStatus).toBe('APPROVED');
      expect(approved.sanctionAmount).toBe(BigInt(4200000));
      // ROI comes as string from Decimal in Prisma
      expect(Number(approved.roi)).toBe(11.5);
      expect(approved.processingFee).toBe(BigInt(42000));
    });
  });

  describe('Document Management', () => {
    let newLoanId: string;

    it('should request documents and auto-transition stage', async () => {
      // Create new loan in STARTED stage
      const lead3 = await prisma.lead.create({
        data: {
          name: `Test Lead 3 ${Date.now()}`,
          phone: '7777777777',
          leadCode: `TEST3-${Date.now()}`,
          createdByUserId: testUserId,
          currentOwnerId: testUserId,
        },
      });

      const loanData = {
        university: 'Harvard University',
        course: 'PhD',
        totalLoanAmount: BigInt(6000000),
        collateralType: 'SECURED' as const,
      };

      const loan = await EducationLoanService.createLoan(
        lead3.id,
        loanData,
        testUserId,
        'COUNSELOR'
      );

      newLoanId = loan.id;

      expect(loan.loanStage).toBe('STARTED');

      const docRequestData = {
        categories: ['KYC' as const, 'ACADEMICS' as const, 'FINANCIALS' as const, 'COLLATERAL' as const],
      };

      const docRequest = await EducationLoanService.requestDocuments(
        loan.id,
        docRequestData,
        testUserId,
        'COUNSELOR'
      );

      testDocRequestId = docRequest.id;

      expect(docRequest).toBeDefined();
      expect(docRequest.docRequestCode).toMatch(/^DR-\d+$/);
      expect(docRequest.categories).toContain('KYC');
      expect(Array.isArray(docRequest.documents)).toBe(true);
      expect(docRequest.documents.length).toBeGreaterThan(0);

      // Verify loan stage was auto-updated
      const updatedLoan = await EducationLoanService.getLoanById(loan.id, testUserId, 'COUNSELOR');
      expect(updatedLoan.loanStage).toBe('DOCS_PENDING');

      // Cleanup
      await prisma.lead.delete({ where: { id: lead3.id } });
    });

    it('should generate correct documents based on collateral type', async () => {
      const docRequest = await EducationLoanService.getDocumentRequest(
        newLoanId,
        testDocRequestId,
        testUserId,
        'COUNSELOR'
      );

      expect(docRequest.documents).toBeDefined();

      // Should have KYC documents
      const kycDocs = docRequest.documents.filter((d) => d.category === 'KYC');
      expect(kycDocs.length).toBeGreaterThan(0);

      // Should have COLLATERAL documents since collateralType is SECURED
      const collateralDocs = docRequest.documents.filter((d) => d.category === 'COLLATERAL');
      expect(collateralDocs.length).toBeGreaterThan(0);

      testDocumentId = docRequest.documents[0].id;
    });

    it('should approve document', async () => {
      const approved = await EducationLoanService.approveDocument(
        newLoanId,
        testDocRequestId,
        testDocumentId,
        testUserId,
        'COUNSELOR'
      );

      expect(approved.status).toBe('APPROVED');
      expect(approved.approvedAt).not.toBeNull();
    });

    it('should reject document with reason', async () => {
      const docRequest = await EducationLoanService.getDocumentRequest(
        newLoanId,
        testDocRequestId,
        testUserId,
        'COUNSELOR'
      );

      const docToReject = docRequest.documents.find((d) => d.id !== testDocumentId);
      if (!docToReject) {
        throw new Error('No document found to reject');
      }

      const rejected = await EducationLoanService.rejectDocument(
        newLoanId,
        testDocRequestId,
        docToReject.id,
        'Document quality is poor',
        testUserId,
        'COUNSELOR'
      );

      expect(rejected.status).toBe('REJECTED');
      expect(rejected.rejectionReason).toBe('Document quality is poor');
    });
  });

  describe('RBAC and Permissions', () => {
    it('should prevent non-owner from accessing loan', async () => {
      const otherUser = await prisma.user.create({
        data: {
          email: `other-${Date.now()}@test.com`,
          name: 'Other Counselor',
          passwordHash: 'hashed_password',
          role: 'COUNSELOR',
        },
      });

      await expect(
        EducationLoanService.getLoanById(testLoanId, otherUser.id, 'COUNSELOR')
      ).rejects.toThrow('permission');

      // Cleanup
      await prisma.user.delete({ where: { id: otherUser.id } });
    });

    it('should allow admin to access any loan', async () => {
      const adminUser = await prisma.user.create({
        data: {
          email: `admin-${Date.now()}@test.com`,
          name: 'Admin User',
          passwordHash: 'hashed_password',
          role: 'ADMIN',
        },
      });

      const loan = await EducationLoanService.getLoanById(testLoanId, adminUser.id, 'ADMIN');
      expect(loan).toBeDefined();
      expect(loan.id).toBe(testLoanId);

      // Cleanup
      await prisma.user.delete({ where: { id: adminUser.id } });
    });
  });

  describe('Statistics', () => {
    it('should get loan statistics', async () => {
      const stats = await EducationLoanService.getLoanStats(testUserId, 'COUNSELOR');

      expect(stats).toBeDefined();
      expect(stats.totalLoans).toBeGreaterThanOrEqual(0);
      expect(stats.byStage).toBeDefined();
      expect(stats.lenderStatusBreakdown).toBeDefined();
    });
  });
});
