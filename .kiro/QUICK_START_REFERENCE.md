# 🚀 Zolve CRM Backend - Quick Start Reference

**TL;DR**: System is fully spec'd. Start implementing Phase 1 tasks. This file has everything you need in 2 minutes.

---

## 📂 THE THREE FILES YOU'll NEED

| File | What It Is | When To Use |
|------|-----------|------------|
| `.kiro/specs/zolve-crm-lead-first/tasks.md` | Implementation task list (71 tasks, 13 phases) | **START HERE** - Pick tasks, implement them |
| `.kiro/specs/zolve-crm-lead-first/design.md` | Technical architecture & database schema | When you need to know HOW to build something |
| `Frontend/src/app/App.tsx` | Frontend data models & UI patterns | When you need to know WHAT data frontend expects |

---

## 🎯 WHAT TO BUILD (Phase 1 - Start Here)

### Phase 1: Foundation Setup

```bash
# Task 1.1: Initialize Backend Project
├── Create Node.js + TypeScript project
├── Add dependencies (Express, Prisma, Zod, etc.)
└── Configure TypeScript strict mode

# Task 1.2: Set up Database
├── Create PostgreSQL database
├── Write Prisma schema (see design.md for all tables)
└── Run migrations

# Task 1.3: Authentication & Authorization
├── JWT token generation (access + refresh)
└── RBAC middleware (Counselor vs Admin permissions)
```

**Expected Output After Phase 1**:
- ✅ Repo has backend/ folder with Express app
- ✅ Database running with all 9 tables
- ✅ POST /auth/login returns valid JWT
- ✅ GET /api/leads returns 403 if unauthorized

---

## 💾 DATABASE SCHEMA (9 Tables)

Copy-paste ready from design.md:

```sql
-- Table 1: users (Counselors & Admins)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  role VARCHAR (admin|counselor),
  password_hash VARCHAR NOT NULL,
  ...
)

-- Table 2: leads (Master Entity)
CREATE TABLE leads (
  id VARCHAR PRIMARY KEY (ZL-XXXX),
  name VARCHAR NOT NULL,
  phone VARCHAR NOT NULL,
  global_call_status VARCHAR,
  reschedule_date DATE,
  created_by_user_id UUID,
  current_owner_id UUID,
  ...
)

-- Table 3: product_instances (Leads → Products)
CREATE TABLE product_instances (
  id VARCHAR PRIMARY KEY (PI-XXXX),
  lead_id VARCHAR,
  product_type VARCHAR (education_loan|remittance|accommodation|credit_card),
  owner_user_id UUID,
  ...
)

-- Table 4: comments (Global Lead Comments)
CREATE TABLE comments (
  id VARCHAR PRIMARY KEY,
  lead_id VARCHAR,
  content TEXT,
  author_id UUID,
  is_internal BOOLEAN,
  ...
)

-- Tables 5-9: Users, Education Loan, Lender, Documents, Audit Logs
-- → See full schema in design.md section "Database Schema"
```

---

## 🔐 AUTHORIZATION MODEL (Implement in Middleware)

```typescript
// Every endpoint needs permission check:

// ✅ COUNSELOR CAN:
- See leads assigned to them
- See products they own
- Add comments to shared leads
- Update their own product instances

// ❌ COUNSELOR CANNOT:
- See leads assigned to others
- Update products owned by others
- Delete leads or products
- Access admin endpoints

// ✅ ADMIN CAN:
- See all leads and products
- Assign/reassign leads
- Create/edit/delete anything
- View audit logs
- Run reports

// Implementation:
app.get('/api/leads/:id', 
  authMiddleware,                // ← Check JWT valid
  permissionMiddleware('lead:view:assigned'),  // ← Check can view this lead
  leadController.getLead
);
```

---

## 📊 FRONTEND DATA CONTRACTS

**These are what frontend expects - DON'T CHANGE THEM**

Frontend expects from `GET /api/leads/:id`:

