# Zolve CRM - Lead-First Platform Technical Design

## Overview

This document outlines the backend architecture, data models, API design, and system components for the Zolve CRM lead-first platform. The design supports the frontend React application (built from Figma) and implements all requirements from the lead-first CRM requirements specification.

---

## Architecture Overview

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React/TypeScript)                  │
│                   (Frontend - Figma-based UI)                   │
└─────────────────────────────────────┬───────────────────────────┘
                                      │ REST/GraphQL API
                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Layer (Backend)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Lead Routes  │  │ Product APIs │  │ Auth/RBAC    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────┬───────────────────────────┘
                                      │
┌─────────────────────────────────────────────────────────────────┐
│              Business Logic & Service Layer                     │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐         │
│  │CRM Services │  │Product Svc   │  │Document Svc    │         │
│  └─────────────┘  └──────────────┘  └────────────────┘         │
└─────────────────────────────────────┬───────────────────────────┘
                                      │
┌─────────────────────────────────────────────────────────────────┐
│                  Data Access Layer (DAL)                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            Repository Pattern Implementation            │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────┬───────────────────────────┘
                                      │
┌─────────────────────────────────────────────────────────────────┐
│                    Data Layer                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ PostgreSQL   │  │  File Storage│  │ Redis Cache  │          │
│  │  (Primary DB)│  │ (Documents)  │  │ (Sessions)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend:**
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js (or alternative: NestJS for larger scale)
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for session management and caching
- **Authentication**: JWT tokens with refresh token rotation
- **File Storage**: AWS S3 (or local filesystem for development)
- **Logging**: Winston or Pino
- **Validation**: Zod or Joi

**Frontend (Already Built):**
- React 18.3.1 with TypeScript
- Vite build tool
- Tailwind CSS + shadcn/ui components
- Radix UI primitives

---

## Core Data Models

### 1. Lead (Master Entity)

```typescript
Lead {
  id: string                      // ZL-XXXX (auto-generated)
  name: string
  phone: string
  email?: string
  country: string
  intake: string                  // "Fall 26", "Spring 27", etc.
  
  // Relationship
  createdByUserId: string         // Immutable - who created the lead
  currentOwnerId: string          // Current counselor/owner
  
  // Global Status (visible across all products)
  globalCallStatus: enum          // "Not Called" | "Responding" | "Not Responding" | "Converted"
  rescheduleDate?: Date           // Next follow-up date (global)
  
  // Product tracking
  products: ProductInstance[]     // Array of attached products
  
  // Timestamps
  createdAt: Date                 // Immutable
  updatedAt: Date
  archivedAt?: Date               // Soft delete
  
  // Metadata
  leadSource: string              // "Direct" | "Referral" | "Bulk Upload"
  notes: string                   // Quick notes field
}

// Legacy field mapping for frontend compatibility:
// globalCallStatus: "Not Called" → callStatus: "not_attempted"
// globalCallStatus: "Responding" → callStatus: "connected"
// globalCallStatus: "Not Responding" → callStatus: "rescheduled"
// globalCallStatus: "Converted" → callStatus: "connected" (with conversion tracking)
```

### 2. Product Instance

```typescript
ProductInstance {
  id: string                      // PI-XXXX
  leadId: string                  // FK to Lead
  productType: enum               // "education_loan" | "remittance" | "accommodation" | "credit_card"
  
  // Product-specific status
  status: string                  // Product-dependent (loan stages, etc.)
  stage?: string                  // Product workflow stage
  
  // Ownership
  ownerUserId: string             // Which counselor owns this instance
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  archivedAt?: Date
}
```

### 3. Comment/Remark

```typescript
Comment {
  id: string                      // C-XXXX
  leadId: string                  // FK to Lead
  
  content: string
  authorId: string                // FK to User
  authorName: string              // Cached for display
  authorRole: string              // "Counselor" | "Admin"
  
  isInternal: boolean             // Internal only vs. shared with student
  
  // Audit
  createdAt: Date
  updatedAt?: Date
  editedBy?: string
  deletedAt?: Date                // Soft delete
}
```

### 4. User/Counselor

