# Frontend-Backend Connectivity - Quick Fix Reference

## ✅ All Fixes Applied

### 1. Frontend Production API URL
```
File: Frontend/.env.production
Change: Added /api to the URL path
Old: VITE_API_URL=https://zolve-cross-sales-f20up5jt7-mantis-forex.vercel.app
New: VITE_API_URL=https://zolve-cross-sales-f20up5jt7-mantis-forex.vercel.app/api
```

### 2. Frontend Development Environment
```
File: Frontend/.env (NEW)
Content:
  VITE_API_URL=http://localhost:3000/api
  VITE_ENVIRONMENT=development
```

### 3. API Client TypeScript Fix
```
File: Frontend/src/app/services/api.ts
Old: const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
New: const BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000/api';
```

### 4. Vite Configuration Types
```
File: Frontend/vite.config.ts
Added: Type declaration for ImportMeta.env
```

### 5. Backend CORS Configuration
```
File: backend/src/index.ts
Added: Production domain to allowed origins list
Now includes:
  - https://zolve-cross-sales-staging.web.app
  - https://zolve-cross-sales-f20up5jt7-mantis-forex.vercel.app (NEW)
  - http://localhost:5173
  - http://localhost:3000 (NEW)
  - process.env.FRONTEND_URL
```

---

## 🧪 Immediate Testing Instructions

### Test 1: Health Check (No Auth Required)
```bash
# From browser console or terminal:
curl http://localhost:3000/health

# Expected Response:
# { "status": "ok", "timestamp": "2024-..." }
```

### Test 2: Local Development Setup
```bash
# Terminal 1: Start Backend
cd backend
npm run build  # Apply CORS fix
npm run dev
# Should see: 🚀 Server running on http://localhost:3000

# Terminal 2: Start Frontend  
cd Frontend
npm run dev
# Should see: ➜  Local: http://localhost:5173
```

### Test 3: Network Request Verification
1. Open `http://localhost:5173` in browser
2. Open DevTools (F12)
3. Go to Network tab
4. Try to login or navigate to leads page
5. Look for requests to `http://localhost:3000/api/*`
6. Verify status is 200/201 (not 404 or 500)

### Test 4: API Endpoints Testing
```javascript
// Try in browser console after login:

// Get leads
fetch('http://localhost:3000/api/leads', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
})
.then(r => r.json())
.then(d => console.log('Leads:', d))

// Get loans  
fetch('http://localhost:3000/api/loans', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
})
.then(r => r.json())
.then(d => console.log('Loans:', d))
```

---

## 📋 Verification Checklist

- [ ] Backend builds without errors: `cd backend && npm run build`
- [ ] Backend starts: `npm run dev` (see "🚀 Server running...")
- [ ] Frontend starts: `npm run dev` (see "✓ Vite ready...")
- [ ] Can navigate to http://localhost:5173
- [ ] DevTools Network tab shows requests to http://localhost:3000/api/*
- [ ] No 404 errors in Network tab
- [ ] No CORS errors in Console
- [ ] Can login successfully
- [ ] Can view leads list
- [ ] Can view loans list

---

## 🚀 Deployment Steps

### Before Deployment:
1. ✅ **Verify local testing passes all checks above**
2. ⏳ **Update production domain** if different from current URL
3. ⏳ **Rebuild backend:** `cd backend && npm run build`
4. ⏳ **Build frontend:** `cd Frontend && npm run build`

### Deploy to Vercel:
```bash
# Push to GitHub (if using GitHub integration)
git add .
git commit -m "Fix frontend-backend connectivity"
git push

# Or deploy directly:
# https://vercel.com/docs/cli/deploying-with-vercel
```

### After Deployment:
1. Open production URL: `https://zolve-cross-sales-f20up5jt7-mantis-forex.vercel.app`
2. Open DevTools Network tab
3. Verify requests to `/api/*` succeed
4. Test login and data fetching

---

## 🔍 If Still Not Working

### Check 1: Verify Production Domain
```bash
# Confirm the actual Vercel URL
curl https://zolve-cross-sales-f20up5jt7-mantis-forex.vercel.app/health

# Should return: { "status": "ok", "timestamp": "..." }
```

### Check 2: Verify Backend Deployed
```bash
# Check if backend is accessible
curl https://zolve-cross-sales-f20up5jt7-mantis-forex.vercel.app/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'

# Should NOT return 404
```

### Check 3: Check Vercel Logs
1. Go to https://vercel.com/dashboard
2. Select project
3. Go to "Deployments" tab
4. Click latest deployment
5. Go to "Logs" tab
6. Search for errors

### Check 4: Review Environment Variables
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Verify `FRONTEND_URL` is set correctly
3. Verify `DATABASE_URL` is set
4. Verify `JWT_SECRET` is set

---

## 📊 Common Error Messages & Fixes

### Error: "Cannot GET /api/leads"
**Cause:** Backend not running or wrong URL
**Fix:** Ensure backend is started and `/api` prefix is in URL

### Error: "CORS error"
**Cause:** Origin not in allowed list
**Fix:** Check that your domain is in CORS origins in backend/src/index.ts

### Error: "401 Unauthorized"
**Cause:** No auth token
**Fix:** Login first, token should be stored in localStorage

### Error: "404 Not Found on /leads"
**Cause:** Missing `/api` prefix
**Fix:** Update VITE_API_URL to include `/api`

### Error: "Failed to fetch"
**Cause:** Backend not running or network error
**Fix:** Verify backend is running with `curl http://localhost:3000/health`

---

## 📁 Files Modified Summary

| File | Status | Critical |
|------|--------|----------|
| Frontend/.env.production | ✅ Fixed | YES |
| Frontend/.env.staging | ✅ OK | NO |
| Frontend/.env | ✅ Created | YES |
| Frontend/src/app/services/api.ts | ✅ Fixed | YES |
| Frontend/vite.config.ts | ✅ Fixed | NO |
| backend/src/index.ts | ✅ Fixed | YES |
| vercel.json | ✅ OK | NO |

---

## 🎯 Expected Behavior After Fixes

### Local Development:
- Frontend at: `http://localhost:5173`
- Backend at: `http://localhost:3000`
- API requests to: `http://localhost:3000/api/*`
- All requests should have `Authorization: Bearer <token>` header
- All successful responses have `{ success: true, data: {...} }`

### Production:
- Frontend at: `https://zolve-cross-sales-f20up5jt7-mantis-forex.vercel.app`
- Backend at: Same domain (served via Vercel serverless)
- API requests to: `https://zolve-cross-sales.../api/*`
- All requests routed via `/api/(.*)` → `/index.js` in vercel.json

---

## 💡 Key Concepts

**Why `/api` prefix is needed:**
- Separates API requests from static frontend files
- Vercel uses `/api/*` routes to route to backend
- Makes API endpoints explicitly visible in network tab

**How routing works:**
- Frontend makes request to: `GET /api/leads`
- Browser adds domain: `GET https://domain/api/leads`
- Vercel sees `/api/` prefix → Routes to backend (`/index.js`)
- Backend Express sees `/api/leads` → Routes to leads handler

**Auth token flow:**
- Frontend stores token in localStorage after login
- API client adds token to headers: `Authorization: Bearer <token>`
- Backend auth middleware validates token
- If valid, request proceeds; if invalid, returns 401