```typescript
{
  id: "ZL-XXXX",
  name: string,
  phone: string,
  email?: string,
  country: string,
  intake: string,
  products: ["Education Loan", "Remittance"],  // Product names as strings
  callStatus: "connected" | "not_attempted" | "rescheduled" | "rejected",
  globalCallStatus: string,  // Internal backend term
  rescheduleDate: string,
  loanAppId?: string  // Optional link to education loan
}
```

Frontend expects from `GET /api/loans/:loanId`:

```typescript
{
  id: "EL-XXXX",
  zlId: "ZL-XXXX",
  student: string,
  university: string,
  course: string,
  targetCountry: string,
  intake: string,
  loanAmount: string,
  loanType: "collateral" | "non-collateral",
  stage: "started" | "doc_pending" | "doc_received" | "call_scheduled" | "sanctioned" | "disbursed",
  lenders: LenderInfo[],
  docs: DocChecklist,
  notes: string[],
  // ... see full interface in App.tsx lines 37-48
}
```

**KEY**: Status values must match exactly or frontend UI breaks.

---

## 🔄 CORE WORKFLOWS TO IMPLEMENT

### Workflow 1: Create Lead → Apply Loan → Get Recommendations → Add Lender

```
POST /api/leads
{name, phone, email, country, intake}
↓ Returns: {id: "ZL-1234", callStatus: "not_attempted"}

POST /api/loans
{leadId: "ZL-1234", university, course, loanAmount, collateralType}
↓ Returns: {id: "EL-5678", stage: "started", docs: {...}}

POST /api/loans/EL-5678/match
↓ Returns: [{lenderName: "HDFC", score: 88}, ...]

POST /api/loans/EL-5678/lenders
{lenderName: "HDFC Credila"}
↓ Returns: {id: "LA-9012", status: "interested"}
```

### Workflow 2: Request Documents → Upload → Approve → Stage Updates

```
POST /api/loans/EL-5678/document-request
{categories: ["kyc", "academics"]}
↓ Loan stage auto-transitions to "docs_pending"
↓ Returns: {id: "DR-3456", documents: [{name: "PAN", status: "not_started"}, ...]}

POST /api/loans/EL-5678/documents
{documentRequestId: "DR-3456", documentId, file}
↓ Returns: {fileUrl: "https://s3.../...", status: "submitted"}

PUT /api/loans/EL-5678/documents/DS-7890/approve
↓ If all docs approved, loan stage auto-transitions to "docs_received"
↓ Returns: {status: "approved"}
```

---

## 🧪 MUST-HAVE FEATURES (In Order of Priority)

| Priority | Feature | Phase | Why |
|----------|---------|-------|-----|
| 🔴 CRITICAL | JWT Auth + RBAC | 1 | Without this, no security |
| 🔴 CRITICAL | Lead CRUD | 2 | Master entity - everything depends on this |
| 🔴 CRITICAL | Product Instances | 4 | Enables multi-product model |
| 🔴 CRITICAL | Loan CRUD + Stages | 5 | First product implementation |
| 🟠 HIGH | Document Management | 7 | Core loan workflow |
| 🟠 HIGH | Lender Management | 6 | Multi-lender coordination |
| 🟡 MEDIUM | Comments | 3 | Team collaboration |
| 🟡 MEDIUM | Audit Logs | 8 | Compliance |
| 🟢 LOWER | Reports/Dashboards | 9 | Nice-to-have |

---

## ⚡ IMPLEMENTATION TIPS

### 1. Use Prisma ORM
```typescript
// Easy to use, generates types automatically
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const lead = await prisma.lead.create({
  data: {
    id: `ZL-${generateId()}`,
    name: req.body.name,
    phone: req.body.phone,
    createdByUserId: req.user.id,
    globalCallStatus: 'not_called',
  }
})
```

### 2. Validate Input with Zod
```typescript
import { z } from 'zod'

const createLeadSchema = z.object({
  name: z.string().min(1),
  phone: z.string().regex(/^\+/),
  email: z.string().email().optional(),
})

const data = createLeadSchema.parse(req.body)
```