```typescript
User {
  id: string                      // U-XXXX
  email: string (unique)
  name: string
  phone?: string
  role: enum                      // "admin" | "counselor"
  
  // Access control
  permissions: string[]           // Fine-grained permissions
  status: enum                    // "active" | "inactive" | "suspended"
  
  // Authentication
  passwordHash: string
  lastLogin?: Date
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  deactivatedAt?: Date
}
```

### 5. Education Loan Application

```typescript
EducationLoanApplication {
  id: string                      // EL-XXXX
  leadId: string                  // FK to Lead
  productInstanceId: string       // FK to ProductInstance
  
  // Loan Details
  university: string
  course: string
  targetCountry: string
  totalLoanAmount: number         // In base currency (INR)
  expectedIntake: string          // "Fall 26", "Spring 27", etc.
  collateralType: enum            // "secured" | "unsecured"
  
  // Co-applicant
  coApplicantName?: string
  coApplicantType: enum           // "salaried" | "self-employed"
  
  // Application Workflow
  loanStage: enum                 // "started" | "docs_pending" | "docs_received" | 
                                  // "call_scheduled" | "sanctioned" | "disbursed"
  
  // Assignments
  counselorZRM: string            // Zolve Relationship Manager
  counselorLRM?: string           // Lender Relationship Manager
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  
  // Relationships
  lenderApplications: LenderApplication[]
  documentRequests: DocumentRequest[]
  stageHistory: StageHistory[]
}
```

### 6. Lender Application

```typescript
LenderApplication {
  id: string                      // LA-XXXX
  educationLoanId: string         // FK to EducationLoanApplication
  lenderName: string              // "Avanse", "HDFC Credila", etc.
  matchScore: number              // 0-100
  recommendationSource: enum      // "auto_recommended" | "manual"
  
  // Lender-specific status
  lenderStatus: enum              // "interested" | "applied" | "under_review" | 
                                  // "approved" | "rejected" | "disbursed" | "withdrawn"
  
  // Sanction Details (when approved)
  sanctionAmount?: number
  roi?: number
  processingFee?: number
  sanctionDate?: Date
  
  // Disbursement Details (when disbursed)
  disbursementAmount?: number
  disbursementDate?: Date
  tranchNumber?: number
  
  // Rejection Details (when rejected)
  rejectionReason?: string
  rejectionDate?: Date
  
  // Status tracking
  statusHistory: LenderStatusHistory[]
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}
```

### 7. Document Request

```typescript
DocumentRequest {
  id: string                      // DR-XXXX
  educationLoanId: string         // FK to EducationLoanApplication
  
  // Categories Requested
  categories: enum[]              // "kyc" | "academics" | "financials" | "collateral"
  
  // Timeline
  sentDate: Date
  deadline: Date
  
  // Status
  status: enum                    // "pending" | "partial_received" | "completed" | "expired"
  
  // Details
  documents: DocumentSubmission[]
}
```

### 8. Document Submission

```typescript
DocumentSubmission {
  id: string                      // DS-XXXX
  documentRequestId: string       // FK to DocumentRequest
  
  // Document Metadata
  name: string
  category: enum                  // "kyc" | "academics" | "financials" | "collateral"
  documentType: string            // "pan_card", "passport", etc.
  
  // Submission
  submissionMethod: enum          // "upload" | "email" | "manual_entry"
  submissionDate: Date
  fileUrl?: string                // S3 URL if file-based
  
  // Status
  status: enum                    // "not_started" | "submitted" | "approved" | "rejected"
  rejectionReason?: string
  
  // Version tracking
  versions: {
    fileUrl: string
    uploadDate: Date
  }[]
}
```

### 9. Audit Log

```typescript
AuditLog {
  id: string                      // AL-XXXX
  
  // What changed
  entityType: string              // "lead", "loan_application", etc.
  entityId: string
  action: enum                    // "create" | "update" | "delete" | "archive"
  
  // Who did it
  userId: string
  userName: string
  
  // Change details
  changes?: {
    fieldName: string
    oldValue: any
    newValue: any
  }[]
  
  // Sensitive access tracking
  sensitiveDataAccessed: boolean
  accessReason?: string
  
  // Timestamps
  timestamp: Date
}
```

---

## API Design

### RESTful Endpoints

#### Leads API

