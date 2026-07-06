# 🔄 Session Recovery Protocol

**PURPOSE**: If you start a new session and feel lost, THIS is your immediate action plan.

---

## 🆘 "I'm starting a new session and don't know where we are"

### 30-Second Recovery

1. Open this file (you're reading it now ✓)
2. Open `.kiro/EXECUTION_CHECKPOINT.md` (answer: "Where are we?")
3. Open `.kiro/QUICK_START_REFERENCE.md` (answer: "What do I do?")
4. Open `.kiro/specs/zolve-crm-lead-first/tasks.md` (answer: "What's next?")

**That's it. You're caught up.**

---

## 📍 WHERE ARE WE?

### Current Status (As of Last Session)

```
Zolve CRM Platform - Status Report
───────────────────────────────────

✅ COMPLETE:
  • Requirements gathered (32 total)
  • Architecture designed (9 data models)
  • Technical design written (database schema, API design)
  • Implementation plan created (119 tasks)
  
⏳ NOT STARTED:
  • Backend code
  • Frontend integration
  • Testing
  • Deployment
  
🎯 NEXT PHASE:
  → Backend implementation starting with Phase 1
```

### File Structure

```
.kiro/
├── EXECUTION_CHECKPOINT.md     ← Read this FIRST in new session
├── QUICK_START_REFERENCE.md    ← This is your cheat sheet
├── SESSION_RECOVERY.md         ← You are here
└── specs/
    ├── zolve-crm-lead-first/
    │   ├── requirements.md      ← What we're building (16 reqs)
    │   ├── design.md            ← How we're building it (architecture)
    │   └── tasks.md             ← Implementation roadmap (71 tasks)
    │
    └── zolve-crm-education-loan/
        ├── requirements.md      ← Loan product reqs (16 reqs)
        ├── design.md            ← Loan technical design
        └── tasks.md             ← Loan implementation (48 tasks)
```

---

## ❓ COMMON "WHERE AM I?" SCENARIOS

### Scenario 1: "I just started, where do I begin?"

**Answer**: Phase 1 (Project Setup)

```
Action: Open `.kiro/specs/zolve-crm-lead-first/tasks.md`
Search: "Phase 1: Project Setup & Foundation"
Tasks:  1.1.1 through 1.3.3
Goal:   Get a running Node/TS app with DB and JWT auth
```

### Scenario 2: "I finished Phase X, what comes next?"

**Answer**: Check the tasks file

```
Action: Open `.kiro/specs/zolve-crm-lead-first/tasks.md`
Search: "Phase Y: [Next Phase Name]"
Read:   First 3 tasks to understand what you're building
```

### Scenario 3: "I need to know how something should be designed"

**Answer**: Check design.md

```
Action: Open `.kiro/specs/zolve-crm-lead-first/design.md`
Search: What you need (e.g., "API Endpoints", "Data Models", "Database Schema")
Reference: Shows exact structure and relationships
```

### Scenario 4: "I need to know what the frontend expects"

**Answer**: Check the frontend code

```
Action: Open `CRM Dashboard Setup/src/app/App.tsx`
Search: Relevant interface (Lead, LoanApp, LenderInfo, etc.)
Lines:  Interfaces are defined at the top (lines 13-60)
Use:    Match your API responses to these exactly
```

---

## 🚦 QUICK STATUS CHECK

**Ask yourself these 4 questions**:

1. **Is there a `/backend` folder?**
   - YES → Go to Question 2
   - NO → Start Phase 1 (project setup)

2. **Is there a `/backend/prisma/schema.prisma`?**
   - YES → Go to Question 3
   - NO → Work on Task 1.2 (database setup)

3. **Can you run `npm run dev` and get no errors?**
   - YES → Go to Question 4
   - NO → Fix errors first, check package.json dependencies

4. **Can you GET /api/leads and get 401 if no JWT?**
   - YES → Work on Phases 2-4 (lead CRUD)
   - NO → Go back to Phase 1 tasks, focus on auth

---

## 🔍 TASK TRACKING

### How to Know What's Done

**Option 1**: Look at tasks.md
- Tasks marked with `[x]` are done
- Tasks with `[ ]` are not started
- Update these as you complete work

**Option 2**: Check git history
- `git log --oneline` shows what was implemented
- Look for task IDs in commit messages

**Option 3**: Check filesystem
- Does `/backend` exist? (Phase 1 started)
- Does database schema exist? (Task 1.2 done)
- Do API routes exist? (Phases 2+ in progress)

---

## ⚠️ CRITICAL RULES (Don't Break These)

### Rule 1: Don't Skip Phases
```
DON'T:  Start Phase 5 (Education Loan) without Phase 1-4
DO:     Complete phases in order (they have dependencies)
Reason: Phase 5 depends on leads, products, comments from earlier phases
```

### Rule 2: Keep Architecture Clean
```
DON'T:  Put education-loan logic in core CRM files
DO:     Keep education-loan in separate services/routes
Reason: Future products (Remittance, Accommodation) need same pattern
```

### Rule 3: Permissions First
```
DON'T:  Build a feature then add permissions
DO:     Add permission check as part of the endpoint
Reason: Security holes are expensive to fix later
```

### Rule 4: Always Soft-Delete
```
DON'T:  DELETE FROM leads WHERE id = ?
DO:     UPDATE leads SET archived_at = NOW() WHERE id = ?
Reason: Audit trail requires complete history
```

### Rule 5: Match Frontend Contracts
```
DON'T:  Return {lead_id, global_call_status, ...}
DO:     Return {leadId, callStatus, ...} (camelCase)
Reason: Frontend expects exact field names and types
```

---

## 🎯 NAVIGATION GUIDE

### "I need to implement [FEATURE]"

| Feature | Where To Look | What To Read |
|---------|---|---|
| Add a new lead | tasks.md Phase 2 | design.md "Lead API" |
| Create education loan | tasks.md Phase 5 | design.md "Education Loan Service" |
| Request documents | tasks.md Phase 7 | design.md "Document Services" |
| Add lender | tasks.md Phase 6 | design.md "Lender Management" |
| Check permissions | tasks.md Phase 8 | design.md "RBAC" |
| See admin dashboard | tasks.md Phase 9 | design.md "Admin APIs" |

### "I need to debug [PROBLEM]"

| Problem | Check First | Then Check |
|---------|---|---|
| API returns 401 | JWT token valid? | Auth middleware configured? |
| Can't see other user's lead | Permissions check? | Is user counselor or admin? |
| Database query slow | Indexes created? | Query plan (EXPLAIN ANALYZE) |
| Frontend breaks | Response field names | Data types match interface |
| Duplicate leads appear | Soft-delete logic | Archived_at filtering |

---

## 📋 END-OF-SESSION TEMPLATE

**When you finish a session, create a note like this**:

```
Session End Report
─────────────────

Date: [DATE]
Duration: [HOURS]

✅ Completed:
- Task 1.1.1 (Project init)
- Task 1.2.1 (DB schema)

⏳ In Progress:
- Task 1.3.1 (JWT auth - 50% done)

🚧 Blocked:
- Task 1.3.2 (Need Redis setup docs)

📝 Notes:
- Password hashing working with bcrypt
- Need to add refresh token to Redis cache
- Consider using Docker Compose for local dev

Next Session:
→ Finish Task 1.3.1 (JWT token generation)
→ Move to Task 1.3.2 (RBAC middleware)
→ Target: Complete Phase 1 before Phase 2 starts
```

---

## 🔐 CONTEXT RECOVERY CHECKLIST

**If you feel completely lost, do this**:

- [ ] Read EXECUTION_CHECKPOINT.md (2 min) - You'll understand what's done
- [ ] Read QUICK_START_REFERENCE.md (5 min) - You'll know what to build
- [ ] Skim the relevant requirements.md (5 min) - You'll understand the feature
- [ ] Skim the relevant design.md (5 min) - You'll know HOW to build it
- [ ] Look at current Phase in tasks.md (2 min) - You'll know WHAT to code

**Total time to full context**: ~20 minutes

---

## 🎓 LEARNING RESOURCES (If You Need Them)

### Architecture Decisions
- Read: `.kiro/specs/zolve-crm-lead-first/design.md` - "High-Level System Design"
- Explains: Why Node/Express/PostgreSQL/Prisma

### Data Model Details
- Read: `.kiro/specs/zolve-crm-lead-first/design.md` - "Core Data Models"
- Explains: Every table and field and why it exists

### API Design
- Read: `.kiro/specs/zolve-crm-lead-first/design.md` - "API Design"
- Explains: Every endpoint, request format, response format

### Security Model
- Read: `.kiro/specs/zolve-crm-lead-first/design.md` - "Authentication & Authorization"
- Explains: JWT, refresh tokens, RBAC, permissions

### Frontend Contracts
- Read: `Frontend/src/app/App.tsx` - Lines 13-60
- Explains: Exact data structures frontend expects

---

## 🚀 IMMEDIATE NEXT STEPS

**Right now, do this**:

```
1. Are we in the middle of implementation? (backend/ folder exists)
   NO  → Start Phase 1 (initialize project)
   YES → Continue with current phase

2. Check which phase we're on
   Run: git log --oneline | head -20
   Look for phase/task indicators in commit messages

3. Open the tasks file for that phase
   File: .kiro/specs/zolve-crm-lead-first/tasks.md
   Search: Current phase name

4. Read first task description
   → Understand acceptance criteria
   → Reference design.md for technical details
   → Start coding

5. When stuck
   → Check QUICK_START_REFERENCE.md for tips
   → Look at frontend code for data contracts
   → Reference design.md for architecture
```

---

## ⏰ TIME ESTIMATES (For Planning)

| Phase | Duration | Why |
|-------|----------|-----|
| Phase 1 | 1-2 weeks | Foundation, can't skip |
| Phases 2-4 | 2-3 weeks | Lead management, core features |
| Phases 5-6 | 2-3 weeks | Education loan, lender mgmt |
| Phase 7-8 | 1-2 weeks | Documents, integration |
| Phases 9-13 | 4-6 weeks | Testing, optimization, DevOps |
| **TOTAL** | **16-20 weeks** | 2-3 person team |

---

## 💡 PRO TIPS

1. **Use git branch per task**
   ```
   git checkout -b feat/1.1.1-project-init
   [do work]
   git commit -m "Task 1.1.1: Initialize Node/TS backend"
   git push origin feat/1.1.1-project-init
   ```

2. **Mark tasks as done**
   ```
   Update tasks.md
   Change: - [ ] 1.1.1
   To:     - [x] 1.1.1
   Commit
   ```

3. **Run tests frequently**
   ```
   After each task: npm test
   After each phase: npm run test:integration
   ```

4. **Check database often**
   ```
   After schema changes: prisma migrate dev
   Check migrations: prisma migrate status
   ```

5. **Keep notes**
   ```
   Document why decisions were made
   Note any deviations from spec
   Record blockers and solutions
   ```

---

## ❌ WHAT NOT TO DO

- ❌ Skip phases in order
- ❌ Change data model without updating spec
- ❌ Build without tests
- ❌ Hardcode values in code
- ❌ Forget to check permissions
- ❌ Use hard-delete instead of soft-delete
- ❌ Build education-loan code in core CRM folder
- ❌ Return data without matching frontend interfaces
- ❌ Leave debug code in commits

---

## ✅ YOU'RE READY

This protocol exists so you never lose context again.

**Bookmark these files**:
- `.kiro/EXECUTION_CHECKPOINT.md` - Current status
- `.kiro/QUICK_START_REFERENCE.md` - How-to guide  
- `.kiro/SESSION_RECOVERY.md` - This file
- `.kiro/specs/zolve-crm-lead-first/tasks.md` - What to do
- `.kiro/specs/zolve-crm-lead-first/design.md` - How to do it

**When you start next session**:
1. Read EXECUTION_CHECKPOINT.md
2. Read QUICK_START_REFERENCE.md
3. Open tasks.md for your current phase
4. Start coding

**You have everything you need.**

---

