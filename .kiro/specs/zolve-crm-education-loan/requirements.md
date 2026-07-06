# Zolve CRM - Education Loan Product Requirements

## Introduction

The Zolve CRM Education Loan Product is the first product module built on the Zolve CRM platform. It manages the complete lifecycle of student education loan applications across multiple lenders (Avanse, HDFC Credila, Auxilo, etc.), from initial lead capture through application completion and fund disbursement. 

This requirements document covers three layers:
1. **CRM Core Requirements** - Lead and student management foundations shared across all products
2. **Education Loan Product Requirements** - Loan-specific application, document, and lender coordination
3. **Integration Requirements** - How Education Loan integrates into the broader CRM framework

The Education Loan product must support Zolve's role as a **lead aggregator and lender coordinator**, managing the complex journey of students through multiple parallel lender processes.

---

## Glossary

**Core CRM Terms:**
- **Lead**: A student who has engaged with Zolve for any financial product. Leads are the foundational entity in the CRM system.
- **Student**: Synonymous with Lead. Used interchangeably to refer to the individual seeking financial services.
- **Counselor**: A Zolve team member (RM - Relationship Manager) who manages leads, generates quotes, and coordinates with students and lenders.
- **Admin**: A Zolve team member with system-wide visibility and administrative capabilities.
- **Product**: A financial service offered through the CRM (Remittance, Education Loan, Accommodation, etc.).
- **Lead Lifecycle**: The journey of a lead through stages specific to each product (e.g., for loans: Started → Docs Pending → Docs Received → Call Scheduled → Sanctioned → Disbursed).
- **Status**: The current state of a lead within a product workflow.
- **Remark**: A note, message, or follow-up action recorded on a lead.
- **Reassignment**: The transfer of responsibility for a lead from one counselor to another.

**Education Loan Specific Terms:**
- **Application**: A formal request for an education loan from a specific lender, initiated by a student through Zolve.
- **Lender**: A financial institution providing education loans (Avanse, HDFC Credila, Auxilo, etc.).
- **Lender Status**: The progression state of an application with a specific lender (Interested, Applied, Under Review, Approved, Rejected, Disbursed, etc.).
- **Document Request**: A formal notification to a student requesting specific documents needed for an application.
- **Document Category**: Grouping of related documents (KYC, Academics, Financials, Collateral).
- **Collateral**: Assets or guarantees pledged to secure the loan.
- **Matcher**: The system or process that recommends appropriate lenders based on student and loan parameters.
- **Lender Pool**: The set of lenders currently active in the system and available for matching.
- **Communication Channel**: The method used to contact a student (Phone, Email, SMS, WhatsApp).
- **Call Status**: The outcome of contact attempts with a student (Not Called, Responding, Not Responding, Converted).
- **Milestone**: Key checkpoints in the loan application journey (e.g., Docs Received, Call Scheduled, Sanctioned).

**Document Types:**
- **KYC Documents**: Identity verification (PAN, Aadhar, Passport)
- **Academic Documents**: Educational credentials (Scorecard, Admission Letter, University Details)
- **Financial Documents**: Income/asset proof (Salary Slips, Bank Statements, Tax Returns)
- **Collateral Documents**: Proof of pledged assets (Property Papers, Car Registration, Jewelry Certificate)

**Data Entities:**
- **Student_Profile**: Core identity and demographic information for a student.
- **Loan_Application**: A loan request with student, course, and financial details.
- **Lender_Application**: A specific application instance with a lender (one Loan_Application may have multiple Lender_Applications).
- **Document_Request**: A formal request for documents from a specific category.
- **Document_Submission**: A student's response submitting requested documents.
- **Application_Stage**: The current phase of the application (Started, Docs Pending, etc.).
- **Lender_Recommendation**: Output from the Matcher with ranked lenders and match scores.

---

## Requirements

### Requirement 1: Lead and Student Management Foundation

**User Story:** As a CRM system, I want to manage student leads as the foundational entity, so that all products can reference and build upon student information consistently.

#### Acceptance Criteria

1. THE CRM System SHALL support creation of lead records with minimum required student information (name, phone, email)