```
GET    /api/leads                        // List all leads (with filters)
POST   /api/leads                        // Create new lead
GET    /api/leads/:leadId                // Get lead details
PUT    /api/leads/:leadId                // Update lead
DELETE /api/leads/:leadId                // Soft delete lead
GET    /api/leads/:leadId/archive        // Get archived leads

// Bulk operations
POST   /api/leads/bulk-import            // Bulk import CSV/Excel
POST   /api/leads/bulk-assign            // Bulk assign to counselor

// Status & Call Tracking
PUT    /api/leads/:leadId/call-status    // Update global call status
PUT    /api/leads/:leadId/reschedule     // Set reschedule date
GET    /api/leads/:leadId/comments       // Get comments
POST   /api/leads/:leadId/comments       // Add comment
PUT    /api/leads/:leadId/comments/:id   // Edit comment
DELETE /api/leads/:leadId/comments/:id   // Delete comment

// Product Instances
GET    /api/leads/:leadId/products       // Get all product instances
POST   /api/leads/:leadId/products       // Add product instance
GET    /api/leads/:leadId/products/:productId
PUT    /api/leads/:leadId/products/:productId
```

#### Education Loan API

```
POST   /api/loans                        // Create new loan application
GET    /api/loans                        // List loans (with filters)
GET    /api/loans/:loanId                // Get loan details
PUT    /api/loans/:loanId                // Update loan details
GET    /api/loans/:loanId/lenders        // Get all lender applications

// Lender Management
POST   /api/loans/:loanId/lenders        // Add lender to application
PUT    /api/loans/:loanId/lenders/:lenderId
GET    /api/loans/:loanId/lenders/:lenderId

// Lender Matching
POST   /api/loans/:loanId/match          // Get lender recommendations
POST   /api/loans/:loanId/match/rerun    // Re-run matcher

// Document Management
POST   /api/loans/:loanId/document-request       // Request documents
GET    /api/loans/:loanId/document-request/:id   // Get request details
POST   /api/loans/:loanId/document-submissions   // Upload document
GET    /api/loans/:loanId/documents              // Get all documents

// Status Tracking
PUT    /api/loans/:loanId/stage          // Update loan stage
GET    /api/loans/:loanId/stage-history  // Get stage progression
```

#### Comments API

```
GET    /api/comments                     // Search comments
GET    /api/comments/:commentId          // Get comment details
POST   /api/comments                     // Create comment (supports lead context)
PUT    /api/comments/:commentId          // Edit comment
DELETE /api/comments/:commentId          // Soft delete comment
```

#### Admin APIs

```
GET    /api/admin/dashboard              // Dashboard metrics
GET    /api/admin/reports/counselor      // Counselor performance
GET    /api/admin/reports/product        // Product metrics
GET    /api/admin/reports/lender         // Lender metrics
GET    /api/admin/audit-logs             // Query audit logs
GET    /api/admin/users                  // User management
```

---

## Database Schema (PostgreSQL)

### Tables with Key Fields


### Core Tables

