# Architecture Overview - Zolve Quote System

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browsers                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Login Page          Calculator          Admin Portal      │   │
│  │ (index.html)    (calculator.html)     (admin.html)        │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  JavaScript Modules                                       │   │
│  │  ├─ auth.js (Authentication)                            │   │
│  │  ├─ firestore.js (Database Operations)                  │   │
│  │  └─ admin.js (Admin Functions)                          │   │
│  │                                                          │   │
│  │  CSS Modules                                             │   │
│  │  ├─ admin-styles.css (1600+ lines)                      │   │
│  │  └─ responsive.css (Mobile-first design)                │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                           HTTPS (TLS 1.3)
                                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Firebase Platform (GCP)                       │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Firebase Authentication                                 │   │
│  │  ├─ Email/Password (Firebase Auth)                      │   │
│  │  ├─ Google OAuth 2.0                                    │   │
│  │  └─ Session Management (localStorage)                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Firestore Database (Real-Time)                          │   │
│  │  ├─ users/                   (User Profiles)             │   │
│  │  │  └─ {userId}             (role: user/admin)          │   │
│  │  │     ├─ uid, email, name                              │   │
│  │  │     ├─ role (user or admin)                          │   │
│  │  │     ├─ createdAt, lastLogin                          │   │
│  │  │     └─ ...metadata                                   │   │
│  │  │                                                       │   │
│  │  └─ quotes/                  (Quote Data)                │   │
│  │     └─ {quoteId}             (Indexed)                  │   │
│  │        ├─ userId (foreign key)                          │   │
│  │        ├─ customerName, phone                           │   │
│  │        ├─ currency, exchangeRate                        │   │
│  │        ├─ amounts (foreign, INR, etc)                   │   │
│  │        ├─ fees (forex, SWIFT, GST)                      │   │
│  │        └─ timestamps (createdAt, updatedAt)             │   │
│  │                                                          │   │
│  │  Firestore Security Rules (Row-level)                   │   │
│  │  ├─ Users can access only their own data                │   │
│  │  ├─ Admins can access all data                          │   │
│  │  ├─ Role verification on every operation                │   │
│  │  └─ Field-level security                                │   │
│  │                                                          │   │
│  │  Database Indexes (Auto-created)                        │   │
│  │  ├─ userId + createdAt (quotes)                         │   │
│  │  ├─ createdAt (for sorting)                             │   │
│  │  └─ role (for admin filtering)                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Firebase Hosting (CDN)                                  │   │
│  │  ├─ Global CDN distribution                             │   │
│  │  ├─ Automatic SSL/TLS                                   │   │
│  │  ├─ Custom rewrites (routing)                           │   │
│  │  ├─ Gzip compression                                    │   │
│  │  └─ Long-term caching (for static assets)               │   │
│  │                                                          │   │
│  │  Routing Configuration:                                  │   │
│  │  ├─ / → index.html (login)                              │   │
│  │  ├─ /calculator → calculator.html (user app)            │   │
│  │  ├─ /admin → admin.html (admin portal)                  │   │
│  │  └─ ** → index.html (SPA fallback)                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

### User Login Flow
```
User Browser          Firebase Auth          Firestore
     │                    │                      │
     ├─ Enter credentials │                      │
     │────────────────→ Verify user         
     │                    │→ Check credentials   
     │                    ├─ Create session      
     │◄─ Auth token ──────┤                      │
     │                    │                      │
     │◄─ Redirect to app ─┤                      │
     │                    │                      │
     ├─ Load user doc ────────────────────────→  │
     │                    │◄─ User data ────────┤
```

### Quote Generation Flow
```
User Browser          JavaScript             Firestore
     │                    │                      │
     ├─ Enter data        │                      │
     │─→ Generate quote   │                      │
     │    calculate fee   │                      │
     │                    │                      │
     │◄─ Display quote ───┤                      │
     │                    │                      │
     ├─ Click save        │                      │
     │────────────────→ Create document          │
     │                    ├─ Add userId          │
     │                    ├─ Add timestamp       │
     │────────────────→ Save to Firestore        │
     │                    │                      │
     │                    ├─ Validate rules      │
     │                    ├─ Store document ──→  │
     │◄─ Success toast ───┤◄─ Confirmation ─────┤
```

