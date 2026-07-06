# Zolve CRM - Education Loan Product Technical Design

## Overview

This document outlines the technical design for the Education Loan product module within the Zolve CRM platform. The Education Loan product is the first product implementation built on the lead-first CRM core.

---

## Architecture Position

The Education Loan product is built as a **modular product service** on top of the core CRM platform. It leverages:

- **Core CRM Layer**: Lead management, comments, audit trails, RBAC
- **Product Instance Framework**: Multi-product support with independent ownership
- **Document Services**: Reusable document request/submission workflows
- **Shared Services**: User management, notifications, reporting

### Layered Architecture

```
┌────────────────────────────────────────────────────────────┐
│          Education Loan Product Module                     │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ Loan Service │  │ Lender Svc   │  │ Document Svc    │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└────────────────────────────────────────────────────────────┘
              ▲                ▲                    ▲
              │                │                    │
┌─────────────┴────────────────┴────────────────────┴─────────┐
│                    Core CRM Services                        │
│  ┌──────────────┐  ┌─────────┐  ┌──────────────────────┐   │
│  │ Lead Service │  │Auth/RBAC│  │ Document Base Svc    │   │
│  └──────────────┘  └─────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Model Extensions

### EducationLoanApplication (Primary Entity)

```typescript
EducationLoanApplication {
  id: string                      // EL-XXXX
  leadId: string                  // FK to Lead
  productInstanceId: string       // FK to ProductInstance
  
  // Loan Profile
  university: string              // e.g., "Carnegie Mellon University"
  course: string                  // e.g., "MS Computer Science"
  targetCountry: string           // e.g., "USA"
  totalLoanAmount: number         // In INR
  expectedIntake: string          // e.g., "Fall 26"
  
  // Applicant Profile
  studentName: string             // Denormalized from Lead
  studentAge?: number
  studentEmail?: string
  
  // Co-applicant Profile
  coApplicantName?: string
  coApplicantType: enum           // "salaried" | "self-employed"
  coApplicantIncome?: number
  
  // Collateral Information
  collateralType: enum            // "secured" | "unsecured"
  collateralDescription?: string
  estimatedCollateralValue?: number
  
  // Workflow State
  loanStage: enum                 // Started → Docs Pending → ... → Disbursed
  stageUpdatedAt: Date            // When current stage was entered
  
  // Counselor Assignment
  counselorZRM: string            // Zolve Relationship Manager (owning counselor)
  counselorLRM?: string           // Lender Relationship Manager
  
  // Relationship to global lead properties
  globalCallStatus: string        // Cached from Lead for quick access
  rescheduleDate?: Date           // Cached from Lead
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  completedAt?: Date              // When loan reached Disbursed
  archivedAt?: Date
}
```

### LenderApplication (Multi-Lender Tracking)

```typescript
LenderApplication {
  id: string                      // LA-XXXX
  educationLoanId: string         // FK to EducationLoanApplication
  
  // Lender Profile
  lenderName: string              // "Avanse", "HDFC Credila", etc.
  lenderCode: string              // Internal code for lender
  lenderContact?: string          // Email/phone for lender updates
  
  // Recommendation & Matching
  matchScore: number              // 0-100 (probability of approval)
  recommendationSource: enum      // "auto_recommended" | "manual"
  recommendationReasons?: string[]  // Why this lender was recommended
  
  // Application Status
  lenderStatus: enum              // Interested → Applied → ... → Disbursed
  statusUpdatedAt: Date           // When status changed
  
  // Sanction Details (when approved)
  sanctionAmount?: number         // Approved loan amount
  roi?: number                    // Rate of Interest (%)
  processingFee?: number          // Processing fee amount
  sanctionDate?: Date
  sanctionValidity?: Date         // Sanction offer validity
  
  // Disbursement Details (when disbursed)
  disbursementAmount?: number     // Actually disbursed amount
  disbursementDate?: Date
  tranchCount?: number            // Number of tranches
  tranches?: {
    tranchNumber: number
    amount: number
    disbursedDate: Date
  }[]
  
  // Rejection Details (when rejected)
  rejectionDate?: Date
  rejectionReason?: string
  
  // Communication
  communicationHistory?: {
    date: Date
    type: string                // "email" | "phone" | "api_response"
    notes: string
  }[]
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  statusHistory: LenderStatusHistory[]  // Track all status changes
}
```

### LenderStatusHistory (Audit Trail)

```typescript
LenderStatusHistory {
  id: string
  lenderApplicationId: string
  previousStatus: string
  newStatus: string
  changedAt: Date
  changedBy: string              // Who made the change (user or system)
  reason?: string                // Why the status changed
  metadata?: object              // Additional context
}
```

### DocumentRequest Extension (for loans)

```typescript
DocumentRequest {
  id: string                      // DR-XXXX
  educationLoanId: string         // FK to EducationLoanApplication
  
  categories: enum[]              // "kyc" | "academics" | "financials" | "collateral"
  
  // Request Lifecycle
  sentDate: Date
  deadline: Date
  reminderSentAt?: Date           // When reminder was sent to student
  
  status: enum                    // "pending" | "partial_received" | "completed" | "expired"
  completedAt?: Date              // When all docs received
  
  // Document List
  documents: DocumentSubmission[]
  
  // Requirements Summary
  totalRequired: number
  totalReceived: number
  totalApproved: number
}
```

### DocumentSubmission Extension (for loans)

```typescript
DocumentSubmission {
  id: string                      // DS-XXXX
  documentRequestId: string
  
  // Document Definition
  name: string                    // "Student PAN Card"
  category: enum                  // "kyc" | "academics" | "financials" | "collateral"
  documentType: string            // "pan_card", "passport", "admit_letter", etc.
  required: boolean               // Is this document mandatory
  
  // Submission Process
  submissionMethod: enum          // "upload" | "email" | "manual_entry"
  submissionDate: Date
  
  // File Details (if uploaded)
  fileUrl?: string                // S3 signed URL
  fileName?: string
  fileSize?: number
  mimeType?: string
  
  // Document Status
  status: enum                    // "not_started" | "submitted" | "approved" | "rejected"
  approvedAt?: Date
  rejectedAt?: Date
  rejectionReason?: string
  
  // Version Tracking (for resubmissions)
  versions: {
    version: number
    fileUrl: string
    uploadedAt: Date
    status: enum                  // "rejected" | "approved"
  }[]
  
  // Document Validation (optional OCR/extraction)
  extractedData?: {
    documentNumber?: string       // PAN, Aadhar, Passport number
    issuedDate?: Date
    expiryDate?: Date
    holderName?: string
  }
}
```

---

## Service Layer Design

### EducationLoanService

```typescript
class EducationLoanService {
  // Create
  createLoanApplication(leadId, loanDetails) 
    → EducationLoanApplication
  
