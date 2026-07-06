# Multiuser Quote System - Design

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Hosting                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  /                           /admin                          │
│  ├─ Login Page              ├─ Admin Login                  │
│  ├─ Quote Calculator        ├─ Admin Dashboard              │
│  ├─ All Quotes Tab          ├─ User Management              │
│  └─ Quote Editor            └─ Quote Analytics              │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│               Firebase Authentication                        │
│  - Email/Password                                            │
│  - Google OAuth                                              │
├─────────────────────────────────────────────────────────────┤
│                  Firestore Database                          │
│  - Users Collection                                          │
│  - Quotes Collection                                         │
│  - Security Rules                                            │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
fx-quote-calculator/
├── index.html                  # Login page
├── calculator.html             # Main app with All Quotes tab
├── admin.html                  # Admin portal
├── js/
│   ├── auth.js                # Authentication logic
│   ├── firestore.js           # Firestore operations
│   ├── calculator.js          # Quote calculator logic
│   ├── quotes-manager.js      # Quote CRUD operations
│   └── admin.js               # Admin portal logic
├── css/
│   ├── styles.css             # Main styles
│   ├── admin-styles.css       # Admin portal styles
│   └── responsive.css         # Responsive design
├── firebase.json              # Firebase config
├── .firebaserc                # Project config
└── zolve_logo.svg            # Logo
```

## Component Design

### 1. Authentication Flow
```
User visits app
    ↓
Check if logged in (Firebase Auth)
    ├─ Yes → Redirect to calculator.html
    └─ No → Show login page (index.html)

Login Options:
├─ Email/Password signup/login
└─ Google OAuth button

After login:
├─ Check user role in Firestore
├─ If admin=true → Can access /admin
└─ If admin=false → Regular user dashboard
```

### 2. Quote Calculator (Enhanced)
```
Original calculator stays same +

After "Generate Quote" clicked:
├─ Display quote on right side
├─ Add "Save Quote" button (auto-saves)
└─ Show success toast "Quote saved!"

On save:
├─ Collect all quote data
├─ Add userId, timestamp
├─ Save to Firestore/quotes collection
└─ Show in "All Quotes" tab
```

### 3. All Quotes Tab
```
┌─────────────────────────────────────────────────────────┐
│  All Quotes                                              │
├─────────────────────────────────────────────────────────┤
│  Table with columns:                                    │
│  - Customer Name  | Date    | Foreign $ | INR Amount   │
│  - john Doe       | 6/16    | €10,000   | Rs.12,07,677 │
│  - jane Smith     | 6/15    | $5,000    | Rs.4,10,500  │
│                                                          │
│  Actions per row:                                       │
│  - [View] [Edit] [Download PDF] [Delete]              │
└─────────────────────────────────────────────────────────┘
```

### 4. Admin Portal (/admin)
```
┌──────────────────────────────────────────────────────┐
│  Admin Dashboard                                      │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Top Stats:                                          │
│  - Total Quotes: 245   | Today: 12 | This Month: 89 │
│  - Total Users: 34     | Total INR Volume: 2.5Cr    │
│                                                       │
│  Tabs:                                               │
│  ├─ All Quotes                                       │
│  ├─ User Management                                  │
│  └─ Admin Management                                 │
│                                                       │
│  All Quotes:                                         │
│  - Table: User | Customer | Date | Amount | Actions │
│  - Filters: By user, date range                      │
│  - Actions: [View] [Delete]                          │
│                                                       │
│  User Management:                                    │
│  - List all users                                    │
│  - [Delete User] button per user                     │
│                                                       │
│  Admin Management:                                   │
│  - List current admins                               │
│  - [Add Admin] button → input email → set role       │
│  - [Remove Admin] button per admin                   │
│                                                       │
└──────────────────────────────────────────────────────┘
```

## Database Schema

### Users Collection
```
/users/{uid}
{
  uid: "user123",
  email: "user@example.com",
  name: "John Doe",
  role: "user",           // or "admin"
  createdAt: timestamp,
  lastLogin: timestamp
}
```

### Quotes Collection
```
/quotes/{quoteId}
{
  userId: "user123",
  customerName: "Rahul Singh",
  customerPhone: "9876543210",
  currency: "EUR",
  exchangeRate: 120.50,
  forexFee: 50,                    // paisa
  foreignAmount: 10000,             // €
  baseAmount: 1200000,              // INR (10000 * 120)
  forexFeeAmount: 5000,             // INR
  swiftFee: 1399,                   // INR
  gst: 1278,                        // INR (18% of forex + swift)
  totalCharges: 7677,               // forex + swift + gst
  totalINR: 1207677,                // base + charges
  recipientAmount: 10000,           // EUR
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can read/write their own user document
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
      allow read: if request.auth.uid != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users can read/write their own quotes
    match /quotes/{quoteId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow read: if request.auth.uid != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow delete: if request.auth.uid == resource.data.userId;
    }
    
    // Create new quote
    match /quotes/{quoteId} {
      allow create: if request.auth.uid != null && 
                       request.resource.data.userId == request.auth.uid;
    }
  }
}
```

## UI/UX Flow

### User Journey
1. Visit app → Login page
2. Sign up or log in
3. Land on calculator (same as before)
4. Generate quote
5. Quote auto-saves
6. Switch to "All Quotes" tab to see history
7. Click quote to edit/view/delete/download

### Admin Journey
1. Visit app → Login
2. Login with admin account
3. Click "Admin Portal" link → `/admin`
4. See dashboard with stats
5. Manage quotes, users, and admins
6. Add/remove admins by email
7. Delete user accounts

## Key Implementation Notes

1. **Tab Implementation**: Add "All Quotes" tab next to calculator on the same page (same HTML structure, show/hide with JavaScript)

2. **Auto-save**: On "Generate Quote" click, after displaying quote, save to Firestore and show toast notification

3. **Admin Detection**: On login, check Firestore user document for `role: "admin"`. If true, show admin link.

4. **PDF Download**: Existing PDF download logic works, but now downloads any saved quote (not just current one)

5. **Edit Quote**: Load saved quote data back into form, user modifies, re-generates, overwrites in Firestore

6. **Admin Portal**: Separate HTML file but uses same Firebase project and authentication

7. **Security**: All rules enforced server-side by Firestore, UI is just presentation layer
