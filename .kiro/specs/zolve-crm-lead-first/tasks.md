# Zolve CRM - Lead-First Platform Implementation Tasks

## Overview

This document outlines all implementation tasks required to build the Zolve CRM backend. Tasks are organized by functional area and follow the design specification. Each task includes acceptance criteria and dependencies.

**Workflow**: Requirements-First | **Status**: Ready for Implementation

---

## Phase 1: Project Setup & Foundation

### 1.1 Initialize Backend Project

- [x] 1.1.1 Create Node.js/TypeScript project structure
  - Set up package.json with core dependencies (Express, Prisma, Zod, etc.)
  - Configure TypeScript with strict mode
  - Set up ESLint and Prettier
  - **Acceptance**: Project builds without errors, can run `npm run dev`

- [x] 1.1.2 Set up development environment configuration
  - Create .env.example with all required environment variables
  - Configure dotenv for local development
  - Set up different configurations for dev/test/production
  - **Acceptance**: Application loads all config from environment, no hardcoded values

- [x] 1.1.3 Initialize Git repository and CI/CD pipeline
  - Set up GitHub Actions for automated testing and linting
  - Configure pre-commit hooks
  - **Acceptance**: CI runs on every push, catches lint/type errors

### 1.2 Database Setup

- [x] 1.2.1 Set up PostgreSQL database and migrations
  - Create database schema (all tables from design doc)
  - Set up Prisma schema definition
  - Create initial migration
  - **Acceptance**: `prisma migrate deploy` creates all tables, schema matches design

- [x] 1.2.2 Create database indexes for performance
  - Add composite indexes on frequently queried columns
  - Add indexes on foreign keys
  - Document index strategy
  - **Acceptance**: All queries use indexes, query plans verified

- [x] 1.2.3 Seed development database
  - Create seed script with sample data
  - Populate leads, users, loans, comments, documents
  - Use realistic data for testing
  - **Acceptance**: `prisma db seed` creates 10+ leads with varied data

### 1.3 Authentication & Authorization

- [x] 1.3.1 Implement JWT authentication
  - Create JWT token generation (access + refresh tokens)
  - Implement token validation middleware
  - Store refresh tokens in Redis with expiry
  - **Acceptance**: POST /auth/login returns valid JWT, refresh endpoint works

- [x] 1.3.2 Implement role-based access control (RBAC)
  - Create permission model (Counselor vs Admin)
  - Implement permission checking middleware
  - Add permission validation to routes
  - **Acceptance**: Counselor cannot access leads they don't own, gets 403 error

- [x] 1.3.3 Set up password hashing and security
  - Implement bcrypt with salt rounds ≥ 12
  - Add password validation rules
  - Create password reset flow (TODO for phase 2)
  - **Acceptance**: Passwords hashed, cannot be retrieved, reset email sent

---

## Phase 2: Core Lead Management API

### 2.1 Lead CRUD Operations

- [x] 2.1.1 Implement create lead endpoint
  - Validate input with Zod schema
  - Generate unique Lead ID (ZL-XXXX)
  - Set initial call status to "Not Called"
  - Record creating user as originator
  - Log audit trail
  - **Acceptance**: POST /api/leads creates lead, returns with ID, appears in database

- [x] 2.1.2 Implement read lead endpoint
  - Get single lead with all relationships
  - Include product instances, comments count, documents count
  - Check permissions (counselor sees only assigned)
  - **Acceptance**: GET /api/leads/:id returns full lead object with relationships

- [x] 2.1.3 Implement list leads endpoint with filtering
  - Paginate results (cursor-based, 50 per page)
  - Filter by: status, call status, country, intake, ownership
  - Support sorting by: name, created date, status
  - Cache results (5 minute TTL)
  - **Acceptance**: GET /api/leads?status=hot&page=1 returns paginated results

- [x] 2.1.4 Implement update lead endpoint
  - Allow updating: name, phone, email, country, intake, notes
  - Prevent updating: id, created_by_user_id (immutable fields)
  - Track changes in audit log
  - Invalidate cache on update
  - **Acceptance**: PUT /api/leads/:id updates lead, audit log records change

- [ ] 2.1.5 Implement soft-delete lead endpoint
  - Mark lead as archived (set archived_at timestamp)
  - Soft-delete all associated data (comments, product instances)
  - Preserve all data in database
  - Log deletion
  - **Acceptance**: DELETE /api/leads/:id marks archived, not visible in active list

