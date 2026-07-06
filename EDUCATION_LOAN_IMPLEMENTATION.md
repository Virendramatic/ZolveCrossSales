# Education Loan Module - Complete Implementation

## Overview

This document describes the complete implementation of the Education Loan module for the Zolve CRM system, spanning both backend (Node.js/Express) and frontend (React) with full CRUD operations, multi-lender coordination, loan stage management, and document tracking.

---

## Architecture Summary

### Backend Structure

```
backend/
├── src/
│   ├── routes/
│   │   └── education-loan.routes.ts         # All loan endpoints
│   ├── services/
│   │   └── education-loan.service.ts        # Business logic
│   ├── schemas/
│   │   └── education-loan.schema.ts         # Zod validation schemas
│   ├── middleware/
│   │   ├── auth.ts                          # JWT authentication
│   │   └── errorHandler.ts                  # Global error handling
│   └── __tests__/
│       └── education-loan.integration.test.ts # Comprehensive test suite
├── prisma/
│   └── schema.prisma                        # Database models
```

### Frontend Structure

```
Frontend/src/app/components/education-loan/
├── EducationLoanContext.tsx                 # React context & hooks
├── EducationLoanModule.tsx                  # Main module container
├── EducationLoanListView.tsx                # Loan list with filtering
├── LoanCreationForm.tsx                     # Create new loan form
├── LoanDetailView.tsx                       # View loan with tabs (lenders, docs, history)
├── LenderManagementForm.tsx                 # Add/update lenders
└── index.ts                                 # Exports
```

---

## Backend Implementation

### 1. Routes (`education-loan.routes.ts`)

**Endpoints:**

```
LOAN CRUD:
  POST   /api/loans                           Create new loan
  GET    /api/loans                           List loans (filtered, paginated)
  GET    /api/loans/:loanId                   Get loan details
  PUT    /api/loans/:loanId                   Update loan (STARTED stage only)
  DELETE /api/loans/:loanId                   Soft-delete loan

STAGE MANAGEMENT:
  PUT    /api/loans/:loanId/stage             Update loan stage
  GET    /api/loans/:loanId/stage-history     Get stage history

LENDER MANAGEMENT:
  POST   /api/loans/:loanId/lenders           Add lender
  GET    /api/loans/:loanId/lenders           List lenders
  GET    /api/loans/:loanId/lenders/:lenderId Get lender details
  PUT    /api/loans/:loanId/lenders/:lenderId Update lender status
  DELETE /api/loans/:loanId/lenders/:lenderId Remove lender

DOCUMENT MANAGEMENT:
  POST   /api/loans/:loanId/document-request  Request documents
  GET    /api/loans/:loanId/document-request/:docRequestId  Get request
  PUT    /api/loans/:loanId/document-request/:docRequestId/documents/:documentId/approve
  PUT    /api/loans/:loanId/document-request/:docRequestId/documents/:documentId/reject

STATS:
  GET    /api/loans/stats                     Dashboard statistics

RBAC: All endpoints require JWT auth middleware + role-based access control
```

### 2. Service (`education-loan.service.ts`)

**Methods:**

```typescript
// Loan Management
createLoan(leadId, input, userId, userRole)
getLoanById(loanId, userId, userRole)
listLoans(userId, userRole, filters)
updateLoanDetails(loanId, input, userId, userRole)
updateLoanStage(loanId, input, userId, userRole)
deleteLoan(loanId, userId, userRole)

// Lender Management
addLender(loanId, input, userId)
getLendersForLoan(loanId, userId, userRole, filters)
getLenderById(loanId, lenderId, userId, userRole)
updateLenderStatus(loanId, lenderId, input, userId, userRole)

// Document Management
requestDocuments(loanId, input, userId, userRole)
getDocumentRequest(loanId, docRequestId, userId, userRole)
approveDocument(loanId, docRequestId, documentId, userId, userRole)
rejectDocument(loanId, docRequestId, documentId, reason, userId, userRole)

// Statistics
getLoanStats(userId, userRole)
```

### 3. Data Models

**EducationLoanApplication**
- Tracks loan details (university, course, amount, intake)
- Manages collateral type (secured/non-collateral)
- Stores stage (STARTED → DOCS_PENDING → DOCS_RECEIVED → CALL_SCHEDULED → SANCTIONED → DISBURSED)
- Links to lead (one-to-one) and product instance
- Tracks responsible counselors (ZRM, LRM)

**LenderApplication**
- Tracks multiple lenders per loan
- Stores match scores (0-100)
- Manages status transitions (INTERESTED → APPLIED → UNDER_REVIEW → APPROVED/REJECTED → DISBURSED)
- Captures sanction details (amount, ROI, processing fee, validity)
- Records disbursement information and rejection reasons