### 3. Consistent Error Responses
```typescript
// Always return this format:
{
  success: false,
  error: {
    code: 'LEAD_NOT_FOUND',
    message: 'Lead ZL-1234 does not exist',
    requestId: req.id,
    timestamp: new Date()
  }
}
```

### 4. Check Permissions First
```typescript
// In every endpoint:
async getLead(req, res) {
  const lead = await prisma.lead.findUnique({where: {id}})
  
  // Check permissions BEFORE returning data
  if (!canViewLead(req.user, lead)) {
    return res.status(403).json({error: 'FORBIDDEN'})
  }
  
  return res.json(lead)
}
```

### 5. Log Everything
```typescript
// Create audit trail:
await prisma.auditLog.create({
  data: {
    entityType: 'lead',
    entityId: lead.id,
    action: 'create',
    userId: req.user.id,
    changes: { oldValue: null, newValue: lead }
  }
})
```

---

## 🧠 REMEMBER THESE KEY FACTS

1. **Lead is the master entity**
   - All products attach to leads
   - All comments are on leads
   - Call status is global to lead, not per-product

2. **Different products have different limits**
   - Education Loan: max 1 per lead ← Enforce this!
   - Remittance: unlimited per lead

3. **Different counselors can own different products for same lead**
   - Counselor A manages Loan for Lead X
   - Counselor B manages Remittance for Lead X
   - Both see the lead, but can only edit their own product

4. **Soft-delete everything**
   - Never DELETE from database
   - Always set `archived_at` timestamp
   - Queries should filter `WHERE archived_at IS NULL`

5. **Check permissions at the API layer**
   - Don't just hide UI buttons
   - Validate in middleware that user can access the resource
   - Return 403 FORBIDDEN if they can't

---

## 📞 DEBUGGING CHECKLIST

If something doesn't work:

- [ ] Is the JWT token valid? (Check exp, sub claims)
- [ ] Does the user have the right role? (admin vs counselor)
- [ ] Is the resource archived? (Check archived_at IS NULL)
- [ ] Are indexes being used? (Run EXPLAIN ANALYZE)
- [ ] Are permissions checked? (Look for middleware)
- [ ] Is data being cached? (Check Redis TTL)
- [ ] Are relationships loaded? (Prisma include{})

---

## ✅ SESSION CHECKLIST

**Start of Session**:
- [ ] Read this file (2 min)
- [ ] Read `.kiro/EXECUTION_CHECKPOINT.md` (3 min)
- [ ] Open `.kiro/specs/zolve-crm-lead-first/tasks.md`
- [ ] Pick a task from current phase
- [ ] Reference design.md when needed

**After Each Task**:
- [ ] Code builds without errors
- [ ] Tests pass (unit + integration)
- [ ] Commit with clear message
- [ ] Move to next task

**End of Session**:
- [ ] Mark completed tasks as done
- [ ] Document any blockers
- [ ] Update this reference if found issues

---

## 🎯 NEXT IMMEDIATE STEPS

1. **Open**: `.kiro/specs/zolve-crm-lead-first/tasks.md`
2. **Find**: "Phase 1: Project Setup & Foundation"
3. **Start with**: Task 1.1.1 (Initialize Backend Project)
4. **Create**: `/backend` folder with:
   ```
   backend/
   ├── src/
   │   ├── index.ts (main entry)
   │   ├── middleware/
   │   ├── controllers/
   │   ├── services/
   │   └── models/
   ├── prisma/
   │   └── schema.prisma
   ├── package.json
   └── tsconfig.json
   ```
5. **First Success**: `npm run dev` starts server without errors

---

**This reference never changes. Bookmark it.**

**When confused: Come back here.**

**When task is unclear: Check design.md**

**When uncertain about data format: Check App.tsx**

---

🎯 **You have everything. Just build.**

