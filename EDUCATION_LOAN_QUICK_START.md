# Education Loan Module - Quick Start Guide

## 5-Minute Overview

The Education Loan module is a complete backend-to-frontend implementation for managing education loans in the Zolve CRM platform.

### What It Does

1. **Create & Manage Loans**: Track education loans with university, course, amount, and applicant info
2. **Multi-Lender Coordination**: Track multiple lenders per loan with status progression (Interested → Applied → Approved → Disbursed)
3. **Stage Management**: Loan stages (Started → Docs Pending → Docs Received → Call Scheduled → Sanctioned → Disbursed)
4. **Document Tracking**: Auto-generate and track required documents based on loan type
5. **Full RBAC**: Counselors only see their loans, admins see all

---

## File Structure

### Backend

```
backend/src/
├── routes/education-loan.routes.ts          ← All API endpoints
├── services/education-loan.service.ts       ← Business logic (100+ methods)
├── schemas/education-loan.schema.ts         ← Input validation
└── __tests__/education-loan.integration.test.ts  ← Comprehensive tests
```

### Frontend

```
Frontend/src/app/components/education-loan/
├── EducationLoanContext.tsx                 ← Global state + hooks
├── EducationLoanModule.tsx                  ← Main container
├── EducationLoanListView.tsx                ← Loan list with filters
├── LoanCreationForm.tsx                     ← Create loan form
├── LoanDetailView.tsx                       ← View loan + tabs (lenders, docs, history)
├── LenderManagementForm.tsx                 ← Add/update lenders
└── index.ts                                 ← Exports
```

---

## Key API Endpoints

### Loans
```
POST   /api/loans                    Create new loan
GET    /api/loans                    List loans (filter by stage)
GET    /api/loans/:loanId            Get loan with all relationships
PUT    /api/loans/:loanId            Update loan (STARTED stage only)
DELETE /api/loans/:loanId            Archive loan
```

### Stage Management
```
PUT    /api/loans/:loanId/stage      Transition to next stage
GET    /api/loans/:loanId/stage-history  View full stage history
```

### Lenders
```
POST   /api/loans/:loanId/lenders           Add lender
GET    /api/loans/:loanId/lenders           List all lenders
PUT    /api/loans/:loanId/lenders/:lenderId Update lender status
```

### Documents
```
POST   /api/loans/:loanId/document-request  Request documents (auto-transitions to DOCS_PENDING)
GET    /api/loans/:loanId/documents/:id/approve  Approve document
GET    /api/loans/:loanId/documents/:id/reject   Reject document
```

---

## Frontend Usage

### 1. Import the Module

```typescript
import { EducationLoanModule } from './components/education-loan';

export function MyPage() {
  return (
    <EducationLoanModule 
      initialView="list"  // 'list' or 'create'
    />
  );
}
```

### 2. Use the Hook in Your Component

```typescript
import { useEducationLoan } from './components/education-loan';

export function MyComponent() {
  const { 
    loans, 
    loading, 
    loadLoans, 
    selectLoan,
    createLoan 
  } = useEducationLoan();

  useEffect(() => {
    loadLoans({ stage: 'STARTED' });
  }, [loadLoans]);

  return (
    <div>
      {loans.map(loan => (
        <button key={loan.id} onClick={() => selectLoan(loan.id)}>
          {loan.loanCode}: {loan.university}
        </button>
      ))}
    </div>
  );
}
```

### 3. Add to Lead Detail View (as Tab)

```typescript
import { EducationLoanModule } from './components/education-loan';

export function LeadDetailView({ leadId }) {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="education-loan">Education Loan</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        {/* Existing lead details */}
      </TabsContent>
      
      <TabsContent value="education-loan">
        <EducationLoanModule 
          leadId={leadId}
          initialView="list"
        />
      </TabsContent>
    </Tabs>
  );
}
```

---

## Common Workflows

### Workflow 1: Create Loan and Send Documents

```typescript
// 1. Create loan
const loan = await createLoan(leadId, {
  university: 'Carnegie Mellon University',
  course: 'MS Computer Science',
  targetCountry: 'USA',
  totalLoanAmount: 4500000,
  expectedIntake: 'Fall 26',
  collateralType: 'NON_COLLATERAL'
});
// → Loan created in STARTED stage

// 2. Request documents (UI: "Request Documents" button)
const docRequest = await requestDocuments(loan.id, {
  categories: ['KYC', 'ACADEMICS', 'FINANCIALS']
});
// → Auto-generates document checklist
// → Loan auto-transitions to DOCS_PENDING

// 3. Student uploads docs, counselor approves
await approveDocument(loan.id, docRequest.id, documentId);
// → When all approved, loan auto-transitions to DOCS_RECEIVED
```

### Workflow 2: Track Multiple Lenders

```typescript
// 1. Add lenders
const lender1 = await addLender(loan.id, {
  lenderName: 'HDFC Credila',
  matchScore: 88
});
const lender2 = await addLender(loan.id, {
  lenderName: 'Avanse',
  matchScore: 72
});

// 2. Update status to APPLIED
await updateLenderStatus(loan.id, lender1.id, {
  lenderStatus: 'APPLIED'
});

// 3. Lender approves
await updateLenderStatus(loan.id, lender1.id, {
  lenderStatus: 'APPROVED',
  sanctionAmount: 4200000,
  roi: 11.5,
  processingFee: 42000,
  sanctionDate: new Date(),
  sanctionValidity: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
});

// 4. Check match scores in UI
lender1.matchScore // 88 (more likely to approve)
lender2.matchScore // 72
```

