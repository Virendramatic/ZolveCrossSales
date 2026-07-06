# Zolve CRM Platform - System Overview

## 🎯 Project Scope

**Zolve CRM** is a comprehensive multi-tenant Customer Relationship Management (CRM) platform designed for financial services companies. The platform manages student leads, facilitates product offerings, and enables counselor-driven quote generation across multiple products.

### Core Products
- **Remittance Quote Calculator** - International fund transfer quotes (LIVE ✅)
- **Loan Management** - Coming soon
- **Accommodation Services** - Coming soon
- **Additional Products** - Extensible framework supports more

---

## 🏗️ Platform Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         ZOLVE CRM PLATFORM                       │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    CORE CRM ENGINE                         │  │
│  │                                                            │  │
│  │  • Lead Management & Tracking                             │  │
│  │  • Multi-Product Support                                  │  │
│  │  • Counselor & Admin Roles                                │  │
│  │  • Authentication & Authorization                         │  │
│  │  • Real-time Firestore Sync                               │  │
│  │  • Role-Based Access Control                              │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              △                                    │
│         ┌────────────────────┼────────────────────┐               │
│         │                    │                    │               │
│    ┌────▼──────┐    ┌───────▼───────┐    ┌──────▼──────┐        │
│    │ Remittance│    │ Loan Product  │    │Accommodation│ ...    │
│    │ Product   │    │    Module     │    │   Module    │        │
│    │ (LIVE)    │    │   (Planned)   │    │  (Planned)  │        │
│    └───────────┘    └───────────────┘    └─────────────┘        │
│                                                                   │
│  Shared Components:                                              │
│  • Lead Lifecycle (Create → Track → Convert)                     │
│  • Quote Generation & Linking                                    │
│  • Remarks & Follow-up History                                   │
│  • Reassignment & Originator Tracking                            │
│  • Excel Import/Export                                           │
│  • Admin Dashboards & Reports                                    │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Model (CRM-Centric)

### Core Collections

**users** Collection
```
/users/{uid}
├── uid: string
├── email: string
├── name: string
├── role: "counselor" | "admin"  (Was "user" | "admin" - Renamed for clarity)
├── productAccess: string[]      (Products they can access)
├── createdAt: timestamp
└── lastLogin: timestamp
```

**leads** Collection
```
/leads/{leadId}
├── studentName: string          (Required)
├── phone: string                (Required)
├── email: string
├── university: string
├── course: string
├── totalFee: number
├── lenderName: string
│
├── productType: string          (Remittance, Loan, etc.)
├── userId: string               (Current owner/fulfiller)
├── originatorUserId: string     (Original creator - immutable)
├── callStatus: string           (Not Called, Responding, Converted, etc.)
├── remittanceStatus: string     (Admin-configurable per product)
├── rescheduleDate: timestamp
│
├── createdAt: timestamp
├── updatedAt: timestamp
├── lastReassignedAt: timestamp
│
├── remarks (sub-collection)
└── reassignments (sub-collection)
```

**quotes** Collection (Extended)
```
/quotes/{quoteId}
├── userId: string               (Quote creator)
├── leadId: string               (Reference to source lead)
├── productType: string          (Which product this quote is for)
│
├── ... (Product-specific quote fields)
├── createdAt: timestamp
└── updatedAt: timestamp
```

---

## 🔄 Key Workflows

### 1. Counselor-Driven Lead-to-Quote Flow

```
Counselor Actions:
  1. View Leads Tab (filtered by product)
  2. Select Lead or Create New Lead
  3. Generate Quote (pre-populated with lead data)
  4. Quote auto-saves
  5. Quote linked to Lead
  6. Lead status updated to track engagement

Result:
  • Lead has complete engagement history
  • Lead knows which quotes were generated
  • Counselor has all customer context
  • Admin can see complete funnel
```

### 2. Multi-Product Lead Lifecycle

```
Same Lead Can Have:
  • Remittance Quote (₹500,000 transfer)
  • Loan Quote (₹1,000,000 education loan)
  • Accommodation Record (Hostel in London)

Each Product:
  • Has own leads view per counselor
  • Can be reassigned independently
  • Has product-specific statuses
  • Contributes to lead's full timeline
```

### 3. Admin Visibility & Control

```
Admin Dashboard:
  • System-wide lead metrics (all products)
  • Product-specific performance tracking
  • Counselor productivity by product
  • Lead conversion funnels per product
  • Cross-product opportunities (same student, multiple needs)
```

---

## 📁 Updated Directory Structure

