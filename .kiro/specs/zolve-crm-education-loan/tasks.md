# Zolve CRM - Education Loan Product Implementation Tasks

## Overview

This document outlines implementation tasks specific to the Education Loan product module. These tasks build on top of the core CRM platform tasks and assume core infrastructure is in place.

**Prerequisite**: Core CRM Phase 1-4 tasks must be completed first.

---

## Phase 5: Education Loan Core (Building on Lead-First CRM)

### 5.1 Loan Application CRUD

- [x] 5.1.1 Implement create education loan endpoint
  - **Requirement**: Req 3 (Education Loan Application Management)
  - Create EducationLoanApplication record
  - Create ProductInstance with type="education_loan"
  - Validate: university, course, loan amount required
  - Set stage to "started"
  - Generate unique Loan ID (EL-XXXX)
  - Auto-create DocumentRequest based on collateral type
  - **Acceptance**: POST /api/loans creates loan, EL ID assigned, docs checklist generated

- [x] 5.1.2 Implement read education loan endpoint
  - **Requirement**: Req 3, 11 (Data Model, Integration)
  - Return full loan with: lenders, documents, stage history, comments
  - Include calculated fields (document progress %, avg lender score)
  - Check ownership permissions
  - **Acceptance**: GET /api/loans/:loanId returns complete loan object with relationships

- [x] 5.1.3 Implement list education loans with filtering
  - **Requirement**: Req 3 (Loan Management)
  - Filter by: loan stage, lender name, counselor, creation date
  - Paginate results (cursor-based, 50 per page)
  - Cache results (2 minute TTL, invalidate on updates)
  - **Acceptance**: GET /api/loans?stage=doc_pending returns filtered, paginated loans

- [x] 5.1.4 Implement update loan details endpoint
  - **Requirement**: Req 3 (Immutability of committed data)
  - Allow updates only in "started" stage
  - Updatable fields: university, course, loan amount, co-applicant info, collateral type
  - Immutable fields: lead ID, creation date, created user
  - Track all changes in audit log
  - **Acceptance**: PUT /api/loans/:loanId updates in started stage, rejects if advanced

- [x] 5.1.5 Implement soft-delete loan endpoint
  - **Requirement**: Req 13 (Data Persistence & Audit Trail)
  - Mark loan as archived
  - Cascade archive to lender applications and documents
  - Preserve all data in database
  - **Acceptance**: DELETE /api/loans/:loanId archives, not visible in active list

### 5.2 Loan Stage Management

- [x] 5.2.1 Implement loan stage update endpoint
  - **Requirement**: Req 4 (Application Stages and Workflow)
  - Validate transitions: started → docs_pending → docs_received → call_scheduled → sanctioned → disbursed
  - Prevent regression (no backward transitions)
  - Record: transition timestamp, responsible counselor, reason
  - Create StageHistory entry
  - **Acceptance**: PUT /api/loans/:loanId/stage updates stage, prevents regression, records history

- [x] 5.2.2 Implement stage history tracking
  - **Requirement**: Req 4 (Stage progression history)
  - Return: previous stages, transition dates, time in each stage, responsible users
  - **Acceptance**: GET /api/loans/:loanId/stage-history returns full progression

- [x] 5.2.3 Implement automatic stage transitions
  - **Requirement**: Req 4, 8 (Document workflow triggers stage)
  - When documents requested: auto-transition to "docs_pending"
  - When all documents approved: auto-transition to "docs_received"
  - Trigger notifications when auto-transitioning
  - **Acceptance**: DocumentRequest creation auto-transitions loan to docs_pending

### 5.3 Multi-Lender Coordination

- [x] 5.3.1 Implement add lender endpoint
  - **Requirement**: Req 5, 6 (Multi-Lender Coordination)
  - Create LenderApplication record
  - Set initial status to "interested"
  - Record match score and recommendation source (auto/manual)
  - **Acceptance**: POST /api/loans/:loanId/lenders creates lender, status="interested"

- [x] 5.3.2 Implement read lender endpoint
  - **Requirement**: Req 6 (Lender Application Tracking)
  - Return lender with: status history, sanction details, disbursement details, rejection reason
  - **Acceptance**: GET /api/loans/:loanId/lenders/:lenderId returns full lender details

- [x] 5.3.3 Implement list lenders endpoint
  - **Requirement**: Req 5 (Multiple lender applications)
  - Return all lenders for loan, sorted by match score
  - Show status of each
  - **Acceptance**: GET /api/loans/:loanId/lenders returns array sorted by score