```sql
-- Users/Counselors
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL, -- 'admin' or 'counselor'
  password_hash VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deactivated_at TIMESTAMP
);

-- Leads (Master Entity)
CREATE TABLE leads (
  id VARCHAR(20) PRIMARY KEY, -- ZL-XXXX
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  country VARCHAR(100),
  intake VARCHAR(50),
  
  created_by_user_id UUID NOT NULL REFERENCES users(id),
  current_owner_id UUID REFERENCES users(id),
  
  global_call_status VARCHAR(50) DEFAULT 'not_called',
  reschedule_date DATE,
  
  lead_source VARCHAR(100),
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  archived_at TIMESTAMP,
  
  INDEX idx_lead_status (global_call_status),
  INDEX idx_lead_owner (current_owner_id),
  INDEX idx_lead_created (created_by_user_id)
);

-- Product Instances
CREATE TABLE product_instances (
  id VARCHAR(20) PRIMARY KEY, -- PI-XXXX
  lead_id VARCHAR(20) NOT NULL REFERENCES leads(id),
  product_type VARCHAR(50) NOT NULL,
  
  status VARCHAR(100),
  stage VARCHAR(100),
  
  owner_user_id UUID REFERENCES users(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  archived_at TIMESTAMP,
  
  INDEX idx_product_lead (lead_id),
  INDEX idx_product_type (product_type),
  INDEX idx_product_owner (owner_user_id)
);

-- Comments
CREATE TABLE comments (
  id VARCHAR(20) PRIMARY KEY, -- C-XXXX
  lead_id VARCHAR(20) NOT NULL REFERENCES leads(id),
  
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id),
  author_name VARCHAR(255),
  author_role VARCHAR(50),
  
  is_internal BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  edited_by UUID,
  deleted_at TIMESTAMP,
  
  INDEX idx_comment_lead (lead_id),
  INDEX idx_comment_author (author_id)
);

-- Education Loan Applications
CREATE TABLE education_loan_applications (
  id VARCHAR(20) PRIMARY KEY, -- EL-XXXX
  lead_id VARCHAR(20) NOT NULL REFERENCES leads(id),
  product_instance_id VARCHAR(20) REFERENCES product_instances(id),
  
  university VARCHAR(255) NOT NULL,
  course VARCHAR(255) NOT NULL,
  target_country VARCHAR(100),
  total_loan_amount DECIMAL(12, 2),
  expected_intake VARCHAR(50),
  collateral_type VARCHAR(50),
  
  co_applicant_name VARCHAR(255),
  co_applicant_type VARCHAR(50),
  
  loan_stage VARCHAR(50) DEFAULT 'started',
  
  counselor_zrm_id UUID REFERENCES users(id),
  counselor_lrm_id UUID REFERENCES users(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_loan_lead (lead_id),
  INDEX idx_loan_stage (loan_stage),
  INDEX idx_loan_zrm (counselor_zrm_id)
);

-- Lender Applications
CREATE TABLE lender_applications (
  id VARCHAR(20) PRIMARY KEY, -- LA-XXXX
  education_loan_id VARCHAR(20) NOT NULL REFERENCES education_loan_applications(id),
  
  lender_name VARCHAR(255) NOT NULL,
  match_score INTEGER,
  recommendation_source VARCHAR(50),
  
  lender_status VARCHAR(50) DEFAULT 'interested',
  
  sanction_amount DECIMAL(12, 2),
  roi DECIMAL(5, 2),
  processing_fee DECIMAL(12, 2),
  sanction_date DATE,
  
  disbursement_amount DECIMAL(12, 2),
  disbursement_date DATE,
  tranche_number INTEGER,
  
  rejection_reason TEXT,
  rejection_date DATE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_lender_loan (education_loan_id),
  INDEX idx_lender_status (lender_status)
);

-- Document Requests
CREATE TABLE document_requests (
  id VARCHAR(20) PRIMARY KEY, -- DR-XXXX
  education_loan_id VARCHAR(20) NOT NULL REFERENCES education_loan_applications(id),
  
  categories TEXT NOT NULL, -- JSON array of categories
  
  sent_date TIMESTAMP,
  deadline DATE,
  
  status VARCHAR(50) DEFAULT 'pending',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_doc_req_loan (education_loan_id)
);

-- Document Submissions
CREATE TABLE document_submissions (
  id VARCHAR(20) PRIMARY KEY, -- DS-XXXX
  document_request_id VARCHAR(20) NOT NULL REFERENCES document_requests(id),
  
  name VARCHAR(255),
  category VARCHAR(50),
  document_type VARCHAR(100),
  
  submission_method VARCHAR(50),
  submission_date TIMESTAMP,
  file_url TEXT,
  
  status VARCHAR(50) DEFAULT 'not_started',
  rejection_reason TEXT,
  
  versions JSONB, -- Array of {fileUrl, uploadDate}
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_doc_sub_req (document_request_id)
);

-- Audit Logs
CREATE TABLE audit_logs (
  id VARCHAR(20) PRIMARY KEY, -- AL-XXXX
  
  entity_type VARCHAR(100),
  entity_id VARCHAR(100),
  action VARCHAR(50),
  
  user_id UUID NOT NULL,
  user_name VARCHAR(255),
  
  changes JSONB,
  
  sensitive_data_accessed BOOLEAN DEFAULT false,
  access_reason TEXT,
  
  timestamp TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_audit_entity (entity_type, entity_id),
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_time (timestamp)
);
```

---

## Authentication & Authorization

### JWT Token Strategy