  // Read
  getLoanApplication(loanId)
    → EducationLoanApplication with relationships
  
  listLoans(filters, pagination)
    → EducationLoanApplication[]
  
  // Update
  updateLoanDetails(loanId, updates)
    → EducationLoanApplication (only in Started stage)
  
  updateLoanStage(loanId, newStage, reason)
    → EducationLoanApplication (validates transitions)
  
  // Lender Management
  addLender(loanId, lenderName, matchScore?)
    → LenderApplication
  
  updateLenderStatus(lenderId, newStatus, details)
    → LenderApplication
  
  // Document Management
  requestDocuments(loanId, categories)
    → DocumentRequest
  
  submitDocument(documentRequestId, documentId, file)
    → DocumentSubmission
  
  approveDocument(documentSubmissionId)
    → DocumentSubmission (may trigger stage update)
  
  rejectDocument(documentSubmissionId, reason)
    → DocumentSubmission
  
  // Query & Reporting
  getLoansByStage(stage)
    → EducationLoanApplication[]
  
  getLoansByLender(lenderName)
    → LenderApplication[]
  
  getDocumentStatus(loanId)
    → DocumentRequest with submission statuses
}
```

### LenderMatcherService

```typescript
class LenderMatcherService {
  // Main matching algorithm
  matchLenders(loanDetails, studentProfile)
    → LenderRecommendation[] (sorted by score)
  
  // Individual assessment
  assessLender(lenderName, loanDetails, studentProfile)
    → { score: number, reasons: string[] }
  
  // Re-match existing loan
  reMatchLoan(loanId)
    → LenderRecommendation[] (updated recommendations)
  
  // Pool management
  getLenderPool()
    → Lender[] (active lenders)
  
  updateLenderPool(additions, removals)
    → void
}