### Admin Access Flow
```
Admin Browser         Firebase              Firestore
     │                   │                      │
     ├─ Login           │                      │
     ├─ Auth token ───→ │                      │
     │                   │◄─ Create session    │
     │◄─ Token ──────────┤                      │
     │                   │                      │
     ├─ Check role ──────────────────────────→  │
     │                   │◄─ role: "admin" ────┤
     │                   │                      │
     ├─ Load dashboard   │                      │
     │────────────────────→ Query all quotes    │
     │                   │                      │
     │                   │ Verify admin role    │
     │                   │ (security rules)     │
     │                   │                      │
     │                   ├─ Aggregate data      │
     │                   ├─ Calculate stats ───→│
     │◄─ Dashboard ──────┤◄─ All quotes ────────┤
```

---

## 🔐 Security Architecture

### Authentication Flow
```
┌─────────────────────────────────────────────────┐
│           Authentication Decision Point         │
│                                                 │
│  1. User visits app (index.html)                │
│  2. onAuthStateChanged() fires                  │
│  3. Check if user logged in                     │
│     ├─ YES → Get user UID                       │
│     │        Check Firestore for role           │
│     │        ├─ role: 'admin' → /admin          │
│     │        └─ role: 'user'  → /calculator     │
│     │                                            │
│     └─ NO → Show login page                     │
│                                                 │
│  4. User enters credentials                     │
│  5. Firebase verifies                           │
│  6. Create auth session                         │
│  7. Fetch user document                         │
│  8. Redirect based on role                      │
└─────────────────────────────────────────────────┘
```

### Authorization (Firestore Rules)
```
┌─────────────────────────────────────────────────┐
│      Firestore Security Rules Evaluation        │
│                                                 │
│  Every read/write goes through rules:           │
│                                                 │
│  1. Check authentication                        │
│     ├─ request.auth.uid != null               │
│     └─ User is logged in?                      │
│                                                 │
│  2. Check authorization                        │
│     ├─ Get user's role from Firestore          │
│     └─ admin? → Allow all                      │
│           user? → Allow own data only          │
│                                                 │
│  3. Check specific rules                        │
│     ├─ Users collection                        │
│     │  └─ Can read/write: own document only    │
│     │  └─ Can read (admin): all documents      │
│     │                                            │
│     └─ Quotes collection                       │
│        └─ Can read/write: own quotes only      │
│        └─ Can read (admin): all quotes         │
│        └─ Can delete: own or admin             │
│                                                 │
│  4. Return result                               │
│     ├─ Allow → Operation succeeds              │
│     └─ Deny  → Firestore error returned        │
└─────────────────────────────────────────────────┘
```

---

## 💾 Database Schema

### Collections & Documents

**users Collection**
```
/users
├─ uid1 (document key = Firebase UID)
│  ├─ uid: "uid1"
│  ├─ email: "user@example.com"
│  ├─ name: "John Doe"
│  ├─ role: "user"
│  ├─ createdAt: Timestamp
│  └─ lastLogin: Timestamp
│
└─ uid2 (admin user)
   ├─ uid: "uid2"
   ├─ email: "admin@example.com"
   ├─ name: "Admin User"
   ├─ role: "admin"
   ├─ createdAt: Timestamp
   └─ lastLogin: Timestamp
```