### 2.2 Lead Status & Call Tracking

- [ ] 2.2.1 Implement global call status update
  - Update Lead.global_call_status (Not Called, Responding, Not Responding, Converted)
  - Validate status transitions
  - Record timestamp and user
  - Broadcast update to all products of this lead
  - **Acceptance**: PUT /api/leads/:id/call-status updates and returns 200

- [ ] 2.2.2 Implement reschedule date management
  - Allow setting future reschedule date
  - Validate date is in future
  - Add reminder logic (placeholder for queue job)
  - Persist to database
  - **Acceptance**: PUT /api/leads/:id/reschedule sets date, validates future

- [ ] 2.2.3 Implement call status filtering
  - Filter All Leads by call status
  - Show leads needing follow-up ("Not Responding")
  - Show converted leads separately
  - **Acceptance**: GET /api/leads?callStatus=not_responding returns filtered list

### 2.3 Bulk Operations

- [ ] 2.3.1 Implement bulk lead import
  - Accept CSV/Excel file upload
  - Parse and validate: name, phone, email, country, intake, notes
  - Create multiple leads in transaction
  - Return success/failure count
  - Log import metadata
  - **Acceptance**: POST /api/leads/bulk-import uploads file, creates 10+ leads

- [ ] 2.3.2 Implement bulk lead assignment
  - Accept list of lead IDs and target counselor
  - Reassign ownership
  - Preserve all product instance relationships
  - Log bulk action in audit trail
  - **Acceptance**: POST /api/leads/bulk-assign assigns 50 leads to counselor

---

## Phase 3: Comments & Interaction History

### 3.1 Comment Management

- [ ] 3.1.1 Implement create comment endpoint
  - Add comment to lead
  - Record author, timestamp, content
  - Support internal vs external distinction
  - Validate permissions
  - **Acceptance**: POST /api/leads/:id/comments creates comment, visible to all team

- [ ] 3.1.2 Implement read comments endpoint
  - List all comments for a lead (reverse chronological)
  - Paginate results (20 per page)
  - Include author info and timestamp
  - **Acceptance**: GET /api/leads/:id/comments returns paginated comment list

- [ ] 3.1.3 Implement edit comment endpoint
  - Update comment text
  - Track original and edited text with timestamps
  - Record who edited
  - Validate author or admin
  - **Acceptance**: PUT /api/comments/:id updates text, preserves history

- [ ] 3.1.4 Implement soft-delete comment endpoint
  - Mark comment as deleted
  - Remove from view but preserve in audit
  - Only author or admin can delete
  - **Acceptance**: DELETE /api/comments/:id soft-deletes, not visible in list

### 3.2 Comment Search

- [ ] 3.2.1 Implement comment search
  - Full-text search across comment content
  - Filter by author, date range
  - Return matching comments with context
  - **Acceptance**: GET /api/comments/search?q=loan returns matching comments

---

## Phase 4: Product Instances & Multi-Product Framework

### 4.1 Product Instance Management

- [ ] 4.1.1 Implement create product instance endpoint
  - Link product to lead
  - Set product type (education_loan, remittance, accommodation, credit_card)
  - Enforce product limits (max 1 for loan/accommodation/card, unlimited for remittance)
  - Assign owner counselor
  - **Acceptance**: POST /api/leads/:id/products creates instance, enforces limits

- [ ] 4.1.2 Implement read product instance endpoint
  - Get product details with all relationships
  - Include product-specific status and stage
  - **Acceptance**: GET /api/leads/:id/products/:productId returns full object

- [ ] 4.1.3 Implement list product instances endpoint
  - Get all products for a lead
  - Include status of each
  - **Acceptance**: GET /api/leads/:id/products returns array of products

- [ ] 4.1.4 Implement product instance status update
  - Update product-specific status (independent of global call status)
  - Track status history
  - **Acceptance**: PUT /api/leads/:id/products/:productId/status updates independently

### 4.2 Product Tab Views

- [ ] 4.2.1 Implement All Leads view query
  - Return all leads with product list
  - Include global call status and reschedule date
  - Show product count badge
  - **Acceptance**: GET /api/leads/view/all-leads returns leads with products

- [ ] 4.2.2 Implement product-specific tab queries
  - Loans tab: leads with education_loan instances
  - Remittance tab: leads with remittance instances
  - Accommodation tab: leads with accommodation instances
  - Cards tab: leads with credit_card instances
  - **Acceptance**: GET /api/leads/view/loans returns only leads with loans

