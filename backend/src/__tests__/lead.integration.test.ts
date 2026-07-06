import request from 'supertest';
import { app, prisma } from '../index';
import * as jwt from 'jsonwebtoken';

// Helper to generate test JWT
function generateTestJWT(userId: string, role: 'ADMIN' | 'COUNSELOR' = 'ADMIN') {
  const token = jwt.sign(
    { sub: userId, email: 'test@example.com', name: 'Test User', role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
  return token;
}

describe('Lead Integration Tests', () => {
  let adminToken: string;
  let counselorToken: string;
  let testLeadId: string;
  let adminUserId = 'admin-user-1';
  let counselorUserId = 'counselor-user-1';

  beforeAll(async () => {
    // Create test users
    await prisma.user.createMany({
      data: [
        {
          id: adminUserId,
          email: 'admin@test.com',
          name: 'Admin User',
          role: 'ADMIN',
          passwordHash: 'hashed',
        },
        {
          id: counselorUserId,
          email: 'counselor@test.com',
          name: 'Counselor User',
          role: 'COUNSELOR',
          passwordHash: 'hashed',
        },
      ],
      skipDuplicates: true,
    });

    adminToken = generateTestJWT(adminUserId, 'ADMIN');
    counselorToken = generateTestJWT(counselorUserId, 'COUNSELOR');
  });

  afterAll(async () => {
    // Cleanup
    await prisma.lead.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/leads - Create Lead', () => {
    it('should create a new lead with valid data', async () => {
      const response = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'John Doe',
          phone: '+91 9876543210',
          email: 'john@example.com',
          country: 'India',
          intake: 'Fall 2026',
          leadSource: 'Direct',
          notes: 'Test lead',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('leadCode');
      expect(response.body.data.name).toBe('John Doe');
      expect(response.body.data.globalCallStatus).toBe('NOT_CALLED');

      testLeadId = response.body.data.id;
    });

    it('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Jane Doe',
          // phone is missing
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/leads')
        .send({
          name: 'Test',
          phone: '1234567890',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/leads - List Leads', () => {
    it('should list leads with pagination', async () => {
      const response = await request(app)
        .get('/api/leads?limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.leads)).toBe(true);
      expect(response.body.data).toHaveProperty('hasMore');
      expect(response.body.data).toHaveProperty('nextCursor');
    });

    it('admin should see all leads', async () => {
      const response = await request(app)
        .get('/api/leads')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('counselor should only see their own leads', async () => {
      // First assign a lead to the counselor
      await prisma.lead.update({
        where: { id: testLeadId },
        data: { currentOwnerId: counselorUserId },
      });

      const response = await request(app)
        .get('/api/leads')
        .set('Authorization', `Bearer ${counselorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should filter by call status', async () => {
      const response = await request(app)
        .get('/api/leads?callStatus=NOT_CALLED')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.leads).toHaveLength(1);
    });

    it('should filter by country', async () => {
      const response = await request(app)
        .get('/api/leads?country=India')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/leads/:id - Get Single Lead', () => {
    it('should get lead details', async () => {
      const response = await request(app)
        .get(`/api/leads/${testLeadId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testLeadId);
      expect(response.body.data).toHaveProperty('productInstances');
      expect(response.body.data).toHaveProperty('comments');
    });

    it('should return 404 for non-existent lead', async () => {
      const response = await request(app)
        .get('/api/leads/nonexistent')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });

    it('counselor should not see leads they do not own', async () => {
      // Update lead to be owned by admin
      await prisma.lead.update({
        where: { id: testLeadId },
        data: { currentOwnerId: adminUserId },
      });

      const response = await request(app)
        .get(`/api/leads/${testLeadId}`)
        .set('Authorization', `Bearer ${counselorToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/leads/:id - Update Lead', () => {
    it('should update lead fields', async () => {
      const response = await request(app)
        .put(`/api/leads/${testLeadId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Jane Doe Updated',
          phone: '+91 9999999999',
          notes: 'Updated notes',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Jane Doe Updated');
      expect(response.body.data.phone).toBe('+91 9999999999');
    });

    it('counselor can only update their own leads', async () => {
      // Assign lead to counselor
      await prisma.lead.update({
        where: { id: testLeadId },
        data: { currentOwnerId: counselorUserId },
      });

      const response = await request(app)
        .put(`/api/leads/${testLeadId}`)
        .set('Authorization', `Bearer ${counselorToken}`)
        .send({ name: 'New Name' });

      expect(response.status).toBe(200);
    });

    it('counselor cannot update leads they do not own', async () => {
      await prisma.lead.update({
        where: { id: testLeadId },
        data: { currentOwnerId: adminUserId },
      });

      const response = await request(app)
        .put(`/api/leads/${testLeadId}`)
        .set('Authorization', `Bearer ${counselorToken}`)
        .send({ name: 'New Name' });

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/leads/:id/call-status - Update Call Status', () => {
    it('should update call status', async () => {
      const response = await request(app)
        .put(`/api/leads/${testLeadId}/call-status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ globalCallStatus: 'RESPONDING' });

      expect(response.status).toBe(200);
      expect(response.body.data.globalCallStatus).toBe('RESPONDING');
    });

    it('should reject invalid call status', async () => {
      const response = await request(app)
        .put(`/api/leads/${testLeadId}/call-status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ globalCallStatus: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/leads/:id/reschedule - Reschedule Lead', () => {
    it('should set future reschedule date', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const response = await request(app)
        .put(`/api/leads/${testLeadId}/reschedule`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ rescheduleDate: futureDate.toISOString() });

      expect(response.status).toBe(200);
      expect(response.body.data.rescheduleDate).toBeDefined();
    });

    it('should reject past reschedule dates', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const response = await request(app)
        .put(`/api/leads/${testLeadId}/reschedule`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ rescheduleDate: pastDate.toISOString() });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/leads/:id - Soft Delete Lead', () => {
    it('should soft delete a lead', async () => {
      // Create a new lead to delete
      const createRes = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'To Delete',
          phone: '9999999999',
          country: 'India',
        });

      const leadId = createRes.body.data.id;

      const response = await request(app)
        .delete(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify lead is archived
      const getRes = await request(app)
        .get('/api/leads')
        .set('Authorization', `Bearer ${adminToken}`);

      const archivedLead = getRes.body.data.leads.find((l: any) => l.id === leadId);
      expect(archivedLead).toBeUndefined();
    });
  });
});