**quotes Collection**
```
/quotes
├─ quote1 (document key = auto-generated)
│  ├─ userId: "uid1" (owner)
│  ├─ customerName: "Rahul Singh"
│  ├─ customerPhone: "9876543210"
│  ├─ currency: "EUR"
│  ├─ exchangeRate: 120.50
│  ├─ forexFee: 50 (in paisa)
│  ├─ foreignAmount: 10000
│  ├─ baseAmount: 1200000
│  ├─ forexFeeAmount: 5000
│  ├─ swiftFee: 1399
│  ├─ gst: 1278
│  ├─ totalCharges: 7677
│  ├─ totalINR: 1207677
│  ├─ recipientAmount: 10000
│  ├─ createdAt: Timestamp
│  └─ updatedAt: Timestamp
│
└─ quote2 (different user)
   ├─ userId: "uid2"
   └─ ... (same structure)
```

### Indexes
```
Index 1: Collection: quotes
├─ userId (Ascending)
├─ createdAt (Descending)
└─ Scope: Collection

Index 2: Collection: quotes
├─ createdAt (Descending)
└─ Scope: Collection

Index 3: Collection: users
├─ role (Ascending)
└─ Scope: Collection
```

---

## 🔄 Component Architecture

### Frontend Components

**Login Page (index.html)**
```
├─ Header
│  ├─ Zolve Logo
│  └─ Tagline
│
├─ Main Container
│  ├─ Tabs
│  │  ├─ Login Tab
│  │  │  ├─ Email input
│  │  │  ├─ Password input
│  │  │  ├─ Login button
│  │  │  └─ Errors
│  │  │
│  │  └─ Signup Tab
│  │     ├─ Name input
│  │     ├─ Email input
│  │     ├─ Password input
│  │     ├─ Confirm password
│  │     ├─ Signup button
│  │     └─ Errors
│  │
│  └─ Google OAuth Button
│
└─ Footer
   └─ Copyright
```

**Calculator Page (calculator.html)**
```
├─ Header
│  ├─ Logo
│  └─ Logout button
│
├─ Tabs
│  ├─ Quote Calculator Tab
│  │  ├─ Form Section
│  │  │  ├─ Student name
│  │  │  ├─ Phone number
│  │  │  ├─ Currency select
│  │  │  ├─ Exchange rate
│  │  │  ├─ Forex fee
│  │  │  ├─ Foreign amount
│  │  │  ├─ Generate button
│  │  │  └─ Validations
│  │  │
│  │  └─ Quote Display Section
│  │     ├─ Header (logo, date)
│  │     ├─ Customer info boxes
│  │     ├─ Amount boxes (recipient, total)
│  │     ├─ Fee breakdown
│  │     ├─ Download PDF button
│  │     └─ Disclaimer
│  │
│  └─ All Quotes Tab
│     ├─ Table
│     │  ├─ Customer Name
│     │  ├─ Date
│     │  ├─ Foreign Amount
│     │  ├─ INR Amount
│     │  └─ Actions (View, Edit, PDF, Delete)
│     │
│     ├─ Modals
│     │  ├─ Quote detail modal
│     │  └─ Confirmation modal
│     │
│     └─ States
│        ├─ Loading spinner
│        └─ Empty state
```

**Admin Portal (admin.html)**
```
├─ Header
│  ├─ Logo (with Admin label)
│  └─ Logout button
│
├─ Dashboard Stats
│  ├─ Total Quotes
│  ├─ Today's Quotes
│  ├─ Monthly Quotes
│  ├─ Total Users
│  └─ Total INR Volume
│
├─ Tabs
│  ├─ All Quotes Tab
│  │  ├─ Filters
│  │  │  ├─ Email search
│  │  │  ├─ Customer name search
│  │  │  ├─ From date
│  │  │  └─ To date
│  │  │
│  │  ├─ Table
│  │  │  ├─ User Email
│  │  │  ├─ Customer Name
│  │  │  ├─ Date
│  │  │  ├─ Currency
│  │  │  ├─ Foreign Amount
│  │  │  ├─ INR Amount
│  │  │  └─ Actions (View, PDF, Delete)
│  │  │
│  │  └─ States
│  │     ├─ Loading
│  │     └─ Empty
│  │
│  ├─ User Management Tab
│  │  ├─ Table
│  │  │  ├─ Email
│  │  │  ├─ Name
│  │  │  ├─ Created At
│  │  │  ├─ Last Login
│  │  │  └─ Delete button
│  │  │
│  │  └─ States
│  │     └─ Empty
│  │
│  └─ Admin Management Tab
│     ├─ Add Admin Form
│     │  ├─ Email input
│     │  └─ Add button
│     │
│     ├─ Current Admins Table
│     │  ├─ Email
│     │  ├─ Name
│     │  ├─ Created At
│     │  └─ Remove button
│     │
│     └─ Modals
│        └─ Confirmation modal
│
└─ Global Modals
   ├─ Quote detail modal
   ├─ Confirmation modal
   └─ Toasts (success/error)
```