---

## Phase 5: Education Loan Applications

### 5.1 Loan Application CRUD

- [ ] 5.1.1 Implement create education loan endpoint
  - Create EducationLoanApplication linked to lead
  - Capture: university, course, target country, loan amount, collateral type, co-applicant info
  - Set initial stage to "Started"
  - Create ProductInstance with type="education_loan"
  - Create DocumentRequest based on collateral type
  - **Acceptance**: POST /api/loans creates loan, stage="started", document checklist created

- [ ] 5.1.2 Implement read education loan endpoint
  - Get loan with all relationships (lenders, documents, comments)
  - Include stage progression history
  - **Acceptance**: GET /api/loans/:loanId returns full loan object

- [ ] 5.1.3 Implement list education loans endpoint
  - List loans with filters (stage, lender, ownership)
  - Paginate results
  - **Acceptance**: GET /api/loans?stage=doc_pending returns filtered loans

- [ ] 5.1.4 Implement update education loan endpoint
  - Update loan details (only in "Started" stage)
  - Prevent updates after stage advances
  - Track changes in audit log
  - **Acceptance**: PUT /api/loans/:loanId updates, rejects if not in "Started" stage

### 5.2 Loan Stage Management

- [ ] 5.2.1 Implement loan stage update endpoint
  - Transition through stages: Started → Docs Pending → Docs Received → Call Scheduled → Sanctioned → Disbursed
  - Validate allowed transitions
  - Record transition timestamp, responsible counselor, reason
  - **Acceptance**: PUT /api/loans/:loanId/stage updates stage, prevents regression

- [ ] 5.2.2 Implement stage history tracking
  - Get loan stage progression history
  - Show time spent in each stage
  - **Acceptance**: GET /api/loans/:loanId/stage-history returns history with timestamps

---

## Phase 6: Multi-Lender Coordination

### 6.1 Lender Applications

- [ ] 6.1.1 Implement add lender endpoint
  - Create LenderApplication for loan
  - Set initial status to "Interested"
  - Record match score and recommendation source
  - **Acceptance**: POST /api/loans/:loanId/lenders creates lender record

- [ ] 6.1.2 Implement read lender endpoint
  - Get lender application with full details
  - Include status history and sanction/disbursement info
  - **Acceptance**: GET /api/loans/:loanId/lenders/:lenderId returns full object

- [ ] 6.1.3 Implement list lenders endpoint
  - Get all lenders for a loan
  - Sort by match score or status
  - **Acceptance**: GET /api/loans/:loanId/lenders returns array sorted by score

- [ ] 6.1.4 Implement update lender status endpoint
  - Update lender status (Interested → Applied → Under Review → Approved/Rejected → Disbursed)
  - Validate transitions
  - Capture sanction details when approved
  - Capture disbursement details when disbursed
  - Record rejection reason if rejected
  - **Acceptance**: PUT /api/loans/:loanId/lenders/:lenderId/status updates, validates transitions

### 6.2 Lender Matching

- [ ] 6.2.1 Implement lender matching endpoint
  - Call Lender Matcher service (placeholder or external API)
  - Receive ranked lender recommendations with scores
  - Create LenderApplication records for recommended lenders
  - Return recommendations to frontend
  - **Acceptance**: POST /api/loans/:loanId/match returns ranked lender list

- [ ] 6.2.2 Implement re-run matcher endpoint
  - Allow re-running matcher for existing loan
  - Update match scores
  - Suggest new lenders if pool changed
  - **Acceptance**: POST /api/loans/:loanId/match/rerun refreshes recommendations

---

## Phase 7: Document Management

### 7.1 Document Requests

- [ ] 7.1.1 Implement create document request endpoint
  - Create DocumentRequest for loan
  - Accept array of categories (KYC, Academics, Financials, Collateral)
  - Generate document checklist based on categories
  - Set deadline
  - Transition loan stage to "Docs Pending"
  - **Acceptance**: POST /api/loans/:loanId/document-request creates request, stage updated

- [ ] 7.1.2 Implement read document request endpoint
  - Get request with all documents
  - Show status of each document
  - **Acceptance**: GET /api/loans/:loanId/document-request/:id returns full request

- [ ] 7.1.3 Implement list document requests endpoint
  - Get all document requests for a loan
  - **Acceptance**: GET /api/loans/:loanId/document-requests returns array