**DocumentRequest & DocumentSubmission**
- Auto-generates document checklist based on collateral type
- Tracks submission status (NOT_STARTED → SUBMITTED → APPROVED/REJECTED)
- Supports versioning for document resubmissions
- Auto-transitions loan stage when all docs approved

### 4. Key Features

**Stage Management:**
- Validates stage transitions (prevents regression)
- Records full transition history with timestamp and responsible counselor
- Auto-transitions from STARTED → DOCS_PENDING when documents requested
- Auto-transitions from DOCS_PENDING → DOCS_RECEIVED when all docs approved

**Lender Coordination:**
- Add multiple lenders per loan
- Track lender status through complete lifecycle
- Capture sanction details on approval (amount, ROI, fees, validity)
- Record disbursement information
- Track rejection reasons

**Document Management:**
- Auto-generate checklists based on loan type and collateral
- KYC, Academic, Financial, and Collateral document categories
- Required vs. optional document tracking
- Rejection with reasons triggers re-submission

**RBAC & Permissions:**
- Counselors only see loans they own or created
- Admins see all loans
- All operations logged in audit trail

**Error Handling:**
- Comprehensive validation with Zod schemas
- Detailed error messages with codes
- Transactional integrity (Prisma)
- Graceful error responses

---

## Frontend Implementation

### 1. Context (`EducationLoanContext.tsx`)

**State Management:**
- `loans`: List of loans
- `selectedLoan`: Currently selected loan with relationships
- `loading`: Loading state
- `error`: Error messages

**Actions:**
- `loadLoans(filters?)`: Fetch loans with optional filtering
- `selectLoan(loanId)`: Fetch and select loan with relationships
- `createLoan(leadId, data)`: Create new loan
- `updateLoan(loanId, data)`: Update loan details
- `updateLoanStage(loanId, newStage, reason?)`: Transition loan stage
- `deleteLoan(loanId)`: Archive loan

**Lender Actions:**
- `addLender(loanId, data)`: Add lender to loan
- `updateLenderStatus(loanId, lenderId, data)`: Update lender status with sanction/disbursement details
- `removeLender(loanId, lenderId)`: Remove lender

**Document Actions:**
- `requestDocuments(loanId, data)`: Create document request
- `approveDocument(loanId, docRequestId, documentId)`: Approve document
- `rejectDocument(loanId, docRequestId, documentId, reason)`: Reject document

### 2. Components

**EducationLoanListView**
- Display loans in paginated list format
- Filter by loan stage (STARTED, DOCS_PENDING, DOCS_RECEIVED, etc.)
- Show key loan info: university, course, amount, stage, creation date
- Display number of lenders
- Click to select loan for detail view
- Loading and error states

**LoanCreationForm**
- Form for creating new education loan
- Required fields: university, course, loan amount
- Optional fields: target country, expected intake, co-applicant info
- Collateral type selector (Secured/Non-Collateral)
- Co-applicant type selector (Salaried/Self-Employed)
- Form validation with error messages
- Success/cancel callbacks

**LoanDetailView**
- Display full loan details in card format
- Stage badge with color coding
- Loan statistics (amount, country, intake, collateral type)
- Stage management buttons (transition to valid next stages)
- Three tabs:
  - **Lenders**: List all lenders with status, match score, sanction/disbursement details
  - **Documents**: Show document requests and submission status by category
  - **History**: Complete stage transition history with timestamps

**LenderManagementForm**
- Add new lender (name, match score, recommendation source)
- Update lender status with conditional fields:
  - APPROVED: Sanction details (amount, ROI, fee, dates)
  - DISBURSED: Disbursement amount and date
  - REJECTED: Rejection reason
- Remove lender (with confirmation)
- Tab interface for Add vs. Update modes

**EducationLoanModule**
- Main container component
- Manages view state (list, create, detail)
- Dialog components for modals
- Wraps child components with EducationLoanProvider

### 3. Features

**State Management:**
- React Context for global state
- Automatic list refresh on create/update/delete
- Optimistic updates for better UX

**Filtering & Search:**
- Filter by loan stage
- Future-ready for country, collateral type filters

**Forms with Validation:**
- Client-side validation
- Error messages displayed in-form
- Loading states on buttons
- Disabled inputs while loading

**Responsive Design:**
- Mobile-first approach using Tailwind CSS
- Grid layouts that adapt to screen size
- Tab interface for organization

**Error Handling:**
- Display API errors in user-friendly messages
- Clear error messages for form validation
- Toast-like error display in cards

---

## Database Schema