- [x] 5.3.4 Implement update lender status endpoint
  - **Requirement**: Req 6 (Lender Application Tracking)
  - Allowed transitions: interested → applied → under_review → approved/rejected
  - On "approved": capture sanction details (amount, ROI, fee, validity)
  - On "rejected": capture rejection reason and date
  - On "disbursed": capture disbursement amount, date, tranche details
  - Record status change in LenderStatusHistory
  - **Acceptance**: PUT /api/loans/:loanId/lenders/:lenderId updates status, validates transitions

- [x] 5.3.5 Implement remove lender endpoint
  - **Requirement**: Req 5 (Multi-lender support)
  - Remove lender application
  - Only if not yet applied or rejected
  - **Acceptance**: DELETE /api/loans/:loanId/lenders/:lenderId removes (if allowed)

---

## Phase 6: Lender Matching Engine

### 6.1 Matcher Service

- [x] 6.1.1 Implement lender matcher service
  - **Requirement**: Req 5, 10 (Lender Matching and Recommendations)
  - Analyze: student eligibility, loan amount, course type, university reputation
  - Generate match scores (0-100) for each lender
  - Return ranked recommendations with reasons
  - **Acceptance**: Service returns recommendations sorted by score with explanations

- [x] 6.1.2 Implement match lenders endpoint
  - **Requirement**: Req 10 (Lender Matching Recommendations)
  - Call matcher service
  - Return recommendations with scores and factors
  - Auto-create LenderApplication records for recommended lenders
  - **Acceptance**: POST /api/loans/:loanId/match returns ranked lender list

- [x] 6.1.3 Implement re-run matcher endpoint
  - **Requirement**: Req 5 (Matcher for existing applications)
  - Re-analyze existing loan for lender pool changes
  - Update match scores
  - Suggest new lenders if entered pool
  - **Acceptance**: POST /api/loans/:loanId/match/rerun refreshes recommendations

- [x] 6.1.4 Implement lender pool management
  - **Requirement**: Req 10 (Lender Pool)
  - Manage active lenders (add/remove/update)
  - Cache lender pool (24 hour TTL)
  - Invalidate matcher cache when pool changes
  - **Acceptance**: GET /api/lenders/pool returns active lenders, can add/remove via admin

---

## Phase 7: Document Collection for Loans

### 7.1 Document Requests

- [x] 7.1.1 Implement document request creation
  - **Requirement**: Req 8, 9 (Document Collection and Checklists)
  - Create DocumentRequest for loan
  - Accept categories: kyc, academics, financials, collateral
  - Generate checklist based on categories and collateral type
  - Set deadline (default 14 days from now)
  - Transition loan stage to "docs_pending"
  - **Acceptance**: POST /api/loans/:loanId/document-request creates request, stage updated

- [x] 7.1.2 Implement document request details endpoint
  - **Requirement**: Req 8 (Document Collection Workflow)
  - Return request with all documents, completion status
  - Show: total required, received, approved
  - **Acceptance**: GET /api/loans/:loanId/document-request/:id returns status

- [x] 7.1.3 Implement document checklist generation
  - **Requirement**: Req 9 (Document Checklists and Requirements)
  - Define KYC docs: PAN, Aadhar, Passport, photos
  - Define Academic docs: 10th/12th scorecards, admit letter, degree
  - Define Financial docs: salary slips, bank statements, ITR
  - Define Collateral docs: property/vehicle/jewelry certificates (if applicable)
  - **Acceptance**: Checklists generated correctly based on collateral type

### 7.2 Document Submissions

- [x] 7.2.1 Implement document upload endpoint
  - **Requirement**: Req 8 (Document Submission Methods)
  - Accept file upload for specific document
  - Validate file type and size (< 10MB)
  - Store in S3 with signed URL
  - Create DocumentSubmission record
  - Set status to "submitted"
  - **Acceptance**: POST /api/loans/:loanId/documents uploads, returns signed URL

- [x] 7.2.2 Implement document approval endpoint
  - **Requirement**: Req 8 (Document Approval)
  - Mark document as approved
  - Check if all documents in request approved
  - Auto-transition loan stage to "docs_received" if complete
  - Send notification to student (if external)
  - **Acceptance**: PUT /api/loans/:loanId/documents/:id/approve approves, may trigger stage change

- [x] 7.2.3 Implement document rejection endpoint
  - **Requirement**: Req 8 (Document Rejection and Re-request)
  - Mark document as rejected
  - Record rejection reason
  - Allow re-submission without resetting entire request
  - Send notification to student
  - **Acceptance**: PUT /api/loans/:loanId/documents/:id/reject rejects, re-submission enabled

- [x] 7.2.4 Implement document version history
  - **Requirement**: Req 8 (Document Version History)
  - Track resubmissions of same document
  - Show version history with dates, statuses, approval/rejection
  - **Acceptance**: GET /api/loans/:loanId/documents/:id/versions returns all versions