### 7.2 Document Submissions

- [ ] 7.2.1 Implement document upload endpoint
  - Accept file upload for document
  - Validate file type and size
  - Store in S3 with signed URL
  - Create DocumentSubmission record
  - Set status to "Submitted"
  - **Acceptance**: POST /api/loans/:loanId/documents uploads file, returns URL

- [ ] 7.2.2 Implement document approval endpoint
  - Mark document as approved
  - Check if all documents in request approved
  - Auto-transition loan stage to "Docs Received" if complete
  - **Acceptance**: PUT /api/loans/:loanId/documents/:id/approve approves, may trigger stage change

- [ ] 7.2.3 Implement document rejection endpoint
  - Mark document as rejected
  - Record rejection reason
  - Require re-submission
  - **Acceptance**: PUT /api/loans/:loanId/documents/:id/reject records reason

- [ ] 7.2.4 Implement document version history
  - Track document resubmissions
  - Show version history with dates
  - **Acceptance**: GET /api/loans/:loanId/documents/:id/versions returns history

### 7.3 Document Checklists

- [ ] 7.3.1 Implement document category definitions
  - Define KYC documents: PAN, Aadhaar, Passport, etc.
  - Define Academic documents: Scorecards, Admit Letter, Degree, etc.
  - Define Financial documents: Salary Slips, Bank Statements, ITR, etc.
  - Define Collateral documents: Property, Vehicle, Jewelry, etc.
  - **Acceptance**: GET /api/documents/categories returns all categories with required docs

---

## Phase 8: Access Control & Security

### 8.1 Row-Level Security

- [ ] 8.1.1 Implement lead access control
  - Counselors can only access leads assigned to them
  - Admins can access all leads
  - Implement in middleware or query layer
  - Log unauthorized access attempts
  - **Acceptance**: Counselor querying unassigned lead gets 403 error

- [ ] 8.1.2 Implement product instance access control
  - Counselors can only access products they own
  - Admins can access all products
  - **Acceptance**: Counselor cannot update product they don't own

- [ ] 8.1.3 Implement comment access control
  - Team members can add comments to shared leads
  - Comments visible to all with access to lead
  - **Acceptance**: Comments visible to all team members with lead access

### 8.2 Audit Logging

- [ ] 8.2.1 Implement comprehensive audit logging
  - Log all create/update/delete operations
  - Record: entity type, entity ID, action, user, timestamp, changes
  - Store audit logs in database
  - **Acceptance**: All operations logged, audit logs queryable

- [ ] 8.2.2 Implement sensitive data access logging
  - Log access to PII (phone, email)
  - Log access to financial data
  - Record access reason (optional)
  - **Acceptance**: GET /api/admin/audit-logs shows access events

---

## Phase 9: Admin Dashboards & Reporting

### 9.1 Dashboard Metrics

- [ ] 9.1.1 Implement dashboard endpoint
  - Total active leads
  - Leads by status (hot, warm, cold, lost)
  - Leads by product
  - Conversion rate
  - **Acceptance**: GET /api/admin/dashboard returns metrics object

- [ ] 9.1.2 Implement education loan metrics
  - Total applications
  - Applications by stage
  - Lender conversion rates
  - Average time in each stage
  - **Acceptance**: GET /api/admin/dashboard/loans returns loan metrics

### 9.2 Reporting

- [ ] 9.2.1 Implement counselor performance report
  - Leads created, converted, by counselor
  - Average conversion time
  - Product cross-sell rate per counselor
  - **Acceptance**: GET /api/admin/reports/counselor returns performance data

- [ ] 9.2.2 Implement product performance report
  - Leads by product, conversion rate, revenue impact
  - **Acceptance**: GET /api/admin/reports/product returns metrics

- [ ] 9.2.3 Implement lender performance report
  - Lender approval rates, average disbursement time
  - **Acceptance**: GET /api/admin/reports/lender returns lender metrics

### 9.3 Export & Archive

- [ ] 9.3.1 Implement report export (CSV/PDF)
  - Export dashboard and reports to CSV/PDF
  - **Acceptance**: GET /api/admin/reports/export?format=csv downloads file

- [ ] 9.3.2 Implement data archiving
  - Archive old records for historical reporting
  - Support point-in-time queries
  - **Acceptance**: Can query leads as of specific past date

---

## Phase 10: Integration & Testing

### 10.1 External Integrations

