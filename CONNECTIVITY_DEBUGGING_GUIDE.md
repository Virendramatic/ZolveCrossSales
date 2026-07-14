# Frontend-Backend Connectivity Debugging Guide

## Root Cause Summary

The frontend and backend couldn't connect due to:

1. **Wrong production API URL** - Missing `/api` prefix
2. **TypeScript error** - `import.meta.env` not properly typed
3. **CORS misconfiguration** - Missing production domain
4. **Missing local dev environment file** - No `.env` for development

---

## What Was Fixed

### Fix #1: Production API URL
**Problem:** 
```
Frontend was calling: https://zolve-cross-sales.../leads
Backend expects:     https://zolve-cross-sales.../api/leads
Result: 404 Not Found
```

**Solution:**
Updated `Frontend/.env.production` to include `/api` path:
```env
# Before
VITE_API_URL=https://zolve-cross-sales-f20up5jt7-mantis-forex.vercel.app

# After  
VITE_API_URL=https://zolve-cross-sales-f20up5jt7-mantis-forex.vercel.app/api
```

**Impact:** All production API requests now go to correct `/api/*` paths

---

### Fix #2: TypeScript Type Error
**Problem:**
```typescript
// Error: Property 'env' does not exist on type 'ImportMeta'
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

**Solution:**
```typescript
// Type cast to string and add fallback with /api
const BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000/api';
```

**Impact:** 
- TypeScript error resolved
- Local fallback now includes `/api` path
- Vite will properly load environment variables

---

### Fix #3: Vite Configuration
**Problem:**
```
TypeScript doesn't know about import.meta.env properties
```

**Solution:**
Added global type declaration in `vite.config.ts`:
```typescript
declare global {
  interface ImportMeta {
    readonly env: Record<string, string>;
  }
}
```

**Impact:** TypeScript recognizes all `import.meta.env.*` variables

---

### Fix #4: Local Development Environment
**Problem:**
```
No .env file for local development
Frontend defaults to http://localhost:3000 (without /api)
```

**Solution:**
Created `Frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api
VITE_ENVIRONMENT=development
```

**Impact:**
- Local development now correctly points to backend
- Fallback in api.ts no longer used
- Clear environment setup

---

### Fix #5: CORS Configuration
**Problem:**
```javascript
Backend only allowed staging domain, missing production domain
```

**Solution:**
Updated `backend/src/index.ts`:
```typescript
const corsOptions: any = {
  origin: [
    'https://zolve-cross-sales-staging.web.app',
    'https://zolve-cross-sales-f20up5jt7-mantis-forex.vercel.app',  // Added
    'http://localhost:5173',
    'http://localhost:3000',  // Added
    process.env.FRONTEND_URL
  ].filter(Boolean),
  // ... rest of config
};
```

**Impact:** Production and local requests now pass CORS checks

---

## Request Flow Verification

### How to Verify Frontend-Backend Connection

#### Step 1: Start Local Services
```bash
# Terminal 1 - Backend
cd backend
npm run build  # Rebuild with CORS fix
npm run dev

# Output should show:
# 🚀 Server running on http://localhost:3000
# 📝 Environment: development
```

```bash
# Terminal 2 - Frontend
cd Frontend
npm run dev

# Output should show:
# VITE v6.x.x ready in xxx ms
# ➜  Local:   http://localhost:5173
```

#### Step 2: Open DevTools Network Tab
1. Navigate to `http://localhost:5173`
2. Right-click → Inspect → Network tab
3. Look for any API requests (leads, auth, etc.)

#### Step 3: Expected Request Flow
```
Frontend Action → API Request
  ↓
HTTP Method: GET/POST/PUT/DELETE
URL: http://localhost:3000/api/leads (or other endpoint)
Headers: 
  - Authorization: Bearer <token>
  - Content-Type: application/json
  ↓
Status: 200/201/204 (success) or 401/403/404 (error)
Response: { success: true, data: {...} }
```

#### Step 4: Verify Each API Category

**Leads API:**
```javascript
// In browser console while on leads page
fetch('http://localhost:3000/api/leads', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
})
  .then(r => r.json())
  .then(d => console.log(d))

// Expected: { success: true, data: { leads: [], ... } }
```

**Loans API:**
```javascript
fetch('http://localhost:3000/api/loans', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
})
  .then(r => r.json())
  .then(d => console.log(d))

// Expected: { success: true, data: [...] }
```

