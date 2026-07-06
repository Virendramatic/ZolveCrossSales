# Zolve CRM - Backend API

**Status**: Phase 1 - Foundation Complete ✅  
**Technology**: Node.js + TypeScript + Express + PostgreSQL + Prisma

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 13+
- Redis (optional, for caching)
- Docker & Docker Compose (recommended)

### Setup (5 minutes)

#### Option 1: Using Docker Compose (Recommended)

```bash
cd backend

# Start PostgreSQL and Redis
docker-compose up -d

# Install dependencies
npm install

# Setup database
cp .env.example .env
npm run db:generate
npm run db:migrate

# Seed test data
npm run db:seed

# Start development server
npm run dev
```

#### Option 2: Manual Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Update .env with your database URL:
# DATABASE_URL=postgresql://user:password@localhost:5432/zolve_crm

# Setup database
npm run db:generate
npm run db:migrate

# Seed test data
npm run db:seed

# Start development server
npm run dev
```

### Test The Backend

```bash
# Server runs on http://localhost:3000

# Health check
curl http://localhost:3000/health

# Try login (use credentials from seed output)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zolve.com","password":"admin@123"}'
```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── index.ts              # Express app setup
│   ├── middleware/           # Express middleware
│   │   ├── auth.ts          # JWT authentication
│   │   ├── errorHandler.ts  # Error handling
│   │   └── requestLogger.ts # Request logging
│   ├── routes/              # API route handlers
│   │   ├── auth.routes.ts   # Authentication endpoints
│   │   └── lead.routes.ts   # Lead management endpoints
│   ├── services/            # Business logic
│   │   └── auth.service.ts  # Authentication logic
│   ├── schemas/             # Zod validation schemas
│   │   └── auth.schema.ts   # Auth input validation
│   └── utils/               # Utility functions
│       ├── jwt.ts           # JWT token utilities
│       └── password.ts      # Password hashing
├── prisma/
│   ├── schema.prisma        # Database schema (9 models)
│   └── seed.ts              # Database seeding script
├── dist/                    # Compiled JavaScript (generated)
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── .eslintrc.json          # ESLint config
├── .prettierrc.json        # Prettier config
├── docker-compose.yml       # Docker compose for local dev
└── README.md               # This file
```

---

## 🔐 Authentication

### Login Endpoint

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@zolve.com",
  "password": "admin@123"
}

Response:
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "user": {
      "id": "...",
      "email": "admin@zolve.com",
      "name": "Admin User",
      "role": "ADMIN"
    }
  }
}
```

### Using Access Token

```bash
# Include in Authorization header
curl -H "Authorization: Bearer <accessToken>" \
  http://localhost:3000/api/leads

# Token expires in 15 minutes
# Create new token by logging in again
```

### Test Users (From Seed)

| Email | Password | Role |
|-------|----------|------|
| admin@zolve.com | admin@123 | ADMIN |
| rohan@zolve.com | counselor@123 | COUNSELOR |
| sneha@zolve.com | counselor@123 | COUNSELOR |

---

## 📚 API Endpoints (Phase 1)

### Authentication

```
POST   /api/auth/login        Login with email & password
GET    /api/auth/me           Get current user (protected)
POST   /api/auth/logout       Logout user
```

### Leads (Coming Soon - Phase 2)

```
GET    /api/leads             List all leads (requires auth)
POST   /api/leads             Create new lead
GET    /api/leads/:id         Get lead details
PUT    /api/leads/:id         Update lead
DELETE /api/leads/:id         Soft-delete lead
```

---

## 🗄️ Database Schema

### 9 Core Models

1. **User** - Counselors and admins
2. **Lead** - Master entity (all students)
3. **ProductInstance** - Links products to leads
4. **Comment** - Lead comments/remarks
5. **EducationLoanApplication** - Loan applications
6. **LenderApplication** - Per-lender tracking
7. **DocumentRequest** - Document workflows
8. **DocumentSubmission** - Submitted documents
9. **AuditLog** - Audit trail for compliance

### View Schema

```bash
# Show database schema
npm run db:migrate -- -- --preview

# Inspect current state
npm run db:generate
```

---

## 🛠️ Development Commands

```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Linting
npm run lint

# Format code
npm run format

# Type checking
npm run type-check

# Database commands
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Create/run migrations
npm run db:push        # Sync schema to database
npm run db:seed        # Seed test data

# Testing (coming soon)
npm test               # Run unit tests
npm run test:integration  # Run integration tests
```

---

## 🔍 Debugging

### View Database

```bash
# Using Prisma Studio (web UI)
npx prisma studio

# Connect to PostgreSQL directly
psql -h localhost -U zolve_user -d zolve_crm
```

### Check Logs

```bash
# Logs are printed to console
npm run dev

# Look for:
# ✅ Server running on http://localhost:3000
# 📝 Environment: development
# 🌱 Seeding completed successfully!
```

### Common Issues

**Issue: `DATABASE_URL not set`**
- Solution: Copy `.env.example` to `.env` and update values

**Issue: `connect ECONNREFUSED`**
- Solution: Start PostgreSQL: `docker-compose up -d postgres`

**Issue: Seed script fails**
- Solution: Run migrations first: `npm run db:migrate`

---

## 📝 Phase 1 Completion Checklist

- [x] Project initialized with Node/TypeScript
- [x] Express server running
- [x] PostgreSQL database configured
- [x] Prisma ORM set up with 9 data models
- [x] JWT authentication implemented
- [x] Login endpoint working
- [x] Test users created via seed script
- [x] Error handling middleware
- [x] Request logging middleware
- [x] ESLint & Prettier configured
- [x] Docker Compose for local development
- [x] Backend ready for Phase 2 (Lead CRUD)

---

## 🎯 Next Steps (Phase 2)

- [ ] Lead CRUD endpoints
- [ ] Lead status management
- [ ] Global call tracking
- [ ] Comments/remarks system
- [ ] Product instances

---

## 📞 Support

**Backend Running?**
- Try: `curl http://localhost:3000/health`
- Should respond: `{"status":"ok","timestamp":"..."}`

**Login Not Working?**
- Check test user exists: `npx prisma studio`
- Verify password: `admin@123` (from seed)
- Check JWT_SECRET in `.env`

**Database Issues?**
- Check Docker: `docker ps`
- View logs: `docker logs zolve_crm_db`
- Reset DB: `docker-compose down -v && docker-compose up`

---

## 🚀 Ready to Implement

This foundation is complete. Ready to start Phase 2: Lead Management APIs.

See `.kiro/specs/zolve-crm-lead-first/tasks.md` for next tasks.