---

## 🌐 API Integration (Firebase SDK)

### Authentication API
```javascript
// Sign up
createUserWithEmailAndPassword(email, password)

// Sign in
signInWithEmailAndPassword(email, password)

// Google OAuth
signInWithPopup(provider)

// Sign out
signOut()

// Auth state
onAuthStateChanged(callback)

// Current user
auth.currentUser
```

### Firestore API
```javascript
// Read
getDoc(docRef)
getDocs(query)
query(collection, where(...))

// Write
setDoc(docRef, data)
updateDoc(docRef, data)

// Delete
deleteDoc(docRef)

// Listen for changes
onSnapshot(query, callback)

// Batch operations
writeBatch()
```

---

## 📊 State Management

### Client-Side State
```javascript
// Browser Storage
- localStorage: Auth tokens, user preferences
- sessionStorage: Temporary data
- In-memory: JavaScript variables

// Firestore State
- Real-time listeners
- Automatic sync
- Server-side validation
- Optimistic updates

// Component State
- DOM manipulation
- Event listeners
- Form validation
- UI state (modals, tabs)
```

---

## 🚀 Deployment Architecture

### Firebase Hosting Configuration
```
firebase.json
├─ public: "." (current directory)
├─ ignore: [firestore, node_modules, etc]
└─ rewrites:
   ├─ /calculator → calculator.html
   ├─ /admin → admin.html
   └─ ** → index.html (SPA fallback)
```

### CDN & Caching
```
┌────────────────────────────────────────┐
│  User Request (Browser)                │
└────────────────────────────────────────┘
             ↓
┌────────────────────────────────────────┐
│  Firebase CDN (Global Locations)       │
│  - Cache static assets (1 year)        │
│  - Compress with gzip                  │
│  - HTTP/2 support                      │
│  - SSL/TLS encryption                  │
└────────────────────────────────────────┘
             ↓
┌────────────────────────────────────────┐
│  Origin Server (Firebase Hosting)      │
│  - Serve dynamic content               │
│  - Handle SPA routing                  │
└────────────────────────────────────────┘
```

---

## 🔍 Monitoring & Logging

### Available Metrics
- Page load times
- Firestore operations (reads/writes)
- Authentication events (login/logout)
- Error logs
- User activity
- Performance metrics
- Network requests

### Alert Configuration
```
Alerts for:
- High error rate (> 5%)
- High latency (> 2 seconds)
- Quota exceeded
- Firestore rules violations
- Authentication failures
- Deployment status
```

---

## 📈 Scalability

### Current Capacity
- Unlimited users
- Real-time quote generation
- Concurrent operations
- Global CDN distribution

### Future Scaling
- Firebase auto-scales Firestore
- CDN handles increased traffic
- Automatic database partitioning
- Zero downtime updates

---

## ✅ Architecture Quality Metrics

- **Modularity:** 8/10 (separate modules for auth, DB, admin)
- **Scalability:** 9/10 (Firebase auto-scales)
- **Security:** 9/10 (row-level security rules)
- **Performance:** 8/10 (optimized queries and caching)
- **Maintainability:** 8/10 (well-documented code)
- **Testability:** 7/10 (Firebase emulator available)
- **Reliability:** 9/10 (Firebase infrastructure)

---

**Architecture Status:** ✅ Production Ready