2. WHEN a new lead is created, THE CRM System SHALL assign a unique identifier and immutable creation timestamp

3. WHEN a counselor creates a lead, THE CRM System SHALL record the creating counselor as the lead's originator (immutable)

4. WHEN a lead is assigned to a counselor, THE CRM System SHALL record the current owner and track reassignment history

5. THE CRM System SHALL allow leads to be reassigned from one counselor to another, maintaining complete audit trail

6. WHEN a lead exists, THE CRM System SHALL support associating it with multiple products (Remittance, Education Loan, Accommodation)

7. WHEN a lead is reassigned, THE CRM System SHALL maintain the original creator and current owner, enabling historical tracking

8. THE CRM System SHALL support querying leads by counselor ownership, originator, creation date, and status

_Requirements: Foundation for all product modules, multi-tenancy support_

---

### Requirement 2: CRM Lead Status and Lifecycle Management

**User Story:** As an admin, I want consistent lead status management across products while allowing product-specific customization, so that I can track progress uniformly but also respect product-specific workflows.

#### Acceptance Criteria

1. THE CRM System SHALL define a set of core status states (Active, Converted, Not Interested, Lost)

2. WHERE a product is Education Loan, THE Education_Loan_Product SHALL define extended product-specific statuses (Started, Docs Pending, Docs Received, Call Scheduled, Sanctioned, Disbursed)

3. WHEN a lead's product status changes, THE CRM System SHALL record the status change timestamp and responsible counselor

4. WHEN a lead status is queried, THE CRM System SHALL return both core status and product-specific status

5. WHEN a lead is converted, THE CRM System SHALL record conversion date, converted-by counselor, and product involved

6. THE CRM System SHALL allow status filtering in lead views (show only Active leads, show Converted leads, etc.)

7. WHEN filtering by status, THE CRM System SHALL support filtering by both core status and product-specific status

_Requirements: Product-agnostic status framework, audit trail for conversions_

---

### Requirement 3: Education Loan Application Management

**User Story:** As a counselor, I want to create and manage education loan applications for students, so that I can track their loan journey from initial inquiry through disbursement.

#### Acceptance Criteria

1. WHEN a counselor initiates an education loan for a student, THE Education_Loan_Product SHALL create a Loan_Application record linked to the student's lead

2. THE Education_Loan_Product SHALL capture core loan details (University, Course, Total Fee, Expected Disbursement Date)

3. WHEN a Loan_Application is created, THE Education_Loan_Product SHALL automatically determine the appropriate Application_Stage (Started)

4. THE Education_Loan_Product SHALL support editing loan details while in Started stage

5. WHEN loan details change (e.g., total fee updated), THE Education_Loan_Product SHALL record the change timestamp and user

6. THE Education_Loan_Product SHALL prevent editing loan details once the application advances beyond Started stage

7. WHEN a counselor views a student's lead, THE Education_Loan_Product SHALL display the associated Loan_Application with all key details

8. THE Education_Loan_Product SHALL support creating multiple loan applications for the same student (for different courses/universities)

_Requirements: Core loan tracking, immutability of committed data, multi-application support_

---

### Requirement 4: Education Loan Application Stages and Workflow

**User Story:** As a counselor, I want to track the progression of a loan application through defined stages, so that I understand where each application stands in the process.

#### Acceptance Criteria

1. THE Education_Loan_Product SHALL define the following application stages: Started → Docs Pending → Docs Received → Call Scheduled → Sanctioned → Disbursed

2. WHEN a Loan_Application is created, THE Application_Stage SHALL initially be Started

3. WHEN documents are requested for an application, THE Application_Stage SHALL transition to Docs Pending

4. WHEN all requested documents are received, THE Application_Stage SHALL transition to Docs Received

5. WHEN a call with the student is scheduled, THE Application_Stage SHALL transition to Call Scheduled

6. WHEN a lender sanctions the application, THE Application_Stage SHALL transition to Sanctioned

7. WHEN funds are disbursed to the student, THE Application_Stage SHALL transition to Disbursed

8. WHEN a Loan_Application stage changes, THE Education_Loan_Product SHALL record the stage change timestamp, responsible counselor, and reason