### Workflow 3: Move Loan Through Stages

```typescript
// Loan starts as STARTED
// Valid transitions: DOCS_PENDING, LOST

// 1. Move to DOCS_PENDING (manual or auto via requestDocuments)
await updateLoanStage(loan.id, 'DOCS_PENDING', 'Documents requested');

// 2. Move to DOCS_RECEIVED (manual or auto when all docs approved)
await updateLoanStage(loan.id, 'DOCS_RECEIVED', 'All documents received');

// 3. Move to CALL_SCHEDULED
await updateLoanStage(loan.id, 'CALL_SCHEDULED', 'Call with student scheduled');

// 4. Move to SANCTIONED
await updateLoanStage(loan.id, 'SANCTIONED', 'Lender approved');

// 5. Move to DISBURSED (final stage, completedAt set)
await updateLoanStage(loan.id, 'DISBURSED', 'Funds disbursed');

// View full history
const loan = await selectLoan(loan.id);
console.log(loan.stageHistory); // All transitions with timestamps
```

---

## Database Setup

### Existing Tables Already in Schema

The following Prisma models are already defined:

- `EducationLoanApplication`
- `LenderApplication`
- `LenderStatusHistory`
- `LoanStageHistory`
- `DocumentRequest`
- `DocumentSubmission`

No manual schema updates needed! Just run:

```bash
npx prisma migrate deploy  # Apply any pending migrations
npx prisma generate       # Generate Prisma client
```

---

## Testing

### Run Integration Tests

```bash
cd backend
npm test -- src/__tests__/education-loan.integration.test.ts

# Or with watch mode
npm test -- src/__tests__/education-loan.integration.test.ts --watch
```

### Tests Cover

- ✅ Loan creation and retrieval
- ✅ Stage transitions and history
- ✅ Lender management and status updates
- ✅ Document requests and approvals
- ✅ RBAC permissions
- ✅ Error cases and validations

---

## Authentication & Authorization

All endpoints require JWT token:

```bash
Authorization: Bearer <jwt_token>
```

**Permissions:**
- **COUNSELOR**: Only sees loans they own or created
- **ADMIN**: Sees all loans

Example in code:
```typescript
// Backend automatically checks:
if (userRole === 'COUNSELOR' && loan.counselorZrmId !== userId) {
  throw new Error('You do not have permission to access this loan');
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_STAGE_TRANSITION",
    "message": "Cannot transition from STARTED to DOCUMENTS_RECEIVED",
    "details": {
      "currentStage": "STARTED",
      "attemptedStage": "DOCUMENTS_RECEIVED",
      "validTransitions": ["DOCS_PENDING", "LOST"]
    }
  }
}
```

Handle in frontend:

```typescript
try {
  await updateLoanStage(loan.id, 'INVALID_STAGE');
} catch (error) {
  console.error(error.error.code);    // "INVALID_STAGE_TRANSITION"
  console.error(error.error.message); // "Cannot transition..."
  // Show user-friendly message
}
```

---

## Performance Tips

1. **Filtering**: Always filter by stage when listing loans
   ```typescript
   await getLoans({ stage: 'STARTED', limit: 50 })
   ```

2. **Pagination**: Lists are paginated by default (50 per page)

3. **Relationships**: The `getLoan` endpoint includes:
   - `lead`: Parent lead data
   - `lenderApplications`: All lenders with status history
   - `documentRequests`: All document requests with submissions
   - `stageHistory`: Full stage progression

---

## Debugging

### Enable Logs

```bash
# Backend
export DEBUG=*
npm run dev

# Frontend (Vite)
export DEBUG=*
npm run dev
```

### Check Database

```bash
# View loan with all relationships
npx prisma studio

# Or query directly
npx prisma db execute
```

### Common Issues

**Q: Loan not transitioning to next stage?**
A: Check `validTransitions` in service. For example, from STARTED you can only go to DOCS_PENDING or LOST.

**Q: Documents not auto-generating?**
A: Make sure categories include required types (KYC always added, COLLATERAL only if collateralType='SECURED')

**Q: Lender can't be added?**
A: Check if lender already exists for this loan (prevents duplicates)

---

## Next Steps

1. **Integrate into Lead Detail View**: Add EducationLoanModule as a tab
2. **Add Dashboard**: Show loan statistics (GET /api/loans/stats)
3. **Implement Notifications**: Send emails on stage transitions
4. **Add Lender Matching**: Auto-recommend lenders based on scoring
5. **Bulk Import**: Import loans from CSV file

---

## Support

- **Backend Issues**: Check `backend/src/middleware/errorHandler.ts` for error details
- **Frontend Issues**: Use React DevTools to inspect EducationLoanContext
- **Database Issues**: Run `npx prisma studio` to inspect data

---

## Key Numbers

- **Loan Codes**: Format EL-XXXX (e.g., EL-5621)
- **Lender Codes**: Format LA-XXXX (e.g., LA-4821)
- **Document Codes**: Format DR-XXXX or DS-XXXX
- **Match Scores**: 0-100 (higher = more likely to approve)
- **Stages**: 7 total (STARTED through DISBURSED)
- **Lender Statuses**: 7 total (INTERESTED through WITHDRAWN)

---

## Deployment

### Backend
```bash
npm run build
npm start
# Requires: NODE_ENV, DATABASE_URL, JWT_SECRET
```

### Frontend
```bash
npm run build
# Serves dist/ folder
# Requires: VITE_API_URL pointing to backend
```

---

Happy coding! 🚀

