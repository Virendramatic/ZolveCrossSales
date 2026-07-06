# Zolve CRM - Lead-First Platform Requirements

## Introduction

Zolve CRM is a **lead-centric customer relationship management system** designed to manage student leads as a unified entity and cross-sell multiple financial products. The platform recognizes that each student (lead) is a multi-product opportunity and provides tools to track, manage, and maximize product adoption across the entire lead lifecycle.

The CRM is built on a **lead-first philosophy**:
- **All Leads** = Master universe of all students
- **Products** = Different financial services offered to leads
- **Goal** = Maximize product penetration per lead while ensuring comprehensive tracking

This requirements document covers:
1. **CRM Core** - Lead management foundation
2. **Multi-Product Framework** - How different products attach to leads
3. **Education Loan Product** - First product module (Education Loan details)
4. **Cross-Product Insights** - Views across multiple products

---

## Glossary

**Core CRM Terms:**
- **Lead**: A student/prospect registered in the Zolve CRM system who may opt into one or more financial products
- **All Leads**: The master view showing all leads in the system, regardless of product adoption
- **Lead Owner/Counselor**: The Zolve team member assigned to manage a lead or a specific product instance for that lead
- **Global Call Status**: The universal communication status for a lead (Not Called, Responding, Not Responding, Converted) - same across all products
- **Reschedule Date**: The next planned follow-up date for a lead (global across all products)
- **Comments/Remarks**: Notes and interaction history recorded on a lead, viewable by all team members and admins
- **Product Instance**: A specific activation of a product for a lead (e.g., "Sonam's Education Loan" or "Rohit's Remittance #1")
- **Product Status**: The stage/state specific to each product instance (e.g., loan is "Docs Pending", remittance is "Processing")

**Product-Specific Terms:**
- **Education Loan**: A financing product for student education abroad; one lead can have max ONE active education loan
- **Remittance**: A fund transfer product; one lead can have MULTIPLE remittances over time
- **Accommodation**: A housing placement service; one lead can have max ONE active accommodation
- **Credit Card**: A financial card product; one lead can have max ONE active credit card

**Education Loan Specific:**
- **Loan Application**: The formal education loan request for a specific student with course/university details
- **Lender**: Financial institution providing education loans (Avanse, HDFC Credila, Auxilo, etc.)
- **Lender Application**: A specific application instance with one lender (one Loan_Application can have multiple Lender_Applications)
- **Loan Stage**: Application progression through: Started → Docs Pending → Docs Received → Call Scheduled → Sanctioned → Disbursed
- **Lender Status**: Per-lender application state (Not Applied, Applied, Under Review, Sanctioned, Rejected, Disbursed)
- **Document Checklist**: Required documents grouped by category (KYC, Academics, Financials, Collateral)

---

## Requirements

### Requirement 1: Lead as Master Entity

**User Story:** As a CRM system, I want leads to be the foundational entity that all products reference, so that a single student can be tracked across multiple financial products.

#### Acceptance Criteria

1. THE CRM System SHALL support creation of lead records with minimum required information: Name, Phone, Email (optional)

2. WHEN a new lead is created, THE CRM System SHALL assign a unique Lead ID (e.g., ZL-XXXX) and immutable creation timestamp

3. WHEN a lead is created, THE CRM System SHALL record the creating counselor as the originator (immutable)

4. WHEN a lead is viewed, THE CRM System SHALL display all active product instances for that lead with their current statuses

5. WHEN a lead has multiple products, THE CRM System SHALL maintain independent status and assignment for each product instance

6. WHEN searching leads, THE CRM System SHALL support filtering by: Name, Phone, Country, Lead Creation Date

7. WHEN a lead is deleted/archived, THE CRM System SHALL preserve all product instances and comments associated with that lead

8. WHEN an admin views a lead, THE CRM System SHALL see all product instances and all comments; when a counselor views a lead assigned to them, they see only product instances and comments for products they own

9. THE CRM System SHALL support bulk lead import (CSV/Excel) with fields: Name, Phone, Email, Country, Intake, Notes

10. WHEN bulk leads are imported, THE CRM System SHALL record the import timestamp and importing user for audit trail

---

### Requirement 2: Global Lead Status and Call Tracking

**User Story:** As a counselor, I want to track the communication status with each lead globally, so that I know when to follow up regardless of which product they're using.

#### Acceptance Criteria