```typescript
// Access Token (15 minutes)
{
  sub: userId,
  email: string,
  name: string,
  role: 'admin' | 'counselor',
  permissions: string[],
  iat: number,
  exp: number
}

// Refresh Token (7 days, stored in httpOnly cookie)
{
  sub: userId,
  tokenVersion: number,
  iat: number,
  exp: number
}
```

### Permission Model

```
Counselor Permissions:
- lead:view:assigned      (View leads assigned to them)
- lead:update:assigned    (Update assigned leads)
- lead:comment:add        (Add comments)
- product:view:assigned   (View products they own)
- product:update:assigned (Update products they own)
- document:upload         (Upload documents)
- loan:view:assigned      (View loans they own)

Admin Permissions:
- lead:view:all           (View all leads)
- lead:create             (Create leads)
- lead:update:any         (Update any lead)
- lead:delete:any         (Delete/archive any lead)
- lead:assign             (Assign leads to counselors)
- product:manage:any      (Manage any product)
- user:manage             (Manage users)
- audit:view              (View audit logs)
- report:generate         (Generate reports)
- export:data             (Export data)
```

---

## API Response Formats

### Success Response

```typescript
{
  success: true,
  data: T,
  meta?: {
    timestamp: ISO8601,
    requestId: string,
    page?: number,
    pageSize?: number,
    total?: number
  }
}
```

### Error Response

```typescript
{
  success: false,
  error: {
    code: string,           // "LEAD_NOT_FOUND", "UNAUTHORIZED"
    message: string,
    details?: Record<string, string>,
    requestId: string,
    timestamp: ISO8601
  }
}
```

---

## Service Layer Architecture

### Core Services

1. **LeadService**
   - createLead()
   - getLead()
   - updateLead()
   - deleteLead()
   - bulkImportLeads()
   - assignLead()
   - updateCallStatus()
   - setRescheduleDate()

2. **EducationLoanService**
   - createLoanApplication()
   - getLoanApplication()
   - updateLoanStage()
   - addLenderApplication()
   - getLenderRecommendations()
   - updateLenderStatus()

3. **DocumentService**
   - requestDocuments()
   - submitDocument()
   - approveDocument()
   - rejectDocument()
   - getDocumentStatus()

4. **CommentService**
   - addComment()
   - editComment()
   - deleteComment()
   - getComments()
   - searchComments()

5. **AuthService**
   - authenticate()
   - generateTokens()
   - refreshToken()
   - revokeToken()
   - validatePermissions()

6. **AuditService**
   - logAction()
   - logAccessEvent()
   - queryAuditLogs()

7. **ReportingService**
   - getDashboardMetrics()
   - getCounselorPerformance()
   - getProductMetrics()
   - getLenderMetrics()

---

## Caching Strategy

- **Redis Cache Keys:**
  - `lead:{leadId}` - Lead details (TTL: 5 min)
  - `user:{userId}:permissions` - User permissions (TTL: 1 hour)
  - `lender_pool` - Active lenders list (TTL: 24 hours)
  - `recommendations:{loanId}` - Lender recommendations (TTL: 2 hours)

- **Cache Invalidation:**
  - On lead update: Clear `lead:{leadId}`
  - On user role change: Clear `user:{userId}:permissions`
  - On lender pool change: Clear `lender_pool` and all recommendation caches

---

## File Storage

### Document Storage Structure

```
s3://zolve-crm-documents/
├── leads/{leadId}/
│   ├── documents/{documentId}/{fileName}
│   └── avatars/{fileName}
└── loans/{loanId}/
    ├── documents/{documentId}/{fileName}
    └── supporting/{fileName}
```

### Signed URL Generation

- All file uploads/downloads use pre-signed URLs (15-minute expiry)
- Server never exposes raw S3 credentials
- Audit logs track all file access

---

## Error Handling

### Standard Error Codes

```
400 - BAD_REQUEST (validation failure)
401 - UNAUTHORIZED (not authenticated)
403 - FORBIDDEN (insufficient permissions)
404 - NOT_FOUND (resource not found)
409 - CONFLICT (duplicate, constraint violation)
429 - RATE_LIMITED (too many requests)
500 - INTERNAL_ERROR (server error)
```

---

## Scalability Considerations