9. THE Education_Loan_Product SHALL prevent stage regression (moving backwards through stages)

10. WHEN viewing an application, THE CRM System SHALL display the current stage, stage progression history, and time in current stage

_Requirements: Clear workflow progression, audit trail for stage transitions_

---

### Requirement 5: Multi-Lender Coordination and Matching

**User Story:** As a counselor, I want to match students with suitable lenders, so that students have options and Zolve can maximize approval chances across multiple lenders.

#### Acceptance Criteria

1. THE Education_Loan_Product SHALL support multiple simultaneous lender applications for a single Loan_Application

2. WHEN a counselor initiates lender matching, THE Matcher SHALL analyze student profile and loan details against Lender_Pool

3. THE Matcher SHALL generate ranked recommendations with match scores for each recommended lender

4. THE Matcher SHALL recommend lenders based on criteria: student eligibility, loan amount, course type, university reputation, collateral availability

5. WHEN a counselor selects a lender from recommendations, THE Education_Loan_Product SHALL create a Lender_Application record

6. THE Education_Loan_Product SHALL allow counselor to manually add lenders outside of Matcher recommendations

7. WHEN a Lender_Application is created, THE Education_Loan_Product SHALL record the lender name, match score, and recommendation source (Auto/Manual)

8. WHEN viewing a Loan_Application, THE Education_Loan_Product SHALL display all associated Lender_Applications with current status of each

9. THE Education_Loan_Product SHALL support tracking communication history for each Lender_Application separately

10. WHEN lender pool changes (lender added/removed), THE Education_Loan_Product SHALL allow re-running matcher for existing applications

_Requirements: Multi-lender support, matcher algorithm, lender recommendation ranking_

---

### Requirement 6: Education Loan Lender Application Tracking

**User Story:** As a counselor, I want to track the status of an application with each specific lender, so that I understand where the application stands in the lender's process.

#### Acceptance Criteria

1. THE Education_Loan_Product SHALL track application status independently for each Lender_Application (one per lender)

2. THE Education_Loan_Product SHALL define Lender_Status values: Interested, Applied, Under Review, Approved, Rejected, Disbursed, Withdrawn

3. WHEN a Lender_Application is created, THE Lender_Status SHALL initially be Interested

4. WHEN an application is submitted to a lender, THE Lender_Status SHALL transition to Applied

5. WHEN a lender begins review, THE Lender_Status SHALL transition to Under Review

6. WHEN a lender approves the application, THE Lender_Status SHALL transition to Approved

7. WHEN a lender rejects the application, THE Lender_Status SHALL transition to Rejected with reason recorded

8. WHEN funds are disbursed by the lender, THE Lender_Status SHALL transition to Disbursed

9. WHEN a Lender_Status changes, THE Education_Loan_Product SHALL record the status change timestamp, responsible party (Counselor/Lender), and any additional details

10. WHEN viewing an application, THE Counselor SHALL see lender status alongside Application_Stage (they track different dimensions)

_Requirements: Per-lender status tracking, audit trail, parallel lender tracking_

---

### Requirement 7: Student Communication and Call Tracking

**User Story:** As a counselor, I want to track communication attempts and outcomes with students, so that I can coordinate follow-ups and understand student engagement.

#### Acceptance Criteria

1. THE Education_Loan_Product SHALL record call status for each student's education loan lead (Not Called, Responding, Not Responding, Converted)

2. WHEN a call attempt is made, THE Education_Loan_Product SHALL record the call timestamp, outcome (status), and notes from the counselor

3. WHEN a call outcome is "Not Responding", THE Education_Loan_Product SHALL require counselor to set a reschedule date

4. WHEN a reschedule date is set, THE Education_Loan_Product SHALL alert the assigned counselor at the specified time

5. THE Education_Loan_Product SHALL support multiple communication channels (Phone, Email, SMS, WhatsApp)

6. WHEN recording a call, THE Education_Loan_Product SHALL capture channel used and reference number if applicable (e.g., call duration, message ID)

7. THE Education_Loan_Product SHALL maintain communication history showing all calls, messages, and follow-ups for a lead

8. WHEN a student's status is "Converted", THE Education_Loan_Product SHALL record the conversion date and mark subsequent follow-ups accordingly

