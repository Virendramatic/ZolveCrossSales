# Deployment Guide - Zolve CRM Education Loan Module

## Pre-Deployment Checklist

- [x] Backend builds successfully (`npm run build`)
- [x] Frontend builds successfully (`npm run build`)
- [x] All Phase 5, 6, 7, 8 tasks completed
- [x] API endpoints tested and working
- [x] Frontend integration complete
- [x] Prisma migrations ready

## Deployment Steps

### 1. Backend Deployment

#### Environment Setup
```bash
# Set production environment variables
DATABASE_URL=<production_database_url>
JWT_SECRET=<production_jwt_secret>
NODE_ENV=production
```

#### Database Migration
```bash
cd backend
# Run Prisma migrations
npx prisma migrate deploy

# Seed data if needed
npx prisma db seed
```

#### Build & Deploy
```bash
cd backend
npm run build

# Option A: Using PM2
pm2 start dist/index.js --name "zolve-crm-backend"

# Option B: Using Docker
docker build -t zolve-crm-backend .
docker run -d --env-file .env.prod zolve-crm-backend

# Option C: Using Cloud Platform (Firebase, Heroku, etc.)
# Follow your platform's deployment process
```

#### Verify Backend
```bash
# Test health endpoint
curl http://<backend-url>/api/leads/stats

# Should return 200 with stats data
```

### 2. Frontend Deployment

#### Build Production
```bash
cd Frontend
npm run build
# Output in Frontend/dist/
```

#### Deploy to Firebase Hosting
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy
firebase deploy --only hosting
```

#### Or Deploy to Other Platforms
- **Vercel**: Push to main branch with Vercel integration
- **Netlify**: Deploy Frontend/dist folder
- **AWS S3 + CloudFront**: Upload dist files to S3
- **Custom Server**: Copy dist files and serve with nginx

### 3. Configuration Updates

#### Update Frontend API URL
In `Frontend/src/app/services/api.ts`:
```typescript
const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.production.com/api';
```

Set environment variable:
```bash
VITE_API_URL=https://api.production.com/api
```

#### Database Connection
Ensure production database is configured:
- PostgreSQL with proper backups
- Connection pooling enabled
- SSL/TLS encryption

### 4. Post-Deployment Verification

#### API Endpoints to Test

1. **Create Loan**
```bash
POST /api/loans
{
  "leadId": "<lead_id>",
  "university": "Harvard University",
  "course": "MBA",
  "targetCountry": "USA",
  "totalLoanAmount": 5000000,
  "collateralType": "NON_COLLATERAL"
}
```

2. **Get Loan**
```bash
GET /api/loans/<loan_id>
```

3. **Match Lenders**
```bash
POST /api/loans/<loan_id>/match
```

4. **Request Documents**
```bash
POST /api/loans/<loan_id>/document-request
{
  "categories": ["KYC", "ACADEMICS"]
}
```

5. **Upload Document**
```bash
POST /api/loans/<loan_id>/documents
{
  "documentRequestId": "<request_id>",
  "documentId": "<doc_id>",
  "fileUrl": "https://...",
  "fileName": "passport.pdf",
  "fileSize": 2048576,
  "mimeType": "application/pdf"
}
```

#### Frontend Testing

1. Navigate to application URL
2. Login with test credentials
3. Create a lead
4. Attach education loan product
5. Fill loan details
6. View loan stage, lenders, documents
7. Request documents
8. Test lender matching
9. Update loan stage

### 5. Monitoring & Logs

#### Backend Logs
```bash
# PM2
pm2 logs zolve-crm-backend

# Docker
docker logs <container_id>

# Cloud Platform
# Check platform-specific log viewer
```

#### Database Backups
```bash
# PostgreSQL
pg_dump <database> > backup_$(date +%Y%m%d).sql
```

#### Error Tracking
- Set up Sentry for error monitoring
- Configure email alerts for critical errors
- Monitor API response times

### 6. Performance Optimization

#### Backend
- Enable query caching (2-hour TTL for recommendations)
- Add database indexes for frequently queried fields
- Implement rate limiting on API endpoints
- Use connection pooling

#### Frontend
- Verify CSS/JS bundle sizes (target < 300KB gzip)
- Lazy load components
- Enable browser caching

#### Database
- Add indexes on:
  - `EducationLoanApplication.loanStage`
  - `EducationLoanApplication.counselorZrmId`
  - `LenderApplication.educationLoanId`
  - `DocumentSubmission.documentRequestId`

### 7. Security Checks

- [ ] HTTPS enabled for all endpoints
- [ ] CORS properly configured
- [ ] API rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention verified
- [ ] JWT token expiration configured
- [ ] Secrets not committed to repository
- [ ] Database credentials secured

### 8. Rollback Plan

If issues arise:

1. **Frontend Rollback**
```bash
firebase deploy --only hosting:production  # Deploy previous version
# Or revert to previous deployment on your platform
```

2. **Backend Rollback**
```bash
# Stop current version
pm2 stop zolve-crm-backend

# Deploy previous version
git checkout <previous_commit>
npm run build
pm2 start dist/index.js --name "zolve-crm-backend"
```

3. **Database Rollback**
```bash
# Restore from backup
psql < backup_YYYYMMDD.sql
```

### 9. Post-Launch Monitoring

- Monitor API response times (target < 200ms)
- Track error rates (target < 0.1%)
- Monitor database query performance
- Collect user feedback for bug fixes
- Monitor storage usage (documents)

---

## Contact & Support

For issues during deployment:
1. Check server logs
2. Verify environment variables
3. Test API endpoints directly
4. Check database connectivity
5. Review error stack traces

## Deployment Completed ✅

Once all steps are verified and tests pass, the education loan module is production-ready.