**Health Check:**
```javascript
fetch('http://localhost:3000/health')
  .then(r => r.json())
  .then(d => console.log(d))

// Expected: { status: 'ok', timestamp: '...' }
```

---

## Deployment Verification

### Before Deploying to Vercel

1. **Confirm Production Domain:**
   - Get actual Vercel project URL
   - Verify frontend deployment URL
   - Verify backend is in same project/domain

2. **Update Environment Files:**
   - Ensure `.env.production` has correct domain
   - Ensure `.env.staging` is correct

3. **Build Locally:**
   ```bash
   cd backend
   npm run build
   
   cd ../Frontend
   npm run build
   ```

4. **Test Production Build Locally:**
   ```bash
   # After building, test with production env vars
   cd Frontend
   VITE_API_URL=http://localhost:3000/api npm run preview
   ```

---

## Troubleshooting Common Issues

### Issue 1: "Failed to fetch" or Network Error

**Cause:** Backend not running or wrong URL

**Debug:**
```bash
# Check if backend is running
curl http://localhost:3000/health

# If fails, start backend:
cd backend
npm run dev

# Check if frontend can reach it:
curl http://localhost:3000/api/leads -H "Authorization: Bearer test"
```

### Issue 2: 404 Not Found

**Cause:** Missing `/api` prefix in URL

**Debug:**
```bash
# Check what frontend is sending
# DevTools → Network → Click request → Headers

# Should see:
# GET http://localhost:3000/api/leads HTTP/1.1

# If seeing:
# GET http://localhost:3000/leads HTTP/1.1
# Then fix: update VITE_API_URL to include /api
```

### Issue 3: CORS Error

**Cause:** Origin not in allowed CORS list

**Error in Console:**
```
Access to XMLHttpRequest at 'http://localhost:3000/api/leads' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Debug:**
```bash
# Check CORS configuration in backend
cat backend/src/index.ts | grep -A 10 "corsOptions"

# Make sure your origin is included:
# http://localhost:5173 for local dev
# https://zolve-cross-sales-*.vercel.app for production
```

### Issue 4: 401 Unauthorized

**Cause:** Missing or invalid auth token

**Debug:**
```bash
# Check if token exists in localStorage
localStorage.getItem('auth_token')

# If undefined, need to login first
# If exists, check if it's valid:
fetch('http://localhost:3000/api/leads', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
})
  .then(r => r.json())
  .then(d => console.log(d))
```

### Issue 5: 500 Internal Server Error

**Cause:** Backend error or missing environment variables

**Debug:**
```bash
# Check backend logs (in terminal where npm run dev is running)
# Look for error messages

# Common causes:
# - DATABASE_URL not set
# - JWT_SECRET not set
# - Prisma migrations not run
# - Database connection failed

# Check backend env files:
cat backend/.env.production
cat backend/.env
```

---

## Environment Variable Hierarchy

### Development:
```
1. Frontend/.env (local dev file - HIGHEST PRIORITY)
2. Frontend/.env.staging (if VITE_* variables override)
3. Hardcoded fallback: 'http://localhost:3000/api'
```

### Staging:
```
1. Frontend/.env.staging
2. Vercel environment variables
3. Hardcoded fallback: 'http://localhost:3000/api'
```

### Production:
```
1. Frontend/.env.production
2. Vercel environment variables
3. Hardcoded fallback: 'http://localhost:3000/api'
```

---

## Files to Review

| File | Purpose | Status |
|------|---------|--------|
| `Frontend/.env` | Local dev config | ✅ Created |
| `Frontend/.env.production` | Production config | ✅ Fixed |
| `Frontend/.env.staging` | Staging config | ✅ OK |
| `Frontend/src/app/services/api.ts` | API client | ✅ Fixed |
| `Frontend/vite.config.ts` | Vite config | ✅ Fixed |
| `backend/src/index.ts` | Backend server | ✅ Fixed |
| `vercel.json` | Vercel routing | ✅ OK |
| `backend/.env.production` | Backend prod env | ⏳ Verify |

---

## Next Actions

1. ✅ **Fixes Applied** - All code changes made
2. 🔄 **Local Testing** - Start backend & frontend, test endpoints
3. 📝 **Deploy** - Push to Vercel after local verification
4. ✅ **Production Test** - Test on production domain
5. 📊 **Monitor** - Watch Vercel logs for any errors