- [x] 7.2.5 Implement document list endpoint
  - **Requirement**: Req 8, 9 (Document Status Display)
  - Return all documents for loan grouped by category
  - Show: name, category, status, submission date, approval date
  - **Acceptance**: GET /api/loans/:loanId/documents returns all documents with status

### 7.3 Document Validation

- [x] 7.3.1 Implement document type validation
  - **Requirement**: Req 9 (Document Type Validation)
  - Validate submitted document matches requested type
  - Basic validation: file extension, file size
  - **Acceptance**: Upload rejected if wrong document type

- [x] 7.3.2 Implement deadline tracking
  - **Requirement**: Req 9 (Deadline Tracking)
  - Track document request deadline
  - Alert counselor if deadline approaching (< 2 days)
  - Alert if deadline passed
  - **Acceptance**: Notifications sent for deadline alerts

---

## Phase 8: Integration with Core CRM

### 8.1 Lead-Loan Integration

- [x] 8.1.1 Implement loan visibility in All Leads view
  - **Requirement**: Req 12 (Education Loan in All Leads Context)
  - Show "Products Opted" column with Education Loan badge
  - Display loan stage as sub-badge
  - **Acceptance**: All Leads view shows Education Loan status for leads with loans

- [x] 8.1.2 Implement Education Loan tab view
  - **Requirement**: Req 5, 12 (Product Tab Views)
  - Education Loan tab shows leads with active loans
  - Columns: Lead Name, Loan Stage, Lenders Applied, Documents Pending
  - Filter by: stage, lender, document status
  - **Acceptance**: GET /api/leads/view/loans returns education loan leads with filters

- [x] 8.1.3 Implement lead detail popup loan context
  - **Requirement**: Req 5, 12 (Lead Detail Integration)
  - When clicking lead in All Leads, show Education Loan card
  - Display: current stage, lenders, documents pending, quick actions
  - Link to full loan detail
  - **Acceptance**: Lead detail shows loan card with key info

### 8.2 Comment & Audit Integration

- [ ] 8.2.1 Implement comments on loans
  - **Requirement**: Req 3, 14 (Comments Integration)
  - Comments added to lead are visible in loan context
  - Can add loan-specific comments from loan view
  - **Acceptance**: Comments shared between lead and loan views

- [ ] 8.2.2 Implement loan audit trails
  - **Requirement**: Req 13 (Audit Trail)
  - Log all loan operations: create, update, stage change, lender update, doc approval
  - Include: user, timestamp, action, changed fields
  - **Acceptance**: GET /api/admin/audit-logs shows all loan actions

### 8.3 Access Control

- [ ] 8.3.1 Implement loan ownership enforcement
  - **Requirement**: Req 6, 14, 15 (Lead Ownership, Access Control)
  - Counselors can only see/update loans they own (via ProductInstance)
  - Admins can see all loans
  - **Acceptance**: Counselor cannot access loan owned by another counselor

- [ ] 8.3.2 Implement loan reassignment
  - **Requirement**: Req 14 (Lead Reassignment)
  - When lead reassigned, loan moves with it to new counselor
  - Update ProductInstance ownership
  - Preserve all loan data and history
  - **Acceptance**: Lead reassignment updates loan ownership automatically

---

## Phase 9: Reporting & Analytics

### 9.1 Loan Metrics

- [ ] 9.1.1 Implement loan stage metrics
  - **Requirement**: Req 12 (Dashboard Reporting)
  - Count loans by stage
  - Average time in each stage
  - **Acceptance**: Dashboard shows loans by stage with timing

- [ ] 9.1.2 Implement lender performance metrics
  - **Requirement**: Req 12, 15 (Lender Performance)
  - Lender approval rate (sanctioned / applied)
  - Average disbursement time
  - Total approved amount
  - **Acceptance**: Reports show lender performance data

- [ ] 9.1.3 Implement conversion rate metrics
  - **Requirement**: Req 15 (Product Performance)
  - Leads to loan applications ratio
  - Loan application to sanctioned ratio
  - Loan sanctioned to disbursed ratio
  - **Acceptance**: Funnel metrics tracked and reportable

### 9.2 Counselor Performance

- [ ] 9.2.1 Implement counselor loan metrics
  - **Requirement**: Req 12 (Counselor Performance Reports)
  - Loans created per counselor
  - Loans sanctioned per counselor
  - Average loan cycle time
  - **Acceptance**: Reports show counselor-specific loan metrics

---

## Phase 10: Advanced Features

### 10.1 Notifications

- [ ] 10.1.1 Implement loan stage change notifications
  - **Requirement**: Req 10 (Follow-up Scheduling)
  - Email when loan stage changes
  - SMS reminder when documents due
  - **Acceptance**: Notifications sent on stage changes