9. THE CRM System SHALL support filtering leads by call status (show only "Not Responding" leads for follow-up)

10. WHEN viewing a student's lead, THE Education_Loan_Product SHALL display the most recent call record and next scheduled follow-up

_Requirements: Call tracking, communication history, follow-up scheduling_

---

### Requirement 8: Document Collection and Workflow

**User Story:** As a counselor, I want to request and track documents from students systematically, so that I can ensure complete documentation for lender applications.

#### Acceptance Criteria

1. THE Education_Loan_Product SHALL define document categories: KYC, Academics, Financials, Collateral

2. THE Education_Loan_Product SHALL define document checklists for each category with specific required documents

3. FOR document requests in Collateral category, THE Education_Loan_Product SHALL include collateral-specific documents in the checklist

4. FOR document requests in Non-Collateral category, THE Education_Loan_Product SHALL exclude collateral-specific documents from the checklist

5. WHEN a counselor initiates document collection, THE Education_Loan_Product SHALL generate a Document_Request with selected categories

6. WHEN a Document_Request is created, THE Education_Loan_Product SHALL automatically transition Application_Stage to Docs Pending

7. WHEN a Document_Request is sent to a student, THE Education_Loan_Product SHALL record the sent timestamp and requested document list

8. THE Education_Loan_Product SHALL support multiple document submission methods (Upload, Email, Manual Entry)

9. WHEN a student submits documents, THE Education_Loan_Product SHALL record each document (name, date, category, submission method)

10. WHEN all requested documents are received, THE Education_Loan_Product SHALL allow counselor to confirm completeness and transition to Docs Received stage

11. WHEN a document is missing or rejected, THE Education_Loan_Product SHALL allow counselor to re-request it without resetting the entire request

12. THE Education_Loan_Product SHALL maintain document version history (track if document was updated/resubmitted)

_Requirements: Document tracking, category-based checklists, collateral vs non-collateral workflows_

---

### Requirement 9: Document Checklists and Requirements

**User Story:** As a system, I want to define comprehensive document requirements for education loans, so that counselors have clear guidance on what to collect.

#### Acceptance Criteria

1. THE Education_Loan_Product SHALL define the following KYC documents (required for all): PAN Card, Aadhar Card, Voter ID or Passport

2. THE Education_Loan_Product SHALL define the following Academic documents (required for all): 10th Scorecard, 12th Scorecard, Admission Letter or Degree Certificate, University Details

3. THE Education_Loan_Product SHALL define the following Financial documents (required for all): Salary Slips (3 months), Income Tax Returns (2 years), Bank Statements (3 months)

4. THE Education_Loan_Product SHALL define the following Collateral documents (required if collateral offered): Property Papers, Vehicle Registration, Jewelry Certificate, Gold Hallmark

5. WHEN requesting documents, THE Education_Loan_Product SHALL allow counselor to select which documents are required for this specific student

6. THE Education_Loan_Product SHALL display document requirements to student with clear labeling (Required/Optional)

7. WHEN a student views their document request, THE Education_Loan_Product SHALL show status of each document (Not Started, In Progress, Submitted, Approved, Rejected)

8. THE Education_Loan_Product SHALL support custom document requests beyond standard categories

9. WHEN documents are submitted, THE Education_Loan_Product SHALL validate document type matches the request category

10. THE Education_Loan_Product SHALL record deadline for document submission and alert counselor if deadline is approaching or passed

_Requirements: Standardized document lists, flexible selection, deadline tracking_

---

### Requirement 10: CRM Remark and Follow-up History

**User Story:** As a counselor, I want to record notes and follow-ups on leads, so that I and other team members have context on all interactions with a student.

#### Acceptance Criteria

1. THE CRM System SHALL support adding remarks (notes) to any lead with text content

2. WHEN a remark is added, THE CRM System SHALL record remark timestamp, author counselor, and remark text

3. THE CRM System SHALL maintain complete remark history for a lead (all remarks viewable with newest first)

4. WHERE a remark is a follow-up action, THE CRM System SHALL support associating a due date with the remark

