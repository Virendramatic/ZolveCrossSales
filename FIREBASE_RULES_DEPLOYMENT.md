# Firebase Security Rules Deployment Guide

## Overview

This project includes three sets of Firebase Security Rules:
1. **Firestore Rules** - `firestore.rules`
2. **Realtime Database Rules** - `database.rules.json`
3. **Storage Rules** - `storage.rules`

## Prerequisites

1. Firebase CLI installed:
```bash
npm install -g firebase-tools
```

2. Logged in to Firebase:
```bash
firebase login
```

3. Project configured in `.firebaserc` (already set up for `zolve-cross-sales-staging`)

## Deployment Steps

### 1. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules --project zolve-cross-sales-staging
```

**What it does:**
- Access control for Firestore collections
- Role-based permissions (ADMIN, COUNSELOR, USER)
- Document-level security
- Validates data structure

### 2. Deploy Realtime Database Rules

```bash
firebase deploy --only database --project zolve-cross-sales-staging
```

**What it does:**
- Access control for Realtime Database
- Ownership-based permissions
- Data validation
- Audit logging access

### 3. Deploy Storage Rules

```bash
firebase deploy --only storage --project zolve-cross-sales-staging
```

**What it does:**
- File upload restrictions (10MB for documents, 2MB for avatars)
- Allowed MIME types (PDF, images, Word, Excel)
- User-based access control
- Temporary upload handling

### 4. Deploy All Rules at Once

```bash
firebase deploy --project zolve-cross-sales-staging
```

This deploys Hosting, Functions, Firestore, Database, and Storage in one command.

## Rules Overview

### Access Control Hierarchy

```
┌─────────────────┐
│    ADMIN        │
│  (Full Access)  │
└─────────────────┘
         △
         │
┌─────────────────┐
│   COUNSELOR     │
│ (Own Resources) │
└─────────────────┘
         △
         │
┌─────────────────┐
│  Authenticated  │
│ (Limited Read)  │
└─────────────────┘
```

### Collection Permissions

#### Users Collection
- **Read**: Self or Admin
- **Write**: Self or Admin
- **Delete**: Admin only

#### Leads Collection
- **Read**: Owner (Counselor) or Admin
- **Create**: Authenticated users
- **Update**: Owner or Admin
- **Delete**: Admin only

#### Education Loans Collection
- **Read**: Loan Counselor or Admin
- **Create**: Authenticated users
- **Update**: Owner or Admin (limited in non-STARTED stages)
- **Delete**: Admin only (archive)

#### Lender Applications
- **Read**: Loan Owner or Admin
- **Write**: Loan Owner or Admin

#### Document Requests
- **Read**: Loan Owner or Admin
- **Write**: Loan Owner or Admin
- **Documents**: Counselor reads, Admin writes (approve/reject)

#### Documents Collection
- **Read**: Owner or Admin
- **Create**: Authenticated users
- **Update**: Admin only (approvals/rejections)
- **Delete**: Admin only

#### Audit Logs
- **Read**: Admin only
- **Write**: Server-generated only (no direct writes)

### Storage Permissions

#### Document Uploads
- **Max Size**: 10MB
- **Allowed Types**: PDF, JPEG, PNG, GIF, DOC, DOCX, XLS, XLSX
- **Path**: `/loans/{loanId}/documents/`
- **Access**: Counselor (read), Admin (all)

#### User Avatars
- **Max Size**: 2MB
- **Allowed Types**: JPEG, PNG, GIF, WebP
- **Path**: `/users/{userId}/avatar`
- **Access**: User (own) or Admin

#### Temp Uploads
- **Max Size**: 50MB
- **Path**: `/temp/{userId}/`
- **Access**: User (own) or Admin

## Testing Rules

### Using Firebase Emulator Suite

1. Install emulator:
```bash
firebase setup:emulators:firestore
firebase setup:emulators:database
firebase setup:emulators:storage
```

2. Start emulator:
```bash
firebase emulators:start --project zolve-cross-sales-staging
```

3. Run tests against emulator (default: localhost:4000)

### Manual Testing via Firebase Console

1. Go to Firebase Console: https://console.firebase.google.com
2. Select project: `zolve-cross-sales-staging`
3. Test read/write operations:
   - Try writing as different roles
   - Verify access is denied appropriately
   - Check data structure validation

## Common Errors & Solutions

### Error: "Missing or insufficient permissions"

**Cause**: User doesn't have required role or doesn't own the resource

**Solution**: 
- Verify user has correct role in `users/{uid}` document
- Check if accessing own resources or need admin access
- Review rule conditions

### Error: "This document does not exist"

**Cause**: Data validation failed (missing required fields)

**Solution**:
- Ensure document has all required fields per `.validate`
- Check field names match exactly
- Verify data types

### Error: "Request size exceeds 10MB"

**Cause**: File upload is too large

**Solution**:
- Compress documents before upload
- Split large files
- Check file size limit in storage rules

## Rule Change Workflow

1. **Update rules** in local files
2. **Test** locally with emulator
3. **Deploy to staging** first
4. **Verify** in staging environment
5. **Deploy to production** after verification

```bash
# Test locally
firebase emulators:start

# Deploy to staging
firebase deploy --project zolve-cross-sales-staging

# Deploy to production
firebase deploy --project zolve-cross-sales-production
```

## Monitoring Rule Violations

1. Go to Firebase Console
2. Navigate to Cloud Firestore → Rules
3. Check "Metrics" tab for:
   - Denied reads/writes
   - Permission errors
   - Performance metrics

4. Set up logging:
```bash
firebase functions:log --project zolve-cross-sales-staging
```

## Security Best Practices

✅ **Do:**
- Always validate authentication status
- Use role-based access control
- Validate data structure on write
- Restrict file uploads by size and type
- Use custom claims for roles
- Test rules before deployment
- Review rules regularly
- Monitor rule violations

❌ **Don't:**
- Allow unauthenticated writes
- Trust client-side validation only
- Expose sensitive data in rules
- Create overly permissive rules
- Skip testing before deployment

## Additional Resources

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/start)
- [Realtime Database Rules Documentation](https://firebase.google.com/docs/database/security)
- [Storage Security Rules Documentation](https://firebase.google.com/docs/storage/security)
- [Firebase Security Rules Emulator](https://firebase.google.com/docs/emulator-suite/connect_firestore)

## Deployment Checklist

- [ ] Rules files created and reviewed
- [ ] Emulator tested locally
- [ ] Deployed to staging environment
- [ ] Tested in Firebase Console
- [ ] Monitoring metrics checked
- [ ] No rule violations observed
- [ ] Performance acceptable
- [ ] Ready for production

---

**Current Status**: Rules prepared for deployment to `zolve-cross-sales-staging` ✅