// Recommendation object
LenderRecommendation {
  lenderName: string
  matchScore: number              // 0-100
  favoringFactors: string[]       // Why this lender is good fit
  concerningFactors: string[]     // Potential issues
  estimatedApprovalProbability: number
  estimatedProcessingDays: number
  historicalConversionRate: number
}
```

### DocumentService (Loan-specific)

```typescript
class LoanDocumentService extends DocumentService {
  // Loan-specific document categories
  getDocumentChecklist(collateralType)
    → DocumentType[]
  
  requestLoanDocuments(loanId, categories)
    → DocumentRequest
  
  validateDocumentCategory(document, category)
    → boolean
  
  checkDocumentCompletion(documentRequestId)
    → { completed: boolean, approved: number, pending: number }
}

// Document checklist definitions
DocumentChecklist {
  kyc: {
    "Student PAN": { required: true, category: "identity" },
    "Student Aadhaar": { required: true, category: "identity" },
    "Student Passport": { required: true, category: "identity" },
    "Co-Applicant PAN": { required: conditional, condition: "has_co_applicant" },
    // ... more documents
  },
  
  academics: {
    "10th Scorecard": { required: true },
    "12th Scorecard": { required: true },
    "Admit Letter": { required: true },
    // ... more documents
  },
  
  financials: {
    "Salary Slips (3 months)": { required: true },
    "Bank Statements (6 months)": { required: true },
    // ... more documents
  },
  
  collateral: {
    "Property Documents": { required: conditional, condition: "collateral_type=secured" },
    // ... more documents
  }
}
```

---

## API Endpoints (Education Loan Specific)

### Loan Management

```
POST   /api/loans                          Create new loan
GET    /api/loans/:loanId                  Get loan details
PUT    /api/loans/:loanId                  Update loan (Started stage only)
GET    /api/loans                          List loans (paginated, filtered)
DELETE /api/loans/:loanId                  Soft-delete loan
```

### Loan Stage Management

```
PUT    /api/loans/:loanId/stage            Update loan stage
GET    /api/loans/:loanId/stage-history    Get stage progression
```

### Lender Management

```
POST   /api/loans/:loanId/lenders          Add lender to loan
GET    /api/loans/:loanId/lenders          List all lenders for loan
GET    /api/loans/:loanId/lenders/:lenderId  Get lender details
PUT    /api/loans/:loanId/lenders/:lenderId  Update lender status
DELETE /api/loans/:loanId/lenders/:lenderId  Remove lender
```

### Lender Matching

```
POST   /api/loans/:loanId/match            Get lender recommendations
POST   /api/loans/:loanId/match/rerun      Re-run matcher
GET    /api/lenders/pool                   Get active lender pool
```

### Document Management

```
POST   /api/loans/:loanId/document-request      Create document request
GET    /api/loans/:loanId/document-request/:id  Get request details
POST   /api/loans/:loanId/documents             Upload document
GET    /api/loans/:loanId/documents             List documents
GET    /api/loans/:loanId/documents/:id/versions  Get document versions
PUT    /api/loans/:loanId/documents/:id/approve  Approve document
PUT    /api/loans/:loanId/documents/:id/reject   Reject document
```

---

## Request/Response Examples

### Create Loan Application

**Request:**
```json
POST /api/loans
{
  "leadId": "ZL-4821",
  "university": "Carnegie Mellon University",
  "course": "MS Computer Science",
  "targetCountry": "USA",
  "totalLoanAmount": 4500000,
  "expectedIntake": "Fall 26",
  "collateralType": "non-collateral",
  "coApplicantType": "salaried"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "EL-1042",
    "leadId": "ZL-4821",
    "loanStage": "started",
    "lenders": [],
    "docs": {
      "kyc": [...],
      "academics": [...],
      "financials": [...],
      "collateral": []
    },
    "createdAt": "2026-06-23T10:00:00Z"
  }
}
```

### Get Lender Recommendations

**Request:**
```
POST /api/loans/EL-1042/match
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "lenderName": "HDFC Credila",
      "matchScore": 88,
      "favoringFactors": [
        "Good CGPA (3.8)",
        "Reputed university",
        "Co-applicant has stable income"
      ],
      "concerningFactors": [],
      "estimatedApprovalProbability": 0.92,
      "estimatedProcessingDays": 14
    },
    {
      "lenderName": "Avanse",
      "matchScore": 72,
      "favoringFactors": [...],
      "concerningFactors": [...]
    }
  ]
}
```

### Update Lender Status

**Request:**
```json
PUT /api/loans/EL-1042/lenders/LA-5021
{
  "lenderStatus": "sanctioned",
  "sanctionAmount": 4200000,
  "roi": 11.5,
  "processingFee": 42000,
  "sanctionValidity": "2026-09-30"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "LA-5021",
    "lenderName": "HDFC Credila",
    "lenderStatus": "sanctioned",
    "sanctionAmount": 4200000,
    "roi": 11.5,
    "processingFee": 42000,
    "statusUpdatedAt": "2026-06-25T14:30:00Z"
  }
}
```

---

## Workflow State Machine

### Loan Stage Transitions

```
Started
  ↓
  ├─→ Docs Pending (when document request created)
      ↓
      ├─→ Docs Received (when all docs approved)
          ↓
          ├─→ Call Scheduled (when call scheduled)
              ↓
              ├─→ Sanctioned (when lender approves)
                  ↓
                  ├─→ Disbursed (when lender disburses)
                  │   (End state - completed)
                  │
              └─→ Lost (if rejected or abandoned)
          │
      └─→ Lost (if docs not provided)
  │
  └─→ Lost (if abandoned)