1. THE CRM System SHALL define global Call Status for each lead with values: Not Called, Responding, Not Responding, Converted

2. WHEN a lead is created, THE CRM System SHALL set initial Call Status to "Not Called"

3. WHEN any team member updates a lead's Call Status, THE CRM System SHALL record the status, timestamp, and responsible user

4. WHEN a lead's Call Status changes, THE CRM System SHALL persist the change and make it visible across ALL product instances for that lead

5. WHEN a lead's Call Status is "Not Responding", THE CRM System SHALL allow setting a Reschedule Date for follow-up

6. THE CRM System SHALL validate Reschedule Date is in the future; if in the past, reject with error message

7. WHEN a Reschedule Date is set, THE CRM System SHALL alert the assigned counselor(s) at that date for follow-up

8. THE CRM System SHALL support filtering All Leads view by Call Status (show only "Not Responding" leads, etc.)

9. WHEN viewing All Leads, THE CRM System SHALL display Call Status and Reschedule Date columns for each lead

10. WHEN a lead is converted (Call Status = "Converted"), THE CRM System SHALL record conversion date and preserve it for historical reporting

---

### Requirement 3: Comments and Interaction History

**User Story:** As a team member, I want to record notes and interactions on a lead, so that all team members understand the lead's history and context.

#### Acceptance Criteria

1. THE CRM System SHALL support adding comments to any lead with free-form text content

2. WHEN a comment is added, THE CRM System SHALL record: comment text, timestamp, author (counselor name), and author's role

3. THE CRM System SHALL maintain complete comment history for each lead in reverse chronological order (newest first)

4. WHEN viewing a lead detail, THE CRM System SHALL display all comments and allow adding new comments

5. WHEN a lead has an assigned counselor for a product, THAT counselor can add comments to the lead

6. WHEN an admin views a lead, THEY can add comments regardless of lead assignment

7. WHEN a comment is added, THE CRM System SHALL make it visible to all team members viewing that lead (subject to access control)

8. THE CRM System SHALL support comment editing with audit trail showing original text, edited text, and edit timestamp

9. THE CRM System SHALL support soft-deleting comments (removing from view but preserving in audit trail)

10. WHEN a lead is reassigned to a different counselor, ALL comments remain visible to both old and new counselors

---

### Requirement 4: Multi-Product Framework

**User Story:** As a CRM system, I want to enable leads to opt into multiple products with independent tracking, so that each product can be managed separately.

#### Acceptance Criteria

1. THE CRM System SHALL support attaching multiple product instances to a single lead

2. WHEN a product is applied to a lead (e.g., "Apply Loan"), THE CRM System SHALL create a Product Instance record linking the lead to the product

3. THE CRM System SHALL enforce product-specific instance limits:
   - Education Loan: MAX 1 instance per lead
   - Accommodation: MAX 1 instance per lead
   - Credit Card: MAX 1 instance per lead
   - Remittance: UNLIMITED instances per lead

4. WHEN attempting to create a second Education Loan instance for a lead that already has one, THE CRM System SHALL reject with error message

5. WHEN a product instance is created, THE CRM System SHALL allow assigning a counselor as the product owner

6. WHEN a lead has multiple product instances, DIFFERENT counselors can own different products for the same lead

7. WHEN a lead's Call Status changes, THE CRM System SHALL update this globally across all product instances

8. WHEN a comment is added to a lead, ALL team members can view it regardless of which product they own for that lead

9. WHEN filtering by product (e.g., "Loans Tab"), THE CRM System SHALL show only leads with active product instances for that product

10. WHEN a product instance is archived/completed, THE CRM System SHALL preserve it in history while removing from active views

---

### Requirement 5: Product Tab Views

**User Story:** As a counselor, I want to view leads in product-specific tabs, so that I can focus on the leads and work relevant to each product.

#### Acceptance Criteria

1. THE CRM System SHALL provide navigation tabs for: All Leads, Education Loan, Remittance, Accommodation, Credit Card, and future products

2. WHEN viewing the "All Leads" tab, THE CRM System SHALL display all leads in the system with columns: Name, Phone, Country, Call Status, Reschedule Date, Products Opted (list)

3. WHEN viewing a product-specific tab (e.g., "Loans"), THE CRM System SHALL display only leads with active instances of that product

4. WHEN viewing a product tab, THE CRM System SHALL display columns specific to that product (e.g., Loan tab shows: Name, Loan Stage, Lender Status, Documents Pending)