### Key Tables

**EducationLoanApplication**
```sql
- id (PK)
- loanCode (unique, EL-XXXX)
- leadId (FK, unique - one loan per lead)
- productInstanceId (FK, unique)
- university, course, targetCountry
- totalLoanAmount, expectedIntake
- collateralType (SECURED|NON_COLLATERAL)
- coApplicantName, coApplicantType
- loanStage (enum: STARTED...DISBURSED)
- stageUpdatedAt, counselorZrmId, counselorLrmId
- createdAt, updatedAt, completedAt, archivedAt
```

**LenderApplication**
```sql
- id (PK)
- lenderCode (unique, LA-XXXX)
- educationLoanId (FK)
- lenderName, matchScore
- recommendationSource (AUTO_RECOMMENDED|MANUAL)
- lenderStatus (enum: INTERESTED...DISBURSED)
- sanctionAmount, roi, processingFee, sanctionDate, sanctionValidity
- disbursementAmount, disbursementDate, tranchCount, tranches
- rejectionDate, rejectionReason
```

**LenderStatusHistory**
```sql
- id (PK)
- lenderApplicationId (FK)
- previousStatus, newStatus
- changedAt, changedBy, reason, metadata
```

**LoanStageHistory**
```sql
- id (PK)
- educationLoanId (FK)
- previousStage, newStage
- transitionTimestamp, responsibleCounselorId, reason
```

**DocumentRequest**
```sql
- id (PK)
- docRequestCode (unique, DR-XXXX)
- educationLoanId (FK)
- categories (KYC|ACADEMICS|FINANCIALS|COLLATERAL)
- sentDate, deadline, reminderSentAt
- status (PENDING|PARTIAL_RECEIVED|COMPLETED|EXPIRED)
- completedAt
```

**DocumentSubmission**
```sql
- id (PK)
- docSubmissionCode (unique, DS-XXXX)
- documentRequestId (FK)
- name, category, documentType, required
- submissionMethod (UPLOAD|EMAIL|MANUAL_ENTRY)
- submissionDate, fileUrl, fileName, fileSize, mimeType
- status (NOT_STARTED|SUBMITTED|APPROVED|REJECTED)
- approvedAt, rejectedAt, rejectionReason
- versions (JSON array), extractedData (JSON)
```

---

## API Response Format

All endpoints follow this format:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  },
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0
  }
}
```

### Example: Create Loan

**Request:**
```json
POST /api/loans
{
  "leadId": "cl7x9z2a10000...",
  "university": "Carnegie Mellon University",
  "course": "MS Computer Science",
  "targetCountry": "USA",
  "totalLoanAmount": 4500000,
  "expectedIntake": "Fall 26",
  "collateralType": "NON_COLLATERAL",
  "coApplicantName": "Parent Name",
  "coApplicantType": "SALARIED"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "el_1234567890",
    "loanCode": "EL-5621",
    "leadId": "cl7x9z2a10000...",
    "university": "Carnegie Mellon University",
    "course": "MS Computer Science",
    "targetCountry": "USA",
    "totalLoanAmount": 4500000,
    "expectedIntake": "Fall 26",
    "collateralType": "NON_COLLATERAL",
    "coApplicantName": "Parent Name",
    "coApplicantType": "SALARIED",
    "loanStage": "STARTED",
    "stageUpdatedAt": "2026-06-23T10:00:00Z",
    "counselorZrmId": "user_123",
    "lead": { /* full lead object */ },
    "lenderApplications": [],
    "documentRequests": [],
    "stageHistory": [],
    "createdAt": "2026-06-23T10:00:00Z",
    "updatedAt": "2026-06-23T10:00:00Z"
  }
}
```

---

## Workflow Examples

### 1. Create Loan and Request Documents

```
1. Counselor creates loan (POST /api/loans)
   → Loan created in STARTED stage
   → ProductInstance created automatically

2. Counselor requests documents (POST /api/loans/:id/document-request)
   → DocumentRequest created
   → Document checklist auto-generated based on collateral type
   → Loan auto-transitions to DOCS_PENDING
   → Student receives document request

3. Student submits documents (frontend upload)
   → Counselor reviews and approves/rejects each document
   
4. All documents approved
   → Loan auto-transitions to DOCS_RECEIVED
   → DocumentRequest marked COMPLETED
```

### 2. Multi-Lender Coordination

```
1. Counselor adds lenders (POST /api/loans/:id/lenders)
   → Multiple lenders added (e.g., HDFC Credila, Avanse, etc.)
   → Each starts in INTERESTED status

2. Counselor updates lender status to APPLIED
   → Application sent to lender