1. **Database Indexing**: All foreign keys, status fields, and frequently queried columns indexed
2. **Query Optimization**: Implement pagination, cursor-based pagination for large result sets
3. **Asynchronous Processing**: Document processing, email notifications, report generation via message queue (Bull/Kafka)
4. **Horizontal Scaling**: Stateless API servers behind load balancer
5. **Connection Pooling**: Database connection pooling via Prisma
6. **Rate Limiting**: Per-user rate limits to prevent abuse

---

## Security Considerations

1. **Input Validation**: All inputs validated using Zod schemas
2. **SQL Injection Prevention**: Parameterized queries via Prisma ORM
3. **CORS**: Configured for frontend domain only
4. **HTTPS**: All communications encrypted
5. **Password Security**: bcrypt with salt rounds ≥ 12
6. **Sensitive Data**: PII encrypted at rest and in transit
7. **Audit Trail**: All data access logged
8. **Rate Limiting**: Prevent brute force attacks on authentication
9. **CSRF Protection**: CSRF tokens for state-changing operations

---

## Monitoring & Observability

- **Logging**: Structured logging (Winston/Pino) for all API calls and errors
- **Metrics**: Prometheus metrics for request latency, error rates, database performance
- **Tracing**: Distributed tracing for complex operations
- **Alerting**: Alert on error rate spikes, database latency, service availability

---

## Integration Points

1. **Lender Matching Engine**: External service/algorithm that ranks lenders
2. **Document Processing**: OCR/validation service for uploaded documents
3. **Email Service**: SendGrid/SES for notifications
4. **SMS Service**: Twilio for SMS reminders
5. **Analytics**: PostHog/Mixpanel for user behavior tracking
6. **Payment Gateway**: Integration for future fee collection (optional)

---

## Deployment Architecture

```
┌─────────────────┐
│  GitHub Actions │ (CI/CD)
└────────┬────────┘
         │
    ┌────▼─────┐
    │ Build &  │
    │ Test     │
    └────┬─────┘
         │
    ┌────▼──────────────┐
    │ Docker Container  │
    └────┬──────────────┘
         │
    ┌────▼────────────────────────┐
    │ AWS ECS / Kubernetes Cluster│
    │ (Multiple availability zones)│
    └────┬─────────────────────────┘
         │
    ┌────▼────────┐  ┌──────────────┐  ┌──────────┐
    │ RDS Postgres│  │ ElastiCache  │  │ S3 Bucket│
    │ (Multi-AZ)  │  │ (Redis)      │  │(Docs)    │
    └─────────────┘  └──────────────┘  └──────────┘
```

---

## Frontend-Backend Data Mapping

### Mapping Frontend Types to Backend Models

#### Lead (Frontend) → Lead + ProductInstance (Backend)

Frontend `Lead` interface:
```typescript
interface Lead {
  id: string;                   // Backend: Lead.id
  name: string;                 // Backend: Lead.name
  phone: string;                // Backend: Lead.phone
  products: string[];           // Backend: ProductInstance[] of Lead
  status: LeadStatus;           // Backend: Derived from product stages (hot/warm/cold/lost)
  callStatus: CallStatus;       // Backend: Mapped from global_call_status
  rescheduleDate: string;       // Backend: Lead.reschedule_date
  intake: string;               // Backend: Lead.intake
  country: string;              // Backend: Lead.country
  loanAppId?: string;           // Backend: ProductInstance.id where product_type = "education_loan"
}
```

**Status Calculation:**
- `hot`: Lead has sanctioned loan or multiple active products
- `warm`: Lead has applications in progress
- `cold`: Lead has been contacted but inactive (> 7 days no updates)
- `lost`: Lead marked as converted elsewhere or no contact for > 30 days

#### LoanApp (Frontend) → EducationLoanApplication + LenderApplication (Backend)