- [ ] 10.1.1 Integrate with Lender Matcher service
  - API client for matcher (placeholder or external service)
  - Parse recommendations and score
  - Handle errors gracefully
  - **Acceptance**: Matcher returns ranked lenders, frontend displays

- [ ] 10.1.2 Integrate with document processing
  - OCR validation for uploaded documents (optional for phase 1)
  - File type validation
  - **Acceptance**: Documents validated on upload

- [ ] 10.1.3 Integrate with notification service
  - Email notifications for status updates
  - SMS reminders for reschedule dates (placeholder queue job)
  - **Acceptance**: Notifications configured, queue job defined

### 10.2 Testing

- [ ] 10.2.1 Write unit tests for services
  - Test all business logic (status transitions, validations)
  - Achieve 80%+ coverage on services
  - **Acceptance**: npm test passes, coverage reports generated

- [ ] 10.2.2 Write integration tests for API endpoints
  - Test each endpoint with valid/invalid inputs
  - Test access control and permissions
  - Test error handling
  - **Acceptance**: All endpoints tested, integration tests pass

- [ ] 10.2.3 Write end-to-end tests
  - Test complete workflows (create lead → add loan → add lender → upload docs)
  - Test multi-user scenarios
  - **Acceptance**: E2E tests pass, key workflows covered

---

## Phase 11: Performance & Optimization

### 11.1 Database Optimization

- [ ] 11.1.1 Analyze and optimize queries
  - Review slow queries with EXPLAIN ANALYZE
  - Add missing indexes
  - Optimize N+1 queries with JOINs/includes
  - **Acceptance**: All queries < 100ms for typical datasets

- [ ] 11.1.2 Implement query result caching
  - Cache lead listings (5 min TTL)
  - Cache user permissions (1 hour TTL)
  - Cache lender pool (24 hour TTL)
  - Invalidate on updates
  - **Acceptance**: Cache hit rate > 80% in load tests

### 11.2 API Performance

- [ ] 11.2.1 Implement pagination for large result sets
  - Cursor-based pagination for leads and loans
  - Consistent page size (50 items)
  - **Acceptance**: Large result sets paginated, response time < 500ms

- [ ] 11.2.2 Implement rate limiting
  - Rate limit by user (100 requests/minute)
  - Rate limit by IP (1000 requests/minute)
  - Return 429 when exceeded
  - **Acceptance**: Rate limiting enforced, 429 returns on excess

---

## Phase 12: Deployment & DevOps

### 12.1 Containerization

- [ ] 12.1.1 Create Docker configuration
  - Multi-stage Dockerfile for Node.js app
  - Optimize image size
  - **Acceptance**: Docker build succeeds, image runs correctly

- [ ] 12.1.2 Create Docker Compose for local development
  - Services: app, postgres, redis
  - Auto-setup on `docker-compose up`
  - **Acceptance**: docker-compose up -d starts all services

### 12.2 CI/CD Pipeline

- [ ] 12.2.1 Set up automated testing in GitHub Actions
  - Lint with ESLint
  - Type check with TypeScript
  - Run unit and integration tests
  - **Acceptance**: CI runs on every push, gates merges on failures

- [ ] 12.2.2 Set up automated deployment
  - Build and push Docker image on main branch merge
  - Deploy to staging environment
  - Run smoke tests
  - **Acceptance**: Merged code auto-deployed to staging

---

## Phase 13: Documentation & Handoff

### 13.1 API Documentation

- [ ] 13.1.1 Create API documentation
  - Document all endpoints with request/response examples
  - Swagger/OpenAPI spec generation
  - **Acceptance**: API docs accessible at /api/docs

### 13.2 Developer Guide

- [ ] 13.2.1 Create developer setup guide
  - Local development environment setup
  - Database setup
  - Running tests
  - **Acceptance**: New developer can get running in < 30 minutes

- [ ] 13.2.2 Create architecture documentation
  - System overview and data flows
  - Deployment guide
  - Troubleshooting guide
  - **Acceptance**: Documentation complete and accessible

---

## Summary Statistics

- **Total Tasks**: 71 implementation tasks
- **Estimated Duration**: 16-20 weeks (with 2-3 person team)
- **Critical Path**: Auth → Leads → Products → Loans → Documents → Testing
- **High Priority**: Phases 1-6 (core functionality)
- **Medium Priority**: Phases 7-9 (full feature set)
- **Lower Priority**: Phases 10-13 (quality, optimization, devops)