5. WHEN a follow-up due date is set, THE CRM System SHALL alert the assigned counselor at the due time

6. THE CRM System SHALL allow remarks to be edited (with audit trail showing original and updated text with timestamps)

7. THE CRM System SHALL allow remarks to be deleted (with audit trail showing deletion timestamp and user)

8. WHEN searching remarks, THE CRM System SHALL support full-text search across all remarks for a lead

9. THE CRM System SHALL distinguish between internal remarks (for team only) and external remarks (shared with student)

10. WHEN viewing a lead, THE CRM System SHALL display the most recent remarks and upcoming follow-ups

_Requirements: Comprehensive audit trail, follow-up management, internal/external note separation_

---

### Requirement 11: Counselor Role and Lead Assignment

**User Story:** As an admin, I want to manage counselor users and assign leads to them, so that I can distribute work and track ownership.

#### Acceptance Criteria

1. THE CRM System SHALL define a Counselor role with permissions: view assigned leads, create/edit quotes, add remarks, request documents

2. THE CRM System SHALL define an Admin role with permissions: view all leads, reassign leads, manage users, manage product statuses

3. WHEN a new counselor is created, THE CRM System SHALL assign a unique user ID and record creation timestamp

4. THE CRM System SHALL allow counselors to access only leads assigned to them (except for cross-team visibility scenarios)

5. WHERE an Admin performs an action, THE CRM System SHALL record the admin action and timestamp

6. THE CRM System SHALL track which counselor created each lead (originator) and which counselor currently owns it

7. WHEN a counselor is assigned a new lead, THE CRM System SHALL notify them of the assignment

8. THE CRM System SHALL support bulk lead assignment from one counselor to another

9. WHEN a counselor is deactivated, THE CRM System SHALL allow reassigning their leads to another counselor

10. THE CRM System SHALL maintain role-based access control enforcing permissions at the data layer (not just UI)

_Requirements: Role definitions, user management, permission enforcement_

---

### Requirement 12: Admin Dashboards and Reporting

**User Story:** As an admin, I want to see system-wide dashboards and reports on lead and loan metrics, so that I can monitor CRM health and product performance.

#### Acceptance Criteria

1. THE CRM System SHALL display dashboard showing: Total Active Leads, Leads by Product, Leads by Counselor, Conversion Rate

2. THE CRM System SHALL display Education Loan specific metrics: Total Applications, Applications by Stage, Lender Conversion Rate, Average Time in Each Stage

3. THE CRM System SHALL support filtering dashboard metrics by date range (Last 7 days, Last 30 days, Custom)

4. THE CRM System SHALL generate reports showing counselor productivity (leads created, leads converted, average conversion time)

5. THE CRM System SHALL generate reports showing product performance (new leads, conversions, revenue impact if applicable)

6. WHEN viewing reports, THE CRM System SHALL support exporting to Excel or PDF format

7. THE CRM System SHALL track lead source (Direct, Referral, Advertisement, etc.) and display source distribution

8. THE CRM System SHALL display lender performance metrics (approval rate, average disbursement time per lender)

9. THE CRM System SHALL allow admins to segment leads and view metrics for specific segments (by course type, university, fee range)

10. THE CRM System SHALL archive historical reports for year-over-year trend analysis

_Requirements: Multi-dimensional reporting, export capability, historical tracking_

---

### Requirement 13: CRM Data Persistence and Audit Trail

**User Story:** As a system, I want to persist all data reliably and maintain complete audit trails, so that I can ensure data integrity and enable compliance.

#### Acceptance Criteria

1. THE CRM System SHALL persist all lead, application, and transaction data to a durable database

2. WHEN any data is created, updated, or deleted, THE CRM System SHALL record an audit log entry with timestamp, user, action, and affected data

3. THE CRM System SHALL prevent deletion of leads (soft-delete only, marking as archived)

4. THE CRM System SHALL maintain version history for editable entities (Loan_Application, Documents, Remarks)

5. WHEN querying data, THE CRM System SHALL return current state unless explicitly requesting historical versions

6. THE CRM System SHALL support point-in-time queries (show lead state as of a specific date/time)

7. THE CRM System SHALL implement data backup and recovery procedures