Frontend `LoanApp` interface:
```typescript
interface LoanApp {
  id: string;                   // Backend: EducationLoanApplication.id
  zlId: string;                 // Backend: EducationLoanApplication.lead_id
  student: string;              // Backend: Lead.name (joined)
  university: string;           // Backend: EducationLoanApplication.university
  course: string;               // Backend: EducationLoanApplication.course
  targetCountry: string;        // Backend: EducationLoanApplication.target_country
  intake: string;               // Backend: EducationLoanApplication.expected_intake
  loanAmount: string;           // Backend: EducationLoanApplication.total_loan_amount
  loanType: "collateral" | "non-collateral";  // Backend: collateral_type
  coAppType: "salaried" | "self-employed";    // Backend: co_applicant_type
  stage: LoanStage;             // Backend: EducationLoanApplication.loan_stage
  zrm: string;                  // Backend: User.name (counselor_zrm_id)
  lrm: string;                  // Backend: User.name (counselor_lrm_id)
  callStatus: CallStatus;       // Backend: Mapped from Lead.global_call_status
  connectivityStatus: string;   // Backend: Derived from call attempts (via Comments/Remarks)
  abroadStatus: string;         // Backend: Tracked in remarks/metadata
  lenders: LenderInfo[];        // Backend: LenderApplication[]
  docs: DocChecklist;           // Backend: DocumentSubmission[]
  notes: string[];              // Backend: Comment[] where is_internal = true
  rescheduleDate: string;       // Backend: Lead.reschedule_date
}

LoanStage Mapping:
- Backend: "started" → Frontend: "application_started"
- Backend: "docs_pending" → Frontend: "doc_pending"
- Backend: "docs_received" → Frontend: "doc_received"
- Backend: "call_scheduled" → Frontend: "call_scheduled"
- Backend: "sanctioned" → Frontend: "sanctioned"
- Backend: "disbursed" → Frontend: "disbursed"
- Backend: archived/soft-deleted → Frontend: "lost"
```

#### LenderInfo (Frontend) → LenderApplication (Backend)

Frontend `LenderInfo` interface:
```typescript
interface LenderInfo {
  name: string;                 // Backend: LenderApplication.lender_name
  pos: number;                  // Backend: LenderApplication.match_score
  stage: LenderStage;           // Backend: LenderApplication.lender_status
  loginDate?: string;           // Backend: LenderApplication.created_at
  loginAmt?: string;            // Backend: Not stored (frontend derives)
  sanctionDate?: string;        // Backend: LenderApplication.sanction_date
  sanctionAmt?: string;         // Backend: LenderApplication.sanction_amount
  roi?: string;                 // Backend: LenderApplication.roi
  pfAmt?: string;               // Backend: LenderApplication.processing_fee
  pfDate?: string;              // Backend: LenderApplication.sanction_date
  disbDate?: string;            // Backend: LenderApplication.disbursement_date
  disbAmt?: string;             // Backend: LenderApplication.disbursement_amount
  trancheNo?: string;           // Backend: LenderApplication.tranche_number
}

LenderStage Mapping:
- Backend: "interested" → Frontend: "not_applied"
- Backend: "applied" → Frontend: "applied"
- Backend: "under_review" → Frontend: "under_review"
- Backend: "approved" → Frontend: "sanctioned"
- Backend: "rejected" → Frontend: "rejected"
- Backend: "disbursed" → Frontend: "disbursed"
- Backend: "withdrawn" → Frontend: "withdrawn"
```

#### DocChecklist (Frontend) → DocumentSubmission[] (Backend)

Frontend `DocChecklist` interface has 4 categories (p0-p3):
- **p0**: KYC Documents
- **p1**: Academic Documents
- **p2**: Financial Documents
- **p3**: Collateral Documents (empty if non-collateral)

Backend mapping via `DocumentSubmission.category`:
```typescript
// Frontend: p0 documents
// Backend: DocumentSubmission[] where category = 'kyc'

// Frontend: p1 documents
// Backend: DocumentSubmission[] where category = 'academics'

// Frontend: p2 documents
// Backend: DocumentSubmission[] where category = 'financials'

// Frontend: p3 documents
// Backend: DocumentSubmission[] where category = 'collateral'

// Document status mapping:
// Backend: not_started → Frontend: uploaded = false
// Backend: submitted → Frontend: uploaded = true (but status pending)
// Backend: approved → Frontend: uploaded = true
// Backend: rejected → Frontend: uploaded = false (needs resubmit)
```

---

## Critical Data Flows

### Create New Education Loan

**Frontend Action:**
1. User clicks "Apply Loan" button on Lead detail
2. Opens `NewLoanModal` with Lead prefilled
3. User enters: University, Course, Loan Amount, etc.
4. User selects: Lenders or chooses "Get Recommendations"

**Backend Flow:**
1. `POST /api/loans` with:
   - `leadId`: string
   - `university`, `course`, `totalLoanAmount`, etc.
   - `selectedLenders`: string[] (optional)

