# Design Document: Lead Management Feature

## Overview

The Lead Management Feature provides counselors and admins with a comprehensive system to track, manage, and follow up with student leads for remittance services and other products. The system integrates with the existing quote calculator to enable automatic lead creation, manual lead entry, bulk upload via Excel, and detailed lead tracking with remarks history.

### Key Goals
- Enable counselors to systematically manage student prospects
- Provide auto-linkage between quotes and leads for seamless integration
- Support bulk operations (Excel upload/export) for efficiency
- Offer admins system-wide visibility and reporting
- Maintain strong security with role-based access control

### Integration Points
- **Quote System**: Auto-create/link leads when quotes are generated
- **Calculator**: Add Leads tab to calculator.html for counselor access
- **Admin Portal**: Add Leads tab to admin.html for admin access
- **Database**: Extend Firestore with leads collection and indexes
- **Security**: Enforce row-level access control via Firestore rules

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interfaces                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ calculator.html                                      │   │
│  │  ├─ Quote Tab (existing)                            │   │
│  │  └─ Leads Tab (NEW)                                 │   │
│  │     ├─ Leads list (counselor's leads only)          │   │
│  │     ├─ Lead creation form                           │   │
│  │     ├─ Excel upload interface                       │   │
│  │     └─ Lead detail modal                            │   │
│  │                                                      │   │
│  │ admin.html                                           │   │
│  │  ├─ Dashboard (existing)                            │   │
│  │  ├─ Quotes Tab (existing)                           │   │
│  │  └─ Leads Tab (NEW)                                 │   │
│  │     ├─ All leads (system-wide)                      │   │
│  │     ├─ Advanced filters (counselor, date range)     │   │
│  │     ├─ Excel export                                 │   │
│  │     └─ Lead detail modal                            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           HTTPS
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                    JavaScript Modules                        │
│  ├─ leads.js (Core CRUD operations)                         │
│  ├─ leadsUI.js (UI rendering and events)                    │
│  ├─ leadUploader.js (Excel import/export)                   │
│  └─ firestore.js (existing - to be extended)                │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                   Firebase Firestore                         │
│  ├─ /leads (new collection)                                 │
│  │  └─ {leadId}                                             │
│  │     ├─ Lead data fields                                  │
│  │     ├─ /remarks (sub-collection)                         │
│  │     └─ Indexed fields (userId, createdAt, productType)   │
│  │                                                          │
│  └─ /quotes (existing - extended with leadId)               │
│     └─ {quoteId}                                            │
│        └─ + leadId field (new)                              │
│                                                              │
│  ├─ Firestore Security Rules (role-based)                   │
│  ├─ Database Indexes (performance)                          │
│  └─ Multi-config support (staging & production)             │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow: Auto-Create Lead from Quote

```
Quote Generation Flow
     ↓
Generate Quote (with name, phone, email)
     ↓
Create/Link Lead
  ├─ Check if lead exists (by phone + productType)
  ├─ If exists → Link quote to existing lead
  └─ If not exists → Create new lead, link quote
     ↓
Update Quote with leadId
     ↓
Display confirmation to counselor
```

---

## Components and Interfaces

### 1. Leads Collection (Firestore)

**Schema:**
```javascript
{
  // Required fields
  studentName: string,        // Student name
  phone: string,              // Contact number (validated)
  
  // Optional fields (may be empty)
  email: string,              // Email (validated if provided)
  university: string,         // University name
  course: string,             // Course/program
  totalFee: number,           // Fees in INR
  lenderName: string,         // Lender selection (dropdown)
  
  // System fields
  productType: string,        // "Remittance", "Loan", etc. (default: "Remittance")
  userId: string,             // Current owner/fulfiller (counselor who currently owns it)
  originatorUserId: string,   // Initial creator (never changes) - NEW
  
  // Status fields
  callStatus: string,         // "Not Called", "Not Responding", "Converted", "Rescheduled", "DND"
  remittanceStatus: string,   // Admin-configured status (e.g., "Pending", "Processing", "Completed")
  rescheduleDate: timestamp,  // Future date for follow-up (nullable)
  
  // Metadata
  createdAt: timestamp,       // Lead creation time
  updatedAt: timestamp,       // Last modification time
  lastReassignedAt: timestamp // When lead was last reassigned (nullable) - NEW
}
```

**Reassignment History Sub-Collection:**
```javascript
// /leads/{leadId}/reassignments/{reassignmentId} - NEW
{
  fromCounselorId: string,    // Who owned it before
  fromCounselorEmail: string, // For display
  toCounselorId: string,      // New owner
  toCounselorEmail: string,   // For display
  reassignedByAdminId: string,// Admin who performed reassignment
  reassignedByAdminEmail: string, // For display
  reason: string,             // Optional reason for reassignment
  reassignedAt: timestamp,    // When reassignment happened
}
```

**Remarks Sub-Collection:**
```javascript
// /leads/{leadId}/remarks/{remarkId}
{
  text: string,               // Remark content
  createdAt: timestamp,       // When remark was added
  counselorId: string,        // Who added the remark
  counselorName: string,      // For display
  counselorEmail: string,     // For display
}
```

### 2. Quotes Collection (Extended)

**New Field:**
```javascript
// In /quotes/{quoteId}, add:
{
  ...existingFields,
  leadId: string,             // Reference to /leads/{leadId} (nullable if not created from lead)
}
```

### 3. UI Components

#### Calculator.html Leads Tab
```
┌─────────────────────────────────────┐
│ Leads                               │
├─────────────────────────────────────┤
│ [Search by name] [Filters ▼]        │
│ Filter: [Status ▼] [Lender ▼]       │
│ [Product Type ▼]                    │
│                                     │
│ [+ New Lead] [Upload Excel]         │
│ [Export Excel]                      │
├─────────────────────────────────────┤
│ Name        │ Phone    │ Status │ .. │
│ Rahul Singh │ 98765... │ Conv.. │ .. │
│ Priya Sharma│ 91234... │ Resc.. │ .. │
│             │          │        │    │
│ [Show 2 of 5 leads]  [← | 1/3 | →] │
└─────────────────────────────────────┘
  Click row → Lead Detail Modal
  Click [+ New Lead] → Create Form Modal
  Click [Upload Excel] → Upload Dialog
```

#### Admin.html Leads Tab
```
┌─────────────────────────────────────┐
│ Leads                               │
├─────────────────────────────────────┤
│ [Search by name]                    │
│ [Counselor Email ▼] [Status ▼]      │
│ [Lender ▼] [Product Type ▼]         │
│ From: [Date] To: [Date]             │
│                                     │
│ [Export Excel]                      │
├─────────────────────────────────────┤
│ Counselor   │ Name    │ Status │ ... │
│ user@... │ Rahul... │ Conv.. │ ... │
│ admin@... │ Priya... │ Resc.. │ ... │
│           │         │        │     │
│ [Show 10 of 150 leads]              │
└─────────────────────────────────────┘
  Click row → Lead Detail Modal
  Click [Export Excel] → Download file
```

#### Lead Detail Modal
```
┌────────────────────────────────┐
│ Lead: Rahul Singh              │
│ Created: 2025-03-10 by [name]  │
├────────────────────────────────┤
│ Student Information            │
│ Name: Rahul Singh              │
│ Phone: 9876543210              │
│ Email: [email]@example.com     │
│ University: IIT Delhi          │
│ Course: B.Tech CSE             │
│ Total Fee: ₹500,000            │
│ Lender: SBI                    │
│                                │
│ Status Information             │
│ Call Status: [Converted ▼]     │
│ Remittance Status: [Pending ▼] │
│ Reschedule Date: [Picker]      │
│                                │
│ Remarks (3 total)              │
│ [2025-03-12] Counselor A:      │
│ "Customer wants more details"  │
│ [2025-03-11] Counselor B:      │
│ "Follow up on Friday"          │
│ [2025-03-10] Counselor A:      │
│ "Initial contact"              │
│                                │
│ [Add Remark] [Text area]       │
│ [Save Remark]                  │
│                                │
│ Associated Quotes (2)          │
│ [2025-03-12 09:15] EUR Quote   │
│ [2025-03-11 14:30] GBP Quote   │
│                                │
│ [Generate Quote] [Delete Lead] │
│ [Close]                        │
└────────────────────────────────┘
```

#### Lead Creation Form Modal
```
┌─────────────────────────────┐
│ Create New Lead             │
├─────────────────────────────┤
│ * Student Name:             │
│   [Text input]              │
│                             │
│ * Phone Number:             │
│   [Text input] [Format hint]│
│                             │
│   Email:                    │
│   [Text input]              │
│                             │
│   University:               │
│   [Autocomplete]            │
│                             │
│   Course:                   │
│   [Text input]              │
│                             │
│   Total Fee:                │
│   [Number input]            │
│                             │
│   Lender:                   │
│   [Dropdown: SBI, ICICI...] │
│                             │
│   Product Type:             │
│   [Dropdown: Remittance,    │
│    Loan, Accommodation]     │
│                             │
│ [Create Lead] [Cancel]      │
└─────────────────────────────┘
```

#### Lead Upload Interface
```
┌──────────────────────────────────┐
│ Upload Leads from Excel          │
├──────────────────────────────────┤
│ [Download Template]              │
│                                  │
│ Select file:                     │
│ [Choose File...] .xlsx or .csv   │
│                                  │
│ [Upload] [Cancel]               │
│                                  │
│ Processing...                    │
│ [Progress bar]                   │
│                                  │
│ Results:                         │
│ ✓ 45 leads created successfully  │
│ ✗ 2 leads failed:                │
│   - Row 5: Invalid phone format  │
│   - Row 8: Missing name          │
│                                  │
│ [Close] [Upload Another]         │
└──────────────────────────────────┘
```

---

## Data Models

### Lead Data Model

```javascript
class Lead {
  constructor(data) {
    // Required
    this.studentName = data.studentName;
    this.phone = data.phone;
    
    // Optional
    this.email = data.email || null;
    this.university = data.university || null;
    this.course = data.course || null;
    this.totalFee = data.totalFee || null;
    this.lenderName = data.lenderName || null;
    
    // System
    this.productType = data.productType || "Remittance";
    this.userId = data.userId;  // Current owner (fulfiller)
    
    // Originator & Reassignment Tracking (NEW)
    this.originatorUserId = data.originatorUserId;  // Initial creator (never changes)
    this.reassignmentHistory = data.reassignmentHistory || [];  // Array of reassignments
    
    // Status
    this.callStatus = data.callStatus || "Not Called";
    this.remittanceStatus = data.remittanceStatus || null;
    this.rescheduleDate = data.rescheduleDate || null;
    
    // Metadata
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}
```

### Remark Data Model

```javascript
class Remark {
  constructor(data) {
    this.text = data.text;
    this.createdAt = data.createdAt || new Date();
    this.counselorId = data.counselorId;
    this.counselorName = data.counselorName;
    this.counselorEmail = data.counselorEmail;
  }
}
```

---

## File Structure

```
Project Root/
├─ js/
│  ├─ firestore.js (existing - extend for leads)
│  ├─ leads.js (NEW - Core CRUD operations)
│  ├─ leadsUI.js (NEW - UI rendering and events)
│  ├─ leadUploader.js (NEW - Excel import/export)
│  └─ auth.js (existing)
│
├─ css/
│  ├─ leads.css (NEW - Lead-specific styles)
│  ├─ admin-styles.css (existing)
│  └─ responsive.css (existing)
│
├─ calculator.html (extend with Leads tab)
├─ admin.html (extend with Leads tab)
│
└─ templates/ (optional - for HTML fragments)
   └─ lead-modals.html (NEW - Modal templates)
```

---

## Security Rules

### Firestore Rules for Leads Collection

```javascript
match /leads/{leadId} {
  // Counselors: read/write own leads
  allow read: if request.auth.uid != null && 
              get(/databases/$(database)/documents/leads/$(leadId)).data.userId == request.auth.uid;
  
  allow create: if request.auth.uid != null &&
                request.resource.data.userId == request.auth.uid &&
                request.resource.data.studentName != null &&
                request.resource.data.phone != null;
  
  allow update: if request.auth.uid != null && 
                get(/databases/$(database)/documents/leads/$(leadId)).data.userId == request.auth.uid &&
                request.resource.data.userId == resource.data.userId;
  
  allow delete: if request.auth.uid != null &&
                get(/databases/$(database)/documents/leads/$(leadId)).data.userId == request.auth.uid;
  
  // Admins: read/write all leads
  allow read, write, delete: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
  
  // Remarks sub-collection
  match /remarks/{remarkId} {
    allow read: if request.auth.uid != null && 
                get(/databases/$(database)/documents/leads/$(leadId)).data.userId == request.auth.uid;
    
    allow read: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    
    allow create: if request.auth.uid != null &&
                  request.resource.data.counselorId == request.auth.uid;
    
    allow create: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
  }
}
```

---

## Database Indexes

Required composite and single-field indexes for performance:

```javascript
// Index 1: Leads by counselor and creation date
{
  collectionGroup: "leads",
  fields: [
    { fieldPath: "userId", order: "ASCENDING" },
    { fieldPath: "createdAt", order: "DESCENDING" }
  ]
}

// Index 2: Leads by product type and creation date
{
  collectionGroup: "leads",
  fields: [
    { fieldPath: "productType", order: "ASCENDING" },
    { fieldPath: "createdAt", order: "DESCENDING" }
  ]
}

// Index 3: Leads by counselor and product type
{
  collectionGroup: "leads",
  fields: [
    { fieldPath: "userId", order: "ASCENDING" },
    { fieldPath: "productType", order: "ASCENDING" }
  ]
}

// Single field indexes
{
  collectionGroup: "leads",
  fields: [
    { fieldPath: "createdAt", order: "DESCENDING" }
  ]
}

{
  collectionGroup: "leads",
  fields: [
    { fieldPath: "callStatus", order: "ASCENDING" }
  ]
}

{
  collectionGroup: "leads",
  fields: [
    { fieldPath: "lenderName", order: "ASCENDING" }
  ]
}
```

---

## JavaScript Module Interfaces

### leads.js - Core CRUD Operations


```javascript
// Core functions
async createLead(leadData)
  // Creates a new lead with validation
  // Returns: {id, ...leadData}
  // Throws: ValidationError, FirestoreError

async getLead(leadId)
  // Retrieves a single lead with remarks history
  // Returns: Lead object with remarks array

async updateLeadStatus(leadId, callStatus, remittanceStatus)
  // Updates call status and/or remittance status
  // Returns: Updated lead

async updateRescheduleDate(leadId, date)
  // Sets reschedule date (validates future date)
  // Returns: Updated lead

async addRemark(leadId, remarkText)
  // Adds a remark to lead remarks history
  // Returns: Lead with updated remarks

async deleteLead(leadId)
  // Soft delete or hard delete (TBD based on requirements)
  // Returns: Confirmation

async searchLeads(userId, searchTerm, filters)
  // Searches counselor's leads
  // Returns: Array of matching leads

async getAdminLeads(filters)
  // Retrieves all leads (admin only)
  // Returns: Array of all leads

async getLeadByPhoneAndProduct(phone, productType, userId)
  // Finds existing lead for auto-linking from quote
  // Returns: Lead or null
```

### leadsUI.js - UI Rendering

```javascript
// Counselor views
renderCounselorLeadsTable(leads)
  // Renders table of counselor's leads
  
renderLeadDetailModal(lead)
  // Renders detail modal with edit capabilities
  
renderLeadCreateForm()
  // Renders form for creating new lead
  
attachLeadTableEventListeners()
  // Handles row clicks, filters, search

// Admin views
renderAdminLeadsTable(leads)
  // Renders table with counselor email column
  
attachAdminFilterListeners()
  // Handles advanced filters (counselor, date range)
```

### leadUploader.js - Excel Operations

```javascript
async generateExcelTemplate()
  // Creates template file with headers and sample row
  
async uploadExcelFile(file)
  // Parses Excel/CSV and creates leads
  // Returns: {successful: n, failed: n, errors: [...]}
  
async exportLeadsToExcel(leads)
  // Generates Excel from lead array
  // Returns: Blob for download
  
validateLeadRow(row)
  // Validates a single row from upload
  // Returns: {valid: boolean, errors: [...]}
```

### firestore.js - Extension

```javascript
// Add to existing module:
async getLinkOrCreateLead(customerData, productType, userId)
  // Used when generating quote
  // Finds existing lead or creates new one
  // Returns: leadId
```

---

## Integration with Quote System

### When Quote is Generated

1. **Extract Lead Info**
   - Student name (required)
   - Phone (required)
   - Email (optional)

2. **Find or Create Lead**
   - Query: leads where (phone == customerPhone AND productType == "Remittance" AND userId == currentUserId)
   - If found: link quote to existing lead
   - If not found: create new lead with status "Connected"

3. **Update Quote**
   - Add `leadId` field to quote document
   - Save quote to Firestore

4. **Link Quote to Lead**
   - In lead detail modal, show this quote under "Associated Quotes"

### Database Updates

**Quotes Collection:**
- Add optional `leadId` field
- When quote is generated from lead: populate leadId
- When quote is auto-created: populate leadId

**Leads Collection:**
- Add optional `leadId` field in quotes array (or handle via reverse query)

---

## Error Handling

### Validation Errors

| Field | Validation | Error Message |
|-------|-----------|--------|
| Student Name | Not empty | "Student name is required" |
| Phone | Format + Not empty | "Phone must be 10+ digits or valid format" |
| Email | If provided, valid format | "Email format is invalid" |
| Reschedule Date | Future date only | "Date must be in the future" |
| Product Type | From enum | "Invalid product type" |
| Call Status | From enum | "Status must be one of: Not Called, Not Responding, Converted, Rescheduled, DND" |

### API Errors

| Error | Handling |
|-------|----------|
| No access to lead (not owner, not admin) | Show "You don't have permission to access this lead" |
| Lead not found | Show "Lead has been deleted or moved" |
| Firestore write failed | Show "Unable to save changes. Please try again." |
| Upload file invalid | Show "File format not supported. Please use .xlsx or .csv" |

---

## Testing Strategy

### Unit Testing Approach

**Test Categories:**

1. **Validation Tests**
   - Phone number format validation
   - Email format validation
   - Reschedule date (future date only)
   - Required fields (name, phone)
   - Product type enum

2. **Lead CRUD Tests**
   - Create lead with all fields
   - Create lead with minimal fields
   - Update specific fields
   - Delete lead
   - Retrieve lead by ID

3. **Security Tests**
   - Counselor cannot access another's leads
   - Admin can access any lead
   - Cannot update lead ownership
   - Remarks maintain author info

4. **Excel Operations**
   - Parse valid Excel/CSV
   - Handle invalid phone formats
   - Handle missing required columns
   - Generate template format
   - Export and re-import round-trip

5. **Quote-Lead Integration**
   - Auto-create lead from quote
   - Link quote to existing lead
   - Handle different product types (same phone, different product = different leads)

### Property-Based Testing

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Before writing properties, I'll now conduct acceptance criteria prework analysis to identify testable properties.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection & Deduplication

After analyzing all acceptance criteria, I identified the following redundancies and consolidations:

**Redundancy Consolidations:**
- Properties 1.1 (field storage), 1.6 (metadata), 1.7 (remarks), 1.9 (remarks history) → Consolidated into single "Lead data round-trip" property
- Properties 4.4, 4.5, 4.6, 4.7 (counselor filters) → Consolidated into single "Counselor filtering" property
- Properties 5.4, 5.5, 5.6, 5.7, 5.8, 5.9 (admin filters) → Consolidated into single "Admin filtering" property
- Properties 6.3, 6.4 (status update with timestamp) → Consolidated into single "Status update persists" property
- Properties 11.1, 11.2 (quote-lead association) → Consolidated into single "Quote-lead linking" property
- Properties 20.1, 20.3, 20.4, 20.5, 20.6, 20.8 (auto-create lead from quote) → Consolidated into single "Quote auto-creates/links lead" property

**Remaining Properties** (after consolidation):
The following properties provide unique, non-redundant validation value:

### Property 1: Lead Data Round-Trip

*For any* lead with student name, phone, and optional fields (email, university, course, total fee, lender, product type), when the lead is saved to Firestore and then retrieved, all provided data SHALL be returned unchanged with correct createdAt timestamp and userId matching the creator.

**Validates: Requirements 1.1, 1.6, 1.7, 1.9, 2.7**

### Property 2: Product Type Defaults to Remittance

*For any* lead created without explicitly specifying a product type, the persisted lead's productType field SHALL equal "Remittance".

**Validates: Requirements 1.3, 3.4**

### Property 3: Initial Call Status is Not Called

*For any* manually created lead, the initial callStatus SHALL be "Not Called".

**Validates: Requirements 2.9, 3.8**

### Property 4: Lead Ownership on Creation

*For any* lead created by a counselor, the persisted lead's userId SHALL match the creating counselor's uid.

**Validates: Requirements 2.10, 3.7**

### Property 5: Required Fields Validation

*For any* attempt to create a lead without both studentName and phone, the system SHALL reject the operation and NOT create a lead.

**Validates: Requirements 1.8, 2.3, 2.4, 2.8, 3.3**

### Property 6: Excel File Format Support

*For any* valid .xlsx or .csv file with correct columns and valid data, the system SHALL successfully parse it and create leads corresponding to each valid row.

**Validates: Requirements 3.2, 3.6**

### Property 7: Excel Upload Partial Success

*For any* Excel file with N valid rows and M invalid rows, the system SHALL create exactly N leads for valid rows and report exactly M errors for invalid rows without creating leads for invalid rows.

**Validates: Requirements 3.5, 15.4, 15.5**

### Property 8: Counselor Lead Visibility

*For any* counselor viewing their leads and any lead in the system, the counselor SHALL only see leads where the lead's userId matches the counselor's uid.

**Validates: Requirements 4.2, 13.1, 13.2**

### Property 9: Admin Lead Visibility

*For any* admin viewing leads, the system SHALL return ALL leads in the system regardless of userId.

**Validates: Requirements 5.2, 13.3**

### Property 10: Counselor Filtering

*For any* filter applied by a counselor on their leads view (status, lender, or product type), the system SHALL return only leads matching all applied filter criteria and owned by that counselor.

**Validates: Requirements 4.4, 4.5, 4.6, 4.7, 16.1, 16.2, 16.3, 16.4**

### Property 11: Admin Filtering

*For any* filter applied by an admin on the all-leads view (status, lender, product type, counselor email, or date range), the system SHALL return only leads matching all applied filter criteria across all counselors. Date range filtering SHALL be inclusive of boundary dates.

**Validates: Requirements 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 16.5, 16.6, 16.7**

### Property 12: Status Update Persists

*For any* lead status update (callStatus or remittanceStatus), when the update is saved, querying the lead SHALL return the new status value and the lead's updatedAt timestamp SHALL be more recent than before.

**Validates: Requirements 6.3, 6.4**

### Property 13: Remittance Status Admin Only

*For any* attempt by a non-admin counselor to update a lead's remittanceStatus, the system SHALL reject the operation and the status SHALL remain unchanged.

**Validates: Requirements 6.9**

### Property 14: Counselor Status Update Authorization

*For any* counselor attempting to update their own lead's callStatus, the operation SHALL succeed. For any counselor attempting to update another counselor's lead's callStatus, the system SHALL deny the operation.

**Validates: Requirements 6.5, 13.4, 13.5**

### Property 15: Admin Status Update Authorization

*For any* admin updating any lead's status (call or remittance), the operation SHALL succeed regardless of ownership.

**Validates: Requirements 6.5, 6.9, 13.6**

### Property 16: Reschedule Date Future Only

*For any* attempt to set a reschedule date to a date in the past relative to the current date, the system SHALL reject the operation. For any attempt to set a date in the future, the operation SHALL succeed.

**Validates: Requirements 7.2, 7.3**

### Property 17: Reschedule Date Persists

*For any* valid reschedule date set on a lead, when the lead is retrieved, the rescheduleDate field SHALL contain the set value.

**Validates: Requirements 7.4, 7.5**

### Property 18: Reschedule Date Authorization

*For any* counselor updating their own lead's rescheduleDate, the operation SHALL succeed. For any counselor updating another counselor's lead, the system SHALL deny the operation. For any admin, the operation SHALL succeed regardless of ownership.

**Validates: Requirements 7.6**

### Property 19: Reschedule Date Null Default

*For any* newly created lead without an explicit rescheduleDate, the persisted lead's rescheduleDate field SHALL be null or undefined.

**Validates: Requirements 7.7**

### Property 20: Remarks Append Without Mutation

*For any* lead with existing remarks, when a new remark is added, the system SHALL add the new remark to the remarks history without modifying, reordering, or deleting any existing remarks.

**Validates: Requirements 8.3, 8.5**

### Property 21: Remarks Record Metadata

*For any* remark added to a lead, the persisted remark SHALL contain: text (unchanged), createdAt timestamp, counselorId matching the adding counselor's uid, counselorName, and counselorEmail.

**Validates: Requirements 8.3**

### Property 22: Remarks Authorization

*For any* counselor adding a remark to their own lead, the operation SHALL succeed. For any counselor attempting to add a remark to another counselor's lead, the system SHALL deny the operation. For any admin, the operation SHALL succeed regardless of ownership.

**Validates: Requirements 8.6**

### Property 23: Quote-Lead Association

*For any* quote generated from a lead, the persisted quote SHALL contain the leadId field matching the source lead's id. For any* quote retrieved, if leadId is set, querying the leads collection SHALL find exactly one lead with that id.

**Validates: Requirements 10.2, 10.3, 11.1**

### Property 24: Quote Quote-to-Lead Linkage

*For any* lead, querying all quotes where leadId matches this lead's id SHALL return all quotes that were generated from (or linked to) this lead. Deleting a lead SHALL NOT delete these quotes; quotes SHALL persist with their leadId intact.

**Validates: Requirements 9.4, 10.6, 11.2, 11.3, 11.4, 12.4**

### Property 25: Lead Deletion Removes Lead

*For any* lead, after successful deletion, querying for that lead by id SHALL return no result (lead does not exist).

**Validates: Requirements 12.3**

### Property 26: Lead Deletion Authorization

*For any* counselor deleting their own lead, the operation SHALL succeed. For any counselor deleting another counselor's lead, the system SHALL deny the operation. For any admin, the operation SHALL succeed regardless of ownership.

**Validates: Requirements 12.7, 13.5**

### Property 27: Quote-Generated Lead Auto-Create

*For any* quote generated with customerName and customerPhone, if no existing lead matches (phone + "Remittance" product type + same counselor), the system SHALL automatically create a new lead with callStatus="Connected", productType="Remittance", userId matching the quote creator, and pre-populated data from quote (name, phone, email).

**Validates: Requirements 20.1, 20.2, 20.3, 20.4, 20.5, 20.6**

### Property 28: Quote-Generated Lead Linking

*For any* quote generated with customerName and customerPhone, if an existing lead already matches (phone + productType + userId), the system SHALL link the quote to this existing lead (store leadId in quote) WITHOUT creating a duplicate lead.

**Validates: Requirements 20.8**

### Property 29: Multi-Product Lead Separation

*For any* two quotes with the same customerPhone but different productTypes, even if generated by the same counselor, the system SHALL create (or link to) separate leads if product types differ (e.g., one lead for Remittance, another for Loan).

**Validates: Requirements 20.9**

### Property 30: Quote Pre-Population

*For any* quote generated from a lead, the quote form pre-populated with that lead's data SHALL contain customerName, customerPhone, customerEmail, and lenderName matching the source lead's values.

**Validates: Requirements 10.1**

### Property 31: Excel Template Structure

*For any* downloaded lead template, the file SHALL contain headers matching all lead database field names (studentName, phone, email, university, course, totalFee, lenderName, productType, callStatus, rescheduleDate, remarks) and one example data row demonstrating valid format.

**Validates: Requirements 14.2, 14.3, 14.5**

### Property 32: Excel Template No Real Data

*For any* downloaded lead template, it SHALL contain only sample/example data and SHALL NOT contain any actual lead data from the database.

**Validates: Requirements 14.6**

### Property 33: Email Validation

*For any* email provided in lead data, if the email field is non-empty, it SHALL be in valid RFC 5322 format or the system SHALL reject the lead creation/update. If email field is empty, creation/update SHALL succeed.

**Validates: Requirements 2.5, 15.3**

### Property 34: Phone Validation

*For any* phone number provided, it SHALL be validated to a consistent format (10+ digits or with country code prefix) or the system SHALL reject the lead. Invalid formats SHALL be rejected with clear error message including row number if from Excel upload.

**Validates: Requirements 2.4, 15.2**

### Property 35: Admin Lead Export

*For any* admin exporting leads with active filters, the exported Excel file SHALL contain exactly the leads returned by the current filtered query, with all lead fields included and headers matching field names.

**Validates: Requirements 19.2, 19.3, 19.4**

### Property 36: Filter Clear Returns All

*For any* user who applies filters and then clears all filters, the system SHALL return all leads accessible to that user (all of counselor's leads for counselors; all system leads for admins).

**Validates: Requirements 16.7**

---

## Error Handling

### Validation Errors

| Scenario | Error Message | HTTP/Action |
|----------|--------|----------|
| Empty student name on create | "Student name is required" | Reject form, highlight field |
| Empty phone on create | "Phone number is required" | Reject form, highlight field |
| Invalid phone format | "Phone must be 10+ digits or valid format (e.g., +1-555-123-4567)" | Reject form, highlight field |
| Invalid email (if provided) | "Please enter a valid email address" | Reject form, highlight field |
| Reschedule date in past | "Date must be in the future" | Reject date picker, show error |
| Invalid call status value | "Invalid status. Must be one of: Not Called, Not Responding, Converted, Rescheduled, DND" | Show error toast |
| Invalid product type | "Invalid product type selected" | Show error toast |

### Authorization Errors

| Scenario | Error Message | HTTP/Action |
|----------|--------|----------|
| Counselor accesses another's lead | "You don't have permission to access this lead" | 403 Forbidden, show error modal |
| Counselor updates another's lead status | "You can only update your own leads" | 403 Forbidden, show error toast |
| Counselor updates remittance status | "Only admins can update remittance status" | 403 Forbidden, show error toast |
| Counselor deletes another's lead | "You can only delete your own leads" | 403 Forbidden, show error toast |

### File Upload Errors

| Scenario | Error Message |
|----------|--------|
| Unsupported file format | "Please upload a .xlsx or .csv file" |
| Missing required columns | "Missing required columns: studentName, phone. Please check your template." |
| Row with invalid phone | "Row 5: Invalid phone format. Expected 10+ digits or valid format" |
| Row with invalid email | "Row 8: Invalid email format. Please provide a valid email address" |
| Row missing name | "Row 10: Student name is required" |
| File too large | "File size exceeds maximum limit (10MB). Please upload a smaller file" |
| Parse error | "Unable to parse file. Please ensure it's a valid Excel or CSV file" |

### Firestore Errors

| Error | Handling |
|-------|----------|
| Network error | Show toast: "Connection lost. Please check your internet and try again" |
| Permission denied | Show toast: "You don't have permission to perform this action" |
| Document not found | Show error modal: "This lead has been deleted or is no longer available" |
| Write failed | Show toast: "Unable to save changes. Please try again" |
| Rate limit exceeded | Show toast: "Too many requests. Please wait a moment and try again" |

---

## Testing Strategy

### Unit Testing Approach

**Test Categories:**

1. **Data Validation Tests** (Property-based)
   - Phone format validation (various formats: +91, 10 digits, with/without country code)
   - Email validation (valid and invalid RFC 5322 formats)
   - Reschedule date validation (past vs future)
   - Product type enum validation
   - Call status enum validation
   - Lender name validation

2. **Lead CRUD Tests** (Unit)
   - Create lead with all fields populated
   - Create lead with only required fields (name, phone)
   - Create lead with empty optional fields
   - Update individual fields (status, reschedule date, lender)
   - Update multiple fields in single operation
   - Delete lead by ID
   - Retrieve lead by ID
   - Lead ownership verification on retrieve

3. **Remarks Tests** (Unit)
   - Add single remark to lead
   - Add multiple remarks to same lead
   - Verify remarks are appended (not replaced)
   - Verify remark metadata (createdAt, counselorId)
   - Verify remarks persist with lead data
   - Retrieve remarks in correct order

4. **Security Tests** (Unit)
   - Counselor can only read own leads
   - Counselor cannot read another counselor's leads
   - Admin can read all leads
   - Counselor can only update own leads
   - Counselor cannot update another's leads
   - Admin can update any lead
   - Counselor can only delete own leads
   - Counselor cannot delete another's leads
   - Admin can delete any lead
   - Remittance status updates only allowed for admin
   - Counselor cannot modify lead ownership

5. **Excel Upload/Download Tests** (Unit)
   - Parse valid .xlsx file
   - Parse valid .csv file
   - Reject invalid file formats
   - Validate required columns present
   - Validate required columns missing error
   - Process partial uploads (some valid, some invalid)
   - Report accurate error counts
   - Generate template with correct headers
   - Generate template with no real lead data
   - Export leads to Excel format
   - Verify exported data matches source

6. **Quote-Lead Integration Tests** (Unit)
   - Quote auto-creates lead if not exists
   - Quote links to existing lead if matches (phone + product type)
   - Auto-created lead has correct status ("Connected")
   - Auto-created lead has correct userId
   - Auto-created lead pre-populated with quote data
   - Quote linked to lead persists leadId
   - Multiple quotes can link to same lead
   - Deleting lead does not delete linked quotes
   - Different product types create separate leads

7. **Filtering and Search Tests** (Property-based)
   - Search by name returns correct partial matches
   - Filter by status returns only matching status
   - Filter by lender returns only matching lender
   - Filter by product type returns only matching product
   - Multiple filters AND together correctly
   - Filter by date range is inclusive
   - Clearing filters returns all accessible leads
   - Admin can filter by counselor email
   - Counselor cannot filter by counselor email

8. **Integration Tests** (Unit)
   - End-to-end lead creation flow
   - End-to-end lead update flow
   - End-to-end lead deletion flow
   - Remark addition doesn't affect other fields
   - Status update doesn't affect other fields
   - Date update records updatedAt timestamp

### Property-Based Testing Configuration

**Framework**: Use Hypothesis (Python) or fast-check (JavaScript) depending on implementation language

**Test Per Property**: 
- Minimum 100 iterations per property test
- Generate random valid inputs using strategies/arbitraries
- Properties 1-36 from design document each have corresponding property test

**Property Test Tagging**:
Each test MUST include a comment with tag in format:
```javascript
// Feature: lead-management, Property {number}: {property_name}
```

Example:
```javascript
test('Property 1: Lead data round-trip', () => {
  // Feature: lead-management, Property 1: Lead data round-trip
  fc.assert(
    fc.property(leadDataArbitrary, async (leadData) => {
      const saved = await createLead(leadData);
      const retrieved = await getLead(saved.id);
      expect(retrieved.studentName).toEqual(leadData.studentName);
      // ... verify all fields
    }),
    { numRuns: 100 }
  );
});
```

**Specific Property Test Examples**:

Property 5 (Required Fields Validation):
```javascript
test('Property 5: Required fields validation', () => {
  // Feature: lead-management, Property 5: Required fields validation
  fc.assert(
    fc.property(
      fc.oneof(
        fc.record({ phone: fc.string() }), // missing name
        fc.record({ studentName: fc.string() }) // missing phone
      ),
      (incompleteData) => {
        expect(() => createLead(incompleteData)).toThrow(ValidationError);
      }
    ),
    { numRuns: 50 }
  );
});
```

Property 10 (Counselor Filtering):
```javascript
test('Property 10: Counselor filtering', () => {
  // Feature: lead-management, Property 10: Counselor filtering
  fc.assert(
    fc.property(
      fc.array(leadDataArbitrary, { minLength: 5, maxLength: 20 }),
      fc.option(callStatusArbitrary),
      (leads, filterStatus) => {
        const counselorLeads = leads.filter(l => l.userId === currentUserId);
        const filtered = filterLeads(counselorLeads, { status: filterStatus });
        expect(filtered.every(l => l.callStatus === filterStatus || !filterStatus)).toBe(true);
        expect(filtered.every(l => l.userId === currentUserId)).toBe(true);
      }
    ),
    { numRuns: 100 }
  );
});
```

Property 27 (Auto-Create Lead from Quote):
```javascript
test('Property 27: Quote-generated lead auto-create', () => {
  // Feature: lead-management, Property 27: Quote-generated lead auto-create
  fc.assert(
    fc.property(
      quoteDataArbitrary,
      async (quoteData) => {
        // Query for existing lead
        const existingLead = await getLeadByPhoneAndProduct(
          quoteData.customerPhone,
          'Remittance',
          currentUserId
        );
        
        // Generate quote (which triggers auto-create)
        const quote = await generateQuoteAndCreateLead(quoteData);
        
        // Verify lead was created or linked
        if (!existingLead) {
          // New lead should be created
          const newLead = await getLead(quote.leadId);
          expect(newLead.studentName).toEqual(quoteData.customerName);
          expect(newLead.phone).toEqual(quoteData.customerPhone);
          expect(newLead.callStatus).toEqual('Connected');
          expect(newLead.userId).toEqual(currentUserId);
        } else {
          // Should link to existing lead
          expect(quote.leadId).toEqual(existingLead.id);
        }
      }
    ),
    { numRuns: 100 }
  );
});
```

**Dual Testing Balance**:
- Unit tests: ~50-60 tests covering specific examples, edge cases, error conditions
- Property tests: ~36 tests corresponding to design properties
- Total: ~86-96 automated tests providing comprehensive coverage


### Property 37: Lead Reassignment Preserves Originator

*For any* lead initially created by Counselor A and later reassigned to Counselor B, the lead's originatorUserId SHALL remain unchanged (still pointing to Counselor A) while fulfillerUserId (userId) SHALL be updated to Counselor B.

**Validates: Requirements 27.3, 28.1, 28.3**

### Property 38: Lead Reassignment Updates Fulfiller

*For any* lead reassignment operation where a lead is transferred from Counselor A to Counselor B by an admin, the system SHALL:
1. Update the lead's fulfillerUserId/userId to Counselor B
2. Create a reassignment history entry with: fromCounselorId=A, toCounselorId=B, reassignmentDate=now, reassignedByAdminId=admin
3. Preserve all other lead data (name, phone, remarks, quotes) unchanged
4. Create a timeline/activity entry recording the reassignment

**Validates: Requirements 27.3, 28.2, 28.4**

### Property 39: Originator and Fulfiller Filtering

*For any* admin applying filters for originator (lead creator) and/or current owner (fulfiller), the system SHALL return only leads matching the selected filters. Leads can be filtered independently by originator or fulfiller, and both filters can be applied together (AND logic).

**Validates: Requirements 27.7**