```

### Lender Status Transitions

```
Interested
  ├─→ Applied (when documents sent to lender)
  │   ├─→ Under Review (when lender begins review)
  │   │   ├─→ Sanctioned (when lender approves)
  │   │   │   ├─→ Disbursed (when funds disbursed)
  │   │   │   │   (End state)
  │   │   │   │
  │   │   │   └─→ Withdrawn (if student rejects)
  │   │   │
  │   │   └─→ Rejected (when lender declines)
  │   │       (End state)
  │   │
  │   └─→ Withdrawn (if student cancels)
  │
  └─→ Withdrawn (if not applied and cancelled)
```

---

## Integration with Core CRM

### Lead Lifecycle

When an Education Loan is created for a lead:

1. **ProductInstance created** with type="education_loan"
2. **Lead appears** in "Education Loan" tab view
3. **Global call status** shared (from Lead to Loan)
4. **Comments** visible in Loan context (from Lead)
5. **Reassignment** moves loan with lead

### Multi-Product Coordination

If lead has multiple products:
- Each product maintains independent status
- Different counselors can manage different products
- Comments visible to all product teams
- Global call status consistent across products

---

## Frontend-Backend Integration Points

### Data Mapping for Frontend

Frontend `LoanApp` receives from `/api/loans/:id`:
- Loan details (university, course, amount, stage)
- Lender list with current statuses
- Document checklist with upload statuses
- Comments from lead
- Stage history

Frontend `LenderInfo` receives from `/api/loans/:id/lenders`:
- Lender name, match score
- Current status (mapped: "interested" → "not_applied", "approved" → "sanctioned")
- Sanction/disbursement details when available

Frontend `DocChecklist` receives from `/api/loans/:id/documents`:
- KYC, Academic, Financial, Collateral documents
- Each document with: name, status (uploaded flag), submission method

---

## Error Handling

### Common Scenarios

1. **Invalid Stage Transition**
   ```json
   {
     "code": "INVALID_STAGE_TRANSITION",
     "message": "Cannot transition from 'sanctioned' to 'docs_pending'",
     "allowedTransitions": ["disbursed", "withdrawn"]
   }
   ```

2. **Lender Already Added**
   ```json
   {
     "code": "LENDER_DUPLICATE",
     "message": "HDFC Credila already added to this loan"
   }
   ```

3. **Document Category Mismatch**
   ```json
   {
     "code": "DOCUMENT_CATEGORY_MISMATCH",
     "message": "Collateral documents not required for non-collateral loans"
   }
   ```

4. **Access Denied**
   ```json
   {
     "code": "FORBIDDEN",
     "message": "You don't have permission to update this loan"
   }
   ```

---

## Performance Considerations

- **Loan queries**: Index on `loan_stage`, `counselor_zrm_id`, `created_at`
- **Lender queries**: Index on `education_loan_id`, `lender_status`
- **Document queries**: Index on `document_request_id`, `category`
- **Caching**: Cache lender recommendations (2 hour TTL)
- **Pagination**: Use cursor-based for large result sets

---