8. WHEN data is backed up, THE CRM System SHALL verify backup integrity

9. THE CRM System SHALL retain audit logs for minimum 7 years for compliance

10. THE CRM System SHALL implement encryption for sensitive data (passwords, financial information)

_Requirements: Data durability, compliance, audit trails_

---

### Requirement 14: Integration with CRM Lead Views and Navigation

**User Story:** As a counselor, I want to access education loan application features from the unified CRM lead view, so that I can manage all aspects of a student's journey from one place.

#### Acceptance Criteria

1. WHEN a counselor clicks on a lead in the CRM leads list, THE Education_Loan_Product SHALL display education loan tab showing Loan_Application details

2. WHEN an education loan application exists for a lead, THE CRM leads list SHALL display indicator showing application count and current stage

3. THE Education_Loan_Product SHALL display navigation linking between student profile, loan application, lender applications, and documents

4. WHEN a counselor switches between products for the same lead, THE CRM System SHALL preserve context and allow seamless navigation

5. WHEN creating a new lead, THE CRM System SHALL allow counselor to optionally immediately create an education loan application

6. WHEN viewing Education Loan product, THE CRM System SHALL display lead status, product-specific status (loan stage), and call tracking together

7. THE Education_Loan_Product SHALL integrate with CRM remarks system to display remarks in loan context

8. THE Education_Loan_Product SHALL integrate with CRM reassignment system allowing leads with active loans to be reassigned

9. WHEN a lead is reassigned, THE Education_Loan_Product SHALL maintain all education loan data and lender applications

10. THE CRM System SHALL support filtering leads by education loan presence (show only leads with active loan applications)

_Requirements: Unified UI/UX, product integration, seamless navigation_

---

### Requirement 15: Education Loan Product Data Isolation and Multi-Tenancy

**User Story:** As a system, I want to ensure counselors only see their assigned leads and admins have appropriate visibility, so that data privacy and security are maintained.

#### Acceptance Criteria

1. THE CRM System SHALL enforce row-level security ensuring counselors access only their assigned leads

2. WHERE a counselor is assigned Lead A, THE CRM System SHALL prevent that counselor from accessing Lead B assigned to another counselor

3. WHEN an admin accesses a counselor's lead, THE CRM System SHALL log the access with timestamp and admin user ID

4. THE CRM System SHALL support admin-only override capability for viewing any lead with full audit trail

5. THE Education_Loan_Product SHALL apply same access controls to all loan data (applications, documents, lender status)

6. WHEN data is exported, THE CRM System SHALL respect access controls (counselor exports show only their leads)

7. THE CRM System SHALL prevent counselors from directly editing other counselors' data through any API or interface

8. THE CRM System SHALL enforce access control at database layer (not just UI layer)

9. WHEN a lead is reassigned, THE CRM System SHALL update access permissions ensuring only new owner has access

10. THE CRM System SHALL provide audit logs of all access control violations or override uses

_Requirements: Security, data privacy, audit trail_

---

### Requirement 16: Educational Loan Product Extensibility and Future Products

**User Story:** As a product architect, I want the education loan product to be built using patterns that allow future products (Remittance enhancements, Accommodation, Credit Cards), so that the system remains scalable.

#### Acceptance Criteria

1. THE CRM System SHALL define clear interfaces for product modules (create lead, update status, request documents, add remarks)

2. WHEN a new product is added, THE CRM System SHALL allow registration of product-specific statuses without modifying core code

3. THE Education_Loan_Product SHALL implement product interfaces in a way reusable by other products

4. WHEN data models are designed, THE CRM System SHALL separate product-agnostic fields from education-loan-specific fields

5. THE CRM System SHALL support multiple products per lead with independent status tracking for each

6. WHEN products share functionality (documents, communication), THE CRM System SHALL provide shared components and utilities

7. THE Education_Loan_Product SHALL not hardcode product-specific logic in core CRM engine

8. THE CRM System SHALL support adding new document categories in future products without redesign

9. WHEN a new product is introduced, existing leads and products SHALL remain functional and unaffected

10. THE CRM System SHALL maintain backward compatibility as new products are added

_Requirements: Modularity, extensibility, scalability_

---