2. Backend actions:
   - Validate input (Zod schema)
   - Create `EducationLoanApplication` record
   - Create `ProductInstance` with type="education_loan"
   - If `selectedLenders` provided:
     - Create `LenderApplication` for each
   - Else:
     - Call Lender Matcher service
     - Create `LenderApplication` for recommended lenders
   - Create `DocumentRequest` (auto-populate based on collateral type)
   - Log audit trail
   - Return created loan with all relationships

3. Frontend receives:
```typescript
{
  id: "EL-XXXX",
  zlId: "ZL-XXXX",
  stage: "started",
  lenders: [],  // Empty until matcher runs or lenders selected
  docs: DocChecklist,  // Auto-populated checklist
  ...
}
```

### Update Lender Status

**Frontend Action:**
1. Admin opens Loan Detail
2. Updates lender status (e.g., "Applied" → "Under Review")
3. Modal confirms and saves

**Backend Flow:**
1. `PUT /api/loans/:loanId/lenders/:lenderId` with:
   - `lenderStatus`: string
   - `notes`: string (optional)

2. Backend actions:
   - Validate new status is valid transition
   - Update `LenderApplication.lender_status`
   - Create `LenderStatusHistory` record
   - If status is "approved": capture sanction details
   - If status is "disbursed": capture disbursement details
   - Log audit trail
   - Trigger notification (if applicable)
   - Return updated lender application

### Update Document Status

**Frontend Action:**
1. Counselor views loan documents
2. Approves documents or requests resubmission
3. System updates checklist

**Backend Flow:**
1. `PUT /api/loans/:loanId/documents/:documentId` with:
   - `status`: "approved" | "rejected"
   - `rejectionReason`: string (if rejected)

2. Backend actions:
   - Update `DocumentSubmission.status`
   - Create version history entry
   - Check if all documents in request approved
   - If all approved: Auto-trigger loan stage update to "docs_received"
   - Log audit trail
   - Trigger notification
   - Return updated document status

---

## Query Patterns & Performance

### High-Volume Queries

1. **All Leads Tab**: Fetch paginated leads with product counts
   - Query: `SELECT leads.*, COUNT(product_instances.id) FROM leads LEFT JOIN product_instances ...`
   - Index: `(global_call_status, archived_at, created_at DESC)`
   - Cache: 5-minute TTL
   - Pagination: Cursor-based, 50 records per page

2. **Loans Tab**: Fetch loans with lender statuses
   - Query: Multiple JOINs with lender_applications
   - Index: `(loan_stage, created_at DESC)`
   - Cache: 2-minute TTL
   - Pagination: Cursor-based

3. **Comments on Lead**: Fetch comment history
   - Query: `SELECT * FROM comments WHERE lead_id = ? AND deleted_at IS NULL ORDER BY created_at DESC`
   - Index: `(lead_id, deleted_at, created_at DESC)`
   - Pagination: Load 20 comments, lazy-load on scroll

### Reporting Queries

- Use materialized views or pre-computed metrics in separate `metrics` table
- Run nightly batch jobs to compute:
  - Daily active leads
  - Conversion rates by product
  - Average time in each loan stage
  - Lender success rates

---

## Error Handling in Mappings

### Common Issues

1. **Lead Status Conflicts**
   - If lead assigned to multiple counselors for different products
   - Frontend shows aggregated view; backend maintains per-product ownership

2. **Document Category Mismatches**
   - If p3 (collateral) documents sent for non-collateral loan
   - Backend rejects with validation error
   - Frontend prevents selection based on collateral type

3. **Lender Status Transitions**
   - Backend validates allowed transitions:
     - `interested` → `applied` or skip to `withdrawn`
     - `applied` → `under_review` or `withdrawn`
     - `under_review` → `approved` or `rejected`
     - `approved` → `disbursed`
     - Any status → `withdrawn`
   - Frontend enforces same rules in UI

---

## Real-Time Updates (Optional Future Enhancement)

When implemented, use WebSocket for:
- Live comment updates
- Lender status changes
- Document upload notifications
- Assignment updates

Server-Sent Events (SSE) as simpler alternative:
- Per-user feed of relevant updates
- Automatic reconnection on disconnect

---