- [ ] 10.1.2 Implement lender status notifications
  - **Requirement**: Req 6 (Status Change Recording)
  - Email when lender status updates (especially approvals)
  - Summary when multiple lenders approve/reject
  - **Acceptance**: Notifications sent on lender status changes

### 10.2 Bulk Operations

- [ ] 10.2.1 Implement bulk document request
  - **Requirement**: Req 5, 12 (Bulk Operations)
  - Request documents from multiple loans at once
  - Send bulk notifications
  - **Acceptance**: POST /api/loans/bulk/document-request requests docs from multiple loans

- [ ] 10.2.2 Implement bulk lender assignment
  - **Requirement**: Req 5, 6 (Lender Assignment)
  - Assign same lenders to multiple loans
  - Create lender applications in bulk
  - **Acceptance**: POST /api/loans/bulk/add-lenders adds to multiple loans

---

## Phase 11: Testing & Quality

### 11.1 Unit Tests

- [ ] 11.1.1 Test loan service business logic
  - **Requirement**: Quality assurance
  - Test stage transitions (valid/invalid)
  - Test lender status transitions
  - Test document completion logic
  - **Acceptance**: Service layer tests pass, 80%+ coverage

- [ ] 11.1.2 Test lender matcher algorithm
  - **Requirement**: Quality assurance
  - Test matching logic with various profiles
  - Test score calculations
  - **Acceptance**: Matcher tests pass, predictions reasonable

### 11.2 Integration Tests

- [ ] 11.2.1 Test loan API endpoints
  - **Requirement**: Quality assurance
  - Test create, read, update, list operations
  - Test access control
  - Test error cases
  - **Acceptance**: Endpoint integration tests pass

- [ ] 11.2.2 Test complete loan workflow
  - **Requirement**: Quality assurance
  - Test: create loan → add lenders → request docs → upload docs → approve → stage updates → disburse
  - **Acceptance**: E2E workflow test passes

- [ ] 11.2.3 Test access control
  - **Requirement**: Quality assurance
  - Test counselor cannot access other's loans
  - Test admin can access all loans
  - Test audit logging
  - **Acceptance**: Access control tests pass

---

## Phase 12: Performance & Optimization

### 12.1 Query Optimization

- [ ] 12.1.1 Add database indexes for loans
  - **Requirement**: Performance
  - Index on: loan_stage, counselor_zrm_id, created_at
  - Index on: education_loan_id (lender_applications)
  - Index on: document_request_id (document_submissions)
  - **Acceptance**: Queries < 100ms with proper indexes

- [ ] 12.1.2 Implement caching for recommendations
  - **Requirement**: Performance
  - Cache lender recommendations (2 hour TTL)
  - Invalidate on loan update or lender pool change
  - **Acceptance**: Recommendations cached, cache hit rate > 70%

### 12.2 Load Testing

- [ ] 12.2.1 Load test loan endpoints
  - **Requirement**: Performance
  - Simulate 1000 concurrent requests
  - Measure response times and error rates
  - **Acceptance**: All endpoints respond < 500ms under load

---

## Phase 13: Documentation

### 13.1 API Documentation

- [ ] 13.1.1 Document education loan endpoints
  - **Requirement**: Maintainability
  - Request/response examples for all endpoints
  - Error codes and handling
  - **Acceptance**: API docs complete, examples work

- [ ] 13.1.2 Document data models
  - **Requirement**: Maintainability
  - Document all entity relationships
  - Explain status transitions
  - **Acceptance**: Data model docs complete

### 13.2 Developer Guide

- [ ] 13.2.1 Create education loan module guide
  - **Requirement**: Maintainability
  - How to extend with new lenders
  - How to modify document checklists
  - **Acceptance**: Guide helps new developers understand module

---

## Summary Statistics

- **Total Tasks**: 48 education-loan-specific tasks
- **Prerequisite**: Core CRM Phases 1-4 (lead foundation)
- **Duration**: ~8-10 weeks (with core CRM already done)
- **Critical Path**: Core CRM → Loan CRUD → Lender Management → Documents
- **High Priority**: Phases 5-8 (core loan functionality)
- **Medium Priority**: Phases 9-11 (reporting, testing)
- **Lower Priority**: Phases 12-13 (optimization, documentation)

---

## Dependencies & Ordering

### Must Complete First (Core CRM)

1. Phase 1: Project Setup
2. Phase 2: Lead Management
3. Phase 3: Comments
4. Phase 4: Product Instances

### Then Education Loan Phases

5. Phase 5: Loan CRUD & Stage Management
6. Phase 6: Lender Matching
7. Phase 7: Document Management
8. Phase 8: CRM Integration
9-13: Testing, Reporting, Optimization

---