3. Lender reviews (counselor updates status to UNDER_REVIEW)
   → Waiting for lender response

4a. Lender approves (PUT /api/loans/:id/lenders/:lenderId)
   → Status: APPROVED
   → Capture sanction details (amount, ROI, processing fee)
   → Loan can transition to CALL_SCHEDULED

4b. Lender rejects
   → Status: REJECTED
   → Record rejection reason
   → Try other lenders

5. Selected lender disbursement
   → Status: DISBURSED
   → Record disbursement amount and date
   → Loan can transition to DISBURSED
   → Mark completedAt timestamp
```

### 3. Loan Stage Progression

```
STARTED
  ↓ (documents requested)
DOCS_PENDING
  ↓ (all docs approved)
DOCS_RECEIVED
  ↓ (counselor transitions)
CALL_SCHEDULED
  ↓ (lender approves)
SANCTIONED
  ↓ (lender disburses)
DISBURSED (end state, completedAt set)

At any stage: can transition to LOST
```

---

## Testing

### Integration Tests Included

The `education-loan.integration.test.ts` file includes comprehensive tests:

```
✓ Loan CRUD Operations
  - Create education loan
  - Prevent duplicate loans
  - Retrieve loan with relationships
  - List loans with pagination
  - Update loan details in STARTED stage
  - Prevent updates after STARTED
  - Soft-delete loan

✓ Loan Stage Management
  - Update with valid transition
  - Prevent invalid transitions
  - Track stage history

✓ Lender Management
  - Add lender
  - Prevent duplicates
  - Retrieve lenders
  - Get specific lender
  - Update lender status
  - Update to APPROVED with sanction details

✓ Document Management
  - Request documents and auto-transition
  - Generate correct checklist by collateral type
  - Approve document
  - Reject document with reason

✓ RBAC and Permissions
  - Prevent non-owner access
  - Allow admin access

✓ Statistics
  - Get loan statistics
```

---

## Installation & Setup

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with DATABASE_URL, JWT_SECRET, etc.

# Run migrations
npx prisma migrate dev

# Build
npm run build

# Start
npm run dev
```

### Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Set up environment
# Edit vite config or .env for VITE_API_URL

# Development
npm run dev

# Build
npm run build
```

---

## Security Considerations

1. **Authentication**: All endpoints require JWT token in Authorization header
2. **RBAC**: 
   - Counselors only access their own loans and leads
   - Admins access all loans
   - Ownership verified on every operation
3. **Input Validation**: Zod schemas validate all inputs
4. **Error Messages**: Detailed errors in logs only, generic messages to client
5. **Audit Logging**: All state changes recorded in AuditLog table
6. **Data Immutability**: Core fields immutable after creation (lead ID, creation date)

---

## Performance Optimizations

1. **Database Indexes**: 
   - loanStage, counselorZrmId, createdAt on EducationLoanApplication
   - educationLoanId, lenderStatus on LenderApplication
   - documentRequestId, category on DocumentSubmission

2. **Pagination**: Cursor-based pagination for large lists
3. **Selective Queries**: Only fetch required relationships
4. **Caching Ready**: Document checklist generation cached

---

## Future Enhancements

1. **Lender Matching Engine**: Auto-recommend lenders based on scoring
2. **Notification System**: Send emails on stage transitions and status updates
3. **Document OCR**: Extract data from uploaded documents
4. **Bulk Operations**: Import/export loans
5. **Analytics**: Dashboard with loan metrics
6. **Mobile App**: Native mobile application

---

## API Documentation

Complete Postman collection or Swagger/OpenAPI spec would be generated from:
- `education-loan.routes.ts` (endpoints)
- `education-loan.schema.ts` (request/response shapes)

---

## Support & Troubleshooting

### Common Issues

**Loan not transitioning**:
- Check current stage and valid next stages
- Verify permissions (must be loan owner or admin)

**Documents not auto-generating**:
- Collateral type determines COLLATERAL doc availability
- Categories in request must include 'COLLATERAL' for secured loans

**Lender status transition fails**:
- Check current lender status against valid transitions
- APPROVED and REJECTED are terminal except for withdrawal

---

## Production Checklist

- [ ] Database migrations run on prod
- [ ] Environment variables configured
- [ ] JWT secret rotated
- [ ] API rate limiting enabled
- [ ] Error logging configured (Sentry/similar)
- [ ] Database backups scheduled
- [ ] CORS properly configured
- [ ] HTTPS enforced
- [ ] Load testing completed
- [ ] Security audit passed

---

## Version

- **Module Version**: 1.0.0
- **Backend API**: v1
- **Frontend Components**: v1.0.0
- **Last Updated**: June 2026