```
zolve-crm/                          # Root (was fx-quote-calculator)
│
├── index.html                      # Login page (core CRM)
├── dashboard.html                  # Counselor dashboard (core CRM)
├── admin.html                      # Admin portal (core CRM)
│
├── products/                       # Product-specific modules
│   ├── remittance/
│   │   ├── calculator.html         # Remittance quote calculator
│   │   ├── js/remittance.js        # Remittance-specific logic
│   │   └── css/remittance.css
│   │
│   ├── loan/
│   │   ├── calculator.html         # Loan calculator (future)
│   │   ├── js/loan.js
│   │   └── css/loan.css
│   │
│   └── accommodation/
│       ├── finder.html             # Accommodation finder (future)
│       ├── js/accommodation.js
│       └── css/accommodation.css
│
├── js/
│   ├── core/
│   │   ├── auth.js                 # Core authentication (CRM engine)
│   │   ├── firestore.js            # Core database ops (CRM engine)
│   │   ├── leads.js                # Lead management (CRM engine)
│   │   ├── leadsUI.js              # Lead UI components (CRM engine)
│   │   └── leadUploader.js         # Lead import/export (CRM engine)
│   │
│   └── utils/
│       ├── validation.js           # Shared validation
│       ├── formatting.js           # Shared formatting
│       └── constants.js            # Shared constants
│
├── css/
│   ├── core/
│   │   ├── base.css                # Core CRM styles
│   │   ├── responsive.css          # Responsive design
│   │   ├── admin.css               # Admin-specific styles
│   │   └── leads.css               # Lead management styles
│   │
│   └── theme/
│       ├── colors.css              # Color variables
│       └── typography.css          # Font system
│
├── firebase.json                   # Firebase hosting config
├── firestore.rules                 # Firestore security rules
├── zolve_logo.svg                  # Zolve branding
│
└── docs/
    ├── CRM_OVERVIEW.md             # This file
    ├── ARCHITECTURE.md             # Technical architecture
    ├── API_REFERENCE.md            # API documentation
    ├── SECURITY.md                 # Security model
    ├── DEPLOYMENT.md               # Deployment guide
    └── products/
        ├── REMITTANCE_GUIDE.md     # Remittance product guide
        ├── LOAN_GUIDE.md           # Loan product guide (future)
        └── ACCOMMODATION_GUIDE.md  # Accommodation guide (future)
```

---

## 🔐 Security Model (CRM-Based)

### Role Hierarchy

```
┌─────────────┐
│   Admin     │ Can view/manage all leads, all products, assign users
└──────┬──────┘
       │ Can act as
       ▼
┌─────────────────┐
│   Counselor     │ Can view/manage own leads, create quotes
└─────────────────┘
```

### Data Access Rules

**Counselors:**
- Read/write own leads only
- View own quotes
- Generate quotes from own leads
- Add remarks to own leads
- Cannot reassign leads
- Cannot access other counselors' data

**Admins:**
- Read/write all leads (all counselors)
- View all quotes
- Reassign leads between counselors
- Update product-specific statuses
- Manage user roles
- Generate system reports

---

## 🎯 Implementation Phases

### Phase 1: Core CRM Engine ✅
- Authentication (Email/Password + Google OAuth)
- Firestore setup with user isolation
- Lead management (CRUD)
- Lead reassignment with originator tracking

### Phase 2: Remittance Product Integration ✅
- Remittance quote calculator
- Quote-lead linking
- Auto-lead creation from quotes
- Admin dashboard for remittance metrics

### Phase 3: Lead Lifecycle Management ✅
- Status tracking
- Remarks & follow-up history
- Reschedule dates
- Excel import/export
- Advanced filtering

### Phase 4: Multi-Product Support (Ready)
- Product type field on leads
- Product-specific navigation
- Product-specific status enums
- Lead reassignment across products

### Phase 5: Loan Product (Planned)
- Loan calculator module
- Loan-specific lead fields
- Loan product integration

### Phase 6: Accommodation Services (Planned)
- Accommodation finder module
- University/hostel data
- Accommodation-specific tracking

---

## 📊 Key Metrics & Reporting

**CRM Dashboard:**
- Total active leads (by product, by counselor)
- Lead conversion rate (by product)
- Average time to conversion
- Counselor productivity metrics
- Lead source tracking
- Cross-product opportunities

**Product Dashboards:**
- Remittance: Quote volume, average amount, conversion funnel
- Loan: Application flow, approval rate, average loan amount
- Accommodation: Hostel bookings, occupancy rate, student satisfaction

---

## 🚀 API & Integration Points

### Internal APIs

**Lead Management API**
```javascript
// Core operations
createLead(leadData)
getLead(leadId)
updateLeadStatus(leadId, status)
searchLeads(filters)
deleteLead(leadId)
reassignLead(leadId, toUserId)
exportLeadsToExcel(filters)
```

**Product Quote API** (Template for each product)
```javascript
// Product-specific (implemented in each product module)
generateQuote(quoteData, leadId)
getQuote(quoteId)
updateQuote(quoteId, data)
deleteQuote(quoteId)
getLinkOrCreateLead(customerData, productType)
```

### External Integration Points (Future)
- Email service for reminders
- SMS notifications for follow-ups
- Payment gateway for deposits
- University data feeds
- Loan approval automation
- Bank integrations

---

## 📈 Scalability & Performance

**Current Capacity:**
- Unlimited leads
- Real-time synchronization
- Concurrent operations
- Global CDN distribution

**Performance Targets:**
- Lead view load: < 2 seconds
- Quote generation: < 1 second
- Admin dashboard: < 3 seconds
- Excel export (1000 leads): < 5 seconds

**Scaling Strategy:**
- Firebase auto-scales Firestore
- CDN caches static assets
- Database indexes optimize queries
- Pagination for large lead lists

---

## 🎨 Product-Agnostic Design

The CRM is designed to support any product module:

1. **Product Registration** - New module registers itself with CRM
2. **Lead Association** - Product can create/link leads
3. **Quote Generation** - Product-specific quote logic
4. **Status Tracking** - Product can define custom statuses
5. **Reporting** - Product contributes to CRM dashboards
6. **User Management** - CRM handles product access permissions

---

## 📞 Support & Maintenance

**Documentation:**
- CRM_OVERVIEW.md (this file)
- ARCHITECTURE.md - Technical details
- Product guides for each module

**Troubleshooting:**
- Firebase Console logs
- Browser DevTools
- Firestore data inspection
- Security rules validation

---

## ✅ Status

**CRM Platform:** ✅ Production Ready
**Remittance Product:** ✅ Live & Complete
**Loan Product:** 📋 Planned
**Accommodation Product:** 📋 Planned

**Last Updated:** June 2026
**Version:** 1.0.0 (CRM Engine), 1.0.0 (Remittance Product)