5. WHEN clicking on a lead in any tab, THE CRM System SHALL open a lead detail view showing:
   - Lead information (Name, Phone, Email, Country, Call Status, Reschedule Date)
   - Comments trail (all comments on this lead)
   - Product instances this lead has opted into (with each product's current status)
   - Quick actions (Add Comment, Update Call Status, Change Reschedule Date)

6. THE CRM System SHALL support filtering within each product tab by relevant filters (e.g., Loan tab: filter by Loan Stage, Lender, Document Status)

7. WHEN a user switches between tabs, THE CRM System SHALL preserve context (selected lead, applied filters)

8. WHEN new leads are uploaded to All Leads, THE CRM System SHALL immediately make them available for product application

9. WHEN a product instance is created for a lead, THE CRM System SHALL immediately appear in that product's tab

10. THE CRM System SHALL display a lead count badge on each tab showing number of leads in that tab

---

### Requirement 6: Lead Ownership and Assignment Management

**User Story:** As an admin, I want to assign leads to counselors at the product level, so that work can be distributed effectively with different team members handling different products for the same lead.

#### Acceptance Criteria

1. THE CRM System SHALL support assigning a lead/product instance to a specific counselor

2. WHEN assigning a product instance to a counselor, THE CRM System SHALL record: assignment timestamp, assigning admin, and assigned counselor

3. WHEN a lead has multiple product instances, THE CRM System SHALL allow different counselors to own different products

4. WHEN a counselor views a product they own for a lead, THEY can update product-specific information and status

5. WHEN a counselor views a product they do NOT own for a lead, THEY can view it but NOT edit it

6. WHEN an admin views a lead, THE ADMIN can see and edit all product instances regardless of ownership

7. THE CRM System SHALL support reassigning a product instance from one counselor to another

8. WHEN reassigning, THE CRM System SHALL preserve all product data and create audit log entry

9. WHEN a product instance is reassigned, BOTH old and new counselors can view the product instance and comments

10. THE CRM System SHALL support bulk assignment (assign 50 new leads to a counselor in one action)

---

### Requirement 7: Education Loan Product - Application and Stages

**User Story:** As a counselor, I want to create and track education loan applications for students, so that I can manage their loan journey from initiation through disbursement.

#### Acceptance Criteria

1. WHEN a counselor clicks "Apply Loan" on a lead, THE Education_Loan_Product SHALL create a Loan Application linked to that lead

2. THE Education_Loan_Product SHALL capture core loan details: University, Course, Target Country, Total Loan Amount, Expected Intake

3. WHEN a Loan Application is created, THE Education_Loan_Product SHALL set initial Loan Stage to "Started"

4. THE Education_Loan_Product SHALL define Loan Stages as: Started → Docs Pending → Docs Received → Call Scheduled → Sanctioned → Disbursed

5. WHEN a counselor initiates document collection, THE Education_Loan_Product SHALL transition Loan Stage to "Docs Pending"

6. WHEN all requested documents are received and confirmed, THE Education_Loan_Product SHALL transition Loan Stage to "Docs Received"

7. WHEN a call with the student is scheduled, THE Education_Loan_Product SHALL transition Loan Stage to "Call Scheduled"

8. WHEN a lender sanctions the application, THE Education_Loan_Product SHALL transition Loan Stage to "Sanctioned"

9. WHEN funds are disbursed, THE Education_Loan_Product SHALL transition Loan Stage to "Disbursed"

10. WHEN a Loan Stage changes, THE Education_Loan_Product SHALL record: stage transition timestamp, responsible counselor, and reason for transition

---

### Requirement 8: Education Loan - Multi-Lender Coordination

**User Story:** As a counselor, I want to match students with suitable lenders and track applications across multiple lenders simultaneously, so that I can maximize approval chances.

#### Acceptance Criteria

1. THE Education_Loan_Product SHALL support applying to multiple lenders for a single Loan Application

2. WHEN a counselor selects lenders to apply to, THE Education_Loan_Product SHALL create Lender Application records for each lender

3. WHEN a Lender Application is created, THE Education_Loan_Product SHALL set initial Lender Status to "Not Applied"

4. THE Education_Loan_Product SHALL define Lender Status values: Not Applied, Applied, Under Review, Sanctioned, Rejected, Disbursed

5. WHEN documents are submitted to a lender, THE Education_Loan_Product SHALL transition that lender's status to "Applied"

6. WHEN a lender begins review, THE Education_Loan_Product SHALL update status to "Under Review"

7. WHEN a lender approves, THE Education_Loan_Product SHALL update status to "Sanctioned" and record sanction details (amount, ROI, PF)

8. WHEN a lender rejects, THE Education_Loan_Product SHALL update status to "Rejected" and record rejection reason

9. WHEN funds are disbursed by a lender, THE Education_Loan_Product SHALL update status to "Disbursed" and record disbursement details

10. WHEN viewing a Loan Application, THE COUNSELOR SHALL see all Lender Applications with their current statuses displayed as a list or dashboard

---

### Requirement 9: Education Loan - Document Collection and Checklists

**User Story:** As a counselor, I want to request documents from students systematically using predefined checklists, so that I can ensure complete documentation for lender applications.

#### Acceptance Criteria

1. THE Education_Loan_Product SHALL define document categories: KYC (Know Your Customer), Academics, Financials, Collateral

2. THE Education_Loan_Product SHALL define standardized checklists for each category:
   - **KYC**: PAN Card, Aadhar Card, Passport, Photos
   - **Academics**: 10th Scorecard, 12th Scorecard, UG Degree/Marksheets, Admit Letter
   - **Financials**: Salary Slips (3 months), Bank Statements (6 months), Income Tax Returns (2 years)
   - **Collateral**: Property Documents, Vehicle Registration, Jewelry Certificate (for collateral loans only)

3. WHEN a loan is for collateral-based lending, THE Education_Loan_Product SHALL include Collateral category in document checklist

4. WHEN a loan is for non-collateral lending, THE Education_Loan_Product SHALL exclude Collateral category from document checklist

5. WHEN a counselor requests documents, THE Education_Loan_Product SHALL generate Document Request with selected categories

6. WHEN a Document Request is created, THE Education_Loan_Product SHALL transition Loan Stage to "Docs Pending"

7. WHEN a document is submitted by student, THE Education_Loan_Product SHALL record: document name, category, submission timestamp, submission method (Upload/Email/Manual)

8. WHEN a document is rejected by counselor, THE Education_Loan_Product SHALL allow re-requesting that document without resetting entire request

9. WHEN all documents in all requested categories are received and approved, THE COUNSELOR can confirm completion and transition to "Docs Received" stage

10. WHEN viewing a Loan Application, THE COUNSELOR SHALL see document checklist with status of each document (Not Started, Submitted, Approved, Rejected)

---

### Requirement 10: Education Loan - Lender Matching and Recommendations

**User Story:** As a system, I want to provide intelligent lender recommendations to counselors, so that they can select the best lenders for each student.

#### Acceptance Criteria

1. THE Education_Loan_Product SHALL provide a Lender Matcher tool that analyzes student profile and loan details

2. WHEN a counselor requests recommendations, THE Matcher SHALL analyze:
   - Student age and eligibility
   - Loan amount requested
   - Course type and university reputation
   - Student's financial profile (if available)
   - Geographic factors

3. THE Matcher SHALL generate ranked lender recommendations with:
   - Lender name
   - Match score (0-100 indicating probability of approval)
   - Key factors favoring this lender
   - Key factors against this lender

4. WHEN recommendations are displayed, THE COUNSELOR can select recommended lenders to apply to

5. THE Education_Loan_Product SHALL allow counselors to manually add lenders outside recommendations

6. WHEN a lender is selected (recommended or manual), THE COUNSELOR can proceed with application

7. WHEN the Lender Pool changes (new lenders added), THE COUNSELOR can re-run Matcher to get updated recommendations

8. THE Education_Loan_Product SHALL track which recommendation source each Lender Application came from (Auto-recommended vs Manual)

9. WHEN viewing recommendations, THE COUNSELOR SHALL see success stories or conversion rates for each lender (if available)

10. THE CRM System SHALL use matcher recommendations to improve future recommendations (learning from conversions)

---

### Requirement 11: Education Loan - Data Model

**User Story:** As a developer, I want clear data structures for education loans, so that I can implement the system correctly.

#### Acceptance Criteria

1. Loan_Application SHALL have fields: ID, LeadID, University, Course, TargetCountry, TotalLoanAmount, ExpectedIntake, CollateralType (Secured/Unsecured), LoanStage, DateCreated, LastUpdated, CounselorAssigned

2. Lender_Application SHALL have fields: ID, LoanApplicationID, LenderName, LenderStatus, MatchScore, DateApplied, DateSanctioned, SanctionAmount, ROI, PF, DateRejected, RejectionReason, DateDisbursed, DisbursementAmount, TrancheDetails

3. Document_Request SHALL have fields: ID, LoanApplicationID, DocumentCategories (array), Status, DateRequested, DateDeadline

4. Document_Submission SHALL have fields: ID, DocumentRequestID, DocumentName, DocumentCategory, SubmissionTimestamp, SubmissionMethod, DocumentURL

5. Application_Stage_History SHALL record: LoanApplicationID, PreviousStage, NewStage, TransitionTimestamp, ResponsibleCounselor, Reason

6. Lender_Status_History SHALL record: LenderApplicationID, PreviousStatus, NewStatus, StatusChangeTimestamp, UpdatedBy

7. THE CRM System SHALL support querying Loan_Application by: LeadID, CounselorAssigned, LoanStage, DateCreated range

8. THE CRM System SHALL support querying Lender_Application by: LoanApplicationID, LenderName, LenderStatus

9. THE CRM System SHALL maintain referential integrity between Loan_Application and LeadID (deleting lead does not delete loan, but marks it archived)

10. THE CRM System SHALL index queries on: LeadID, LoanStage, LenderStatus for performance

---

### Requirement 12: Education Loan in All Leads Context

**User Story:** As a counselor, I want to see education loan status when viewing a lead in All Leads tab, so that I understand which leads have active loans.

#### Acceptance Criteria

1. WHEN viewing All Leads tab, THE CRM System SHALL display column: "Products Opted" showing list of active products for each lead

2. WHEN a lead has an active Education Loan, THE "Products Opted" column SHALL show "Education Loan" with current Loan Stage as badge

3. WHEN a lead has multiple products, THE "Products Opted" column SHALL show all products with their statuses

4. WHEN clicking on a lead from All Leads, THE DETAIL view SHALL display:
   - All comments on this lead
   - Education Loan card showing: Current Stage, Lenders Applied To, Documents Pending
   - Other products the lead has opted into
   - Quick action buttons: Add Comment, Update Call Status, Apply Loan (if no loan exists)

5. FROM the lead detail view, COUNSELOR can click "Loan Details" to view full loan application and lender applications

6. WHEN a loan is in "Docs Pending" stage, THE ALL LEADS view SHALL display indicator/flag on that lead

7. WHEN a loan is sanctioned or disbursed, THE ALL LEADS view SHALL highlight the lead or show success indicator

8. THE CRM System SHALL support filtering All Leads by: "Has Active Loan" / "Has Education Loan in Docs Pending" / "Has Loan Sanctioned"

9. WHEN viewing All Leads, COUNSELOR can bulk-select leads with loans and perform action (e.g., bulk send document request)

10. WHEN a lead with an active loan is reassigned, THE LOAN application SHALL move with the lead to new counselor

---

### Requirement 13: CRM Data Persistence and Audit Trail

**User Story:** As a system, I want to maintain data integrity and compliance through persistent storage and audit trails, so that all actions are traceable and data is never lost.

#### Acceptance Criteria

1. THE CRM System SHALL persist all lead, product instance, and transaction data to durable storage (database)

2. WHEN any data is created, updated, or deleted, THE CRM System SHALL create audit log entry with: timestamp, user, action, entity type, entity ID, before/after values

3. WHEN a lead is deleted, THE CRM System SHALL perform soft-delete (mark as archived, preserve data)

4. WHEN a product instance is deleted, THE CRM System SHALL perform soft-delete and preserve all associated documents and comments

5. WHEN querying leads/products, THE CRM System SHALL return only active (non-deleted) records unless explicitly querying archive

6. WHEN an admin queries audit logs, THEY can filter by: entity type, user, date range, action type (Create/Update/Delete)

7. THE CRM System SHALL support point-in-time queries (show lead state as of a specific past date)

8. WHEN accessing sensitive data, THE CRM System SHALL log each access with: timestamp, user, entity accessed, access type (read/write)

9. THE CRM System SHALL implement encryption for sensitive fields: phone numbers, email addresses, financial information

10. WHEN data backup occurs, THE CRM System SHALL verify backup integrity and document backup metadata

---

### Requirement 14: Role-Based Access Control

**User Story:** As an admin, I want to enforce role-based permissions so that each team member can only access and modify data they're authorized to handle.

#### Acceptance Criteria

1. THE CRM System SHALL define two primary roles: Counselor and Admin

2. **Counselor role permissions:**
   - View leads assigned to them
   - View product instances assigned to them
   - Create comments on assigned leads
   - Update product-specific information
   - Cannot view leads assigned to other counselors
   - Cannot change product ownership
   - Cannot delete leads or products

3. **Admin role permissions:**
   - View all leads and product instances
   - Create/edit/delete any lead or product instance
   - Assign/reassign product instances to counselors
   - Create comments on any lead
   - View audit logs
   - Manage lender pool and system configuration
   - Export data and generate reports

4. WHEN a counselor attempts to view a lead they don't own, THE CRM System SHALL deny access with error message

5. WHEN an admin views a lead owned by a counselor, THE AUDIT LOG SHALL record the admin access

6. WHEN an admin modifies data owned by a counselor, THE AUDIT LOG SHALL record the admin user and change details

7. THE CRM System SHALL enforce permissions at database layer (not just UI layer)

8. WHEN a counselor logs out, THE CRM System SHALL invalidate their session and require re-authentication

9. THE CRM System SHALL support role-based filtering of data (counselor sees only their leads when querying)

10. THE CRM System SHALL implement API-level authorization (not just frontend authorization)

---

### Requirement 15: Admin Dashboards and Reporting

**User Story:** As an admin, I want system-wide dashboards and reports on lead and product metrics, so that I can monitor CRM health and team performance.

#### Acceptance Criteria

1. THE CRM System SHALL display dashboard showing: Total Leads, Active Leads, Converted Leads, Conversion Rate

2. THE CRM System SHALL display product-specific metrics: 
   - Education Loan: Total Applications, Applications by Stage, Lenders Applied To, Average Time to Sanctioning
   - Remittance: Total Transfers, Total Volume, Average Transfer Amount
   - Future products: Similar metrics

3. WHEN viewing dashboard, THE ADMIN can filter by date range (Last 7 days, Last 30 days, Custom)

4. THE CRM System SHALL generate counselor performance reports showing:
   - Leads created
   - Leads converted
   - Average conversion time
   - Product cross-sell rate (% of leads opting into multiple products)

5. THE CRM System SHALL generate product performance reports showing:
   - New leads by product
   - Conversion rate by product
   - Customer acquisition cost estimate
   - Revenue impact (if applicable)

6. THE CRM System SHALL support exporting reports to CSV and PDF formats

7. WHEN exporting reports, THE CRM System SHALL include only data the admin has access to (respecting any data partitioning)

8. THE CRM System SHALL track lead source (Direct, Referral, Bulk Upload, etc.) and display source distribution

9. THE CRM System SHALL display lender performance metrics: approval rate, average disbursement time, conversion rate per lender

10. THE CRM System SHALL archive historical data to enable year-over-year trend analysis

---

### Requirement 16: Product Extensibility

**User Story:** As a product architect, I want the CRM to be designed for adding new products beyond Education Loan, so that the system remains scalable for future offerings.

#### Acceptance Criteria

1. THE CRM System SHALL define a Product Interface that any new product must implement:
   - Product_ID (unique identifier)
   - Product_Name (display name)
   - Create_Instance (create new product instance for lead)
   - Get_Instance (retrieve product instance)
   - Update_Instance (update product details)
   - Get_Status (return current product status)
   - Get_Stage_Definitions (return product stages/statuses)

2. WHEN a new product is added, THE CRM System SHALL allow registration without modifying core CRM code

3. WHEN product-specific data is modeled, THE CRM System SHALL separate product-agnostic fields (lead ID, ownership) from product-specific fields

4. WHEN a new product defines its own stages, THE CRM System SHALL support product-specific filtering without hardcoding product names

5. THE CRM System SHALL support document categories being extended by products (e.g., Accommodation adds "Accommodation Verification" category)

6. WHEN querying leads, THE CRM System SHALL support filtering by product presence without hardcoding each product

7. THE CRM System SHALL support adding new products without affecting existing product instances or leads

8. WHEN All Leads view displays "Products Opted", IT SHALL dynamically show any registered product without hardcoding

9. THE CRM System SHALL support product-specific tabs being registered dynamically

10. WHEN a new product is deployed, EXISTING leads and products SHALL continue functioning without re-deployment

---

