# Implementation Plan: Lead Management Feature

## Overview

The Lead Management Feature implementation follows a bottom-up approach: database infrastructure first, then core business logic, then UI, then integration, and finally quality assurance. Each task builds on previous steps to enable incremental development and early validation of core functionality.

## Phase 1: Database & Core Infrastructure

These foundational tasks establish the Firestore schema, security rules, and core CRUD operations that all other features depend on.

- [x] 1.1 Create Firestore database schema and indexes
  - **Files**: firestore.rules (add leads collection rules), Firebase console (create indexes)
  - **Acceptance Criteria**: Firestore has leads collection with security rules allowing counselors to read/write own leads and admins to manage all leads; all required indexes are created and active
  - **Dependencies**: Firebase project must be set up
  - **Requirements Met**: Requirements 1.1 (Lead Data Model), 13 (Lead Security), 17 (Performance)

- [x] 1.2 Implement core leads.js module with CRUD operations
  - **Files**: js/leads.js (new), firestore.js (extend with helpers)
  - **Acceptance Criteria**: Module exports createLead, getLead, updateLead, deleteLead, searchLeads, and getLeadByPhoneAndProduct functions; all validate required fields (studentName, phone) and handle errors
  - **Dependencies**: Firestore must be initialized; leads collection rules must be deployed
  - **Requirements Met**: Requirements 1.1, 1.8, 2.3, 2.4, 6.3, 6.4, 12.3
  
  - [ ]* 1.2.1 Write property test for lead data round-trip
    - **Property 1: Lead data round-trip**
    - **Validates: Requirements 1.1, 1.6, 1.7, 1.9, 2.7**

  - [ ]* 1.2.2 Write property test for required fields validation
    - **Property 5: Required fields validation**
    - **Validates: Requirements 1.8, 2.3, 2.4, 2.8, 3.3**

  - [ ]* 1.2.3 Write property test for lead ownership on creation
    - **Property 4: Lead ownership on creation**
    - **Validates: Requirements 2.10, 3.7**

  - [ ]* 1.2.4 Write property test for product type defaults
    - **Property 2: Product type defaults to Remittance**
    - **Validates: Requirements 1.3, 3.4**

  - [ ]* 1.2.5 Write property test for initial call status
    - **Property 3: Initial call status is Not Called**
    - **Validates: Requirements 2.9, 3.8**

- [x] 1.3 Implement remarks sub-collection management
  - **Files**: js/leads.js (add remark functions)
  - **Acceptance Criteria**: addRemark(leadId, text) creates remark with text, timestamp, and counselor metadata; getRemarksForLead returns all remarks; remarks are append-only
  - **Dependencies**: Task 1.2 must be complete
  - **Requirements Met**: Requirements 1.7, 1.9, 8.3, 8.5, 8.6
  
  - [ ]* 1.3.1 Write property test for remarks append without mutation
    - **Property 20: Remarks append without mutation**
    - **Validates: Requirements 8.3, 8.5**

  - [ ]* 1.3.2 Write property test for remarks record metadata
    - **Property 21: Remarks record metadata**
    - **Validates: Requirements 8.3**

- [x] 1.4 Implement status update functions with authorization checks
  - **Files**: js/leads.js (updateCallStatus, updateRemittanceStatus, updateRescheduleDate)
  - **Acceptance Criteria**: updateCallStatus accepts only the five valid statuses; updateRemittanceStatus is admin-only; updateRescheduleDate rejects past dates; all update updatedAt timestamp
  - **Dependencies**: Task 1.2 must be complete
  - **Requirements Met**: Requirements 6.3, 6.4, 6.5, 6.9, 7.2, 7.3, 7.4
  
  - [ ]* 1.4.1 Write property test for status update persists
    - **Property 12: Status update persists**
    - **Validates: Requirements 6.3, 6.4**

  - [ ]* 1.4.2 Write property test for remittance status admin only
    - **Property 13: Remittance status admin only**
    - **Validates: Requirements 6.9**

  - [ ]* 1.4.3 Write property test for reschedule date future only
    - **Property 16: Reschedule date future only**
    - **Validates: Requirements 7.2, 7.3**

  - [ ]* 1.4.4 Write property test for reschedule date persists
    - **Property 17: Reschedule date persists**
    - **Validates: Requirements 7.4, 7.5**

- [x] 1.5 Checkpoint - Verify all database operations work correctly
  - Ensure leads can be created, read, updated, deleted; remarks can be added; status updates work; all property tests pass
  - Ask user if questions arise

## Phase 2: Counselor Lead Management

These tasks build the core counselor-facing UI and business logic for managing their own leads.

- [x] 2.1 Create leads.css with styling for tables, modals, forms
  - **Files**: css/leads.css (new)
  - **Acceptance Criteria**: Stylesheet includes styles for leads table, lead detail modal, create form modal, upload interface; responsive design for mobile
  - **Dependencies**: None; can be done in parallel with other tasks
  - **Requirements Met**: Requirements 18 (Responsiveness), general styling

- [x] 2.2 Add Leads tab to calculator.html interface
  - **Files**: calculator.html (add Leads tab button and container), css/leads.css (ensure responsive styling)
  - **Acceptance Criteria**: Leads tab is visible in calculator.html navigation; clicking it shows leads container; tab content is empty (to be populated in next tasks)
  - **Dependencies**: Task 2.1 should be complete
  - **Requirements Met**: Requirements 4.1

- [x] 2.3 Implement leadsUI.js with table rendering and event handling
  - **Files**: js/leadsUI.js (new)
  - **Acceptance Criteria**: renderCounselorLeadsTable renders table with columns for name, phone, email, product type, call status, reschedule date; clicking row opens lead detail modal; attaches event listeners for search and filter
  - **Dependencies**: Tasks 1.2 (leads.js), 2.2 (HTML structure) must be complete
  - **Requirements Met**: Requirements 4.2, 4.3, 4.8, 4.9, 16.8

  - [ ]* 2.3.1 Write unit tests for table rendering
    - Test with 0, 1, 5, 100 leads
    - _Requirements: 4.3, 4.9_

- [x] 2.4 Implement lead search by student name
  - **Files**: js/leadsUI.js (update), js/leads.js (add searchLeads method)
  - **Acceptance Criteria**: Search input filters leads by name (case-insensitive partial match); results update in real-time; empty search shows all leads
  - **Dependencies**: Tasks 1.2, 2.3 must be complete
  - **Requirements Met**: Requirements 4.4, 16.1
  
  - [ ]* 2.4.1 Write property test for search filtering
    - **Property N/A**: Search returns correct partial matches
    - _Requirements: 4.4, 16.1_

- [x] 2.5 Implement lead filtering (status, lender, product type)
  - **Files**: js/leadsUI.js (add filter handlers), js/leads.js (add filter parameters to searchLeads)
  - **Acceptance Criteria**: Dropdown filters for call status, lender, and product type; multiple filters AND together; clearing filters shows all leads
  - **Dependencies**: Tasks 1.2, 2.3, 2.4 must be complete
  - **Requirements Met**: Requirements 4.5, 4.6, 4.7, 16.2, 16.3, 16.4, 16.7
  
  - [ ]* 2.5.1 Write property test for counselor filtering
    - **Property 10: Counselor filtering**
    - **Validates: Requirements 4.4, 4.5, 4.6, 4.7, 16.1, 16.2, 16.3, 16.4**

- [x] 2.6 Implement lead detail modal with all lead information
  - **Files**: js/leadsUI.js (add renderLeadDetailModal), css/leads.css (add modal styles), templates/lead-modals.html (new, optional)
  - **Acceptance Criteria**: Modal displays all lead fields, complete remarks history (newest first), list of associated quotes, buttons for editing status/date/remarks and delete
  - **Dependencies**: Tasks 1.2, 1.3, 2.3 must be complete
  - **Requirements Met**: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8

  - [ ]* 2.6.1 Write unit tests for modal rendering
    - Test with 0, 5, 50 remarks
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 2.7 Implement lead creation form and create logic
  - **Files**: js/leadsUI.js (add renderLeadCreateForm), js/leads.js (validateLeadData)
  - **Acceptance Criteria**: Form validates student name and phone are required; email format if provided; submitting creates lead and shows success confirmation; form clears after submit
  - **Dependencies**: Tasks 1.2, 2.2, 2.3 must be complete
  - **Requirements Met**: Requirements 2.1, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11
  
  - [ ]* 2.7.1 Write property test for phone validation
    - **Property 34: Phone validation**
    - **Validates: Requirements 2.4, 15.2**

  - [ ]* 2.7.2 Write property test for email validation
    - **Property 33: Email validation**
    - **Validates: Requirements 2.5, 15.3**

  - [ ]* 2.7.3 Write unit tests for lead creation form
    - Test valid data creation
    - Test required field validation
    - Test error messages
    - _Requirements: 2.3, 2.4, 2.5, 2.8_

- [x] 2.8 Implement remarks management (add, display, authorization)
  - **Files**: js/leadsUI.js (add remark input in modal), js/leads.js (check authorization in addRemark)
  - **Acceptance Criteria**: Counselor can add remarks to their own leads; remarks display with timestamp and counselor name; new remarks appear at top; authorization check prevents adding to others' leads
  - **Dependencies**: Tasks 1.3, 2.6 must be complete
  - **Requirements Met**: Requirements 8.1, 8.2, 8.3, 8.4, 8.6, 13.4, 13.5
  
  - [ ]* 2.8.1 Write unit tests for remarks authorization
    - Test counselor can add to own lead
    - Test counselor cannot add to others' lead
    - _Requirements: 8.6, 13.4, 13.5_

- [x] 2.9 Implement inline status and reschedule date updates in modal
  - **Files**: js/leadsUI.js (add status/date update handlers), js/leads.js (updateCallStatus, authorization checks)
  - **Acceptance Criteria**: Counselor can update call status from dropdown; reschedule date picker rejects past dates; updates persist and show success; cannot edit others' leads
  - **Dependencies**: Tasks 1.4, 2.6 must be complete
  - **Requirements Met**: Requirements 6.1, 6.2, 6.3, 6.5, 7.1, 7.2, 7.3, 7.4, 7.6, 13.4, 13.5
  
  - [ ]* 2.9.1 Write property test for counselor status update authorization
    - **Property 14: Counselor status update authorization**
    - **Validates: Requirements 6.5, 13.4, 13.5**

  - [ ]* 2.9.2 Write property test for reschedule date authorization
    - **Property 18: Reschedule date authorization**
    - **Validates: Requirements 7.6**

- [x] 2.10 Implement lead deletion with confirmation
  - **Files**: js/leadsUI.js (add delete handler), js/leads.js (authorization check in deleteLead)
  - **Acceptance Criteria**: Delete button shows confirmation dialog; only counselor who owns lead can delete it; deleted lead removed from view; success message shown
  - **Dependencies**: Tasks 1.2, 2.6 must be complete
  - **Requirements Met**: Requirements 12.1, 12.2, 12.3, 12.6, 12.7, 13.5
  
  - [ ]* 2.10.1 Write property test for lead deletion authorization
    - **Property 26: Lead deletion authorization**
    - **Validates: Requirements 12.7, 13.5**

  - [ ]* 2.10.2 Write property test for lead deletion removes lead
    - **Property 25: Lead deletion removes lead**
    - **Validates: Requirements 12.3**

- [x] 2.11 Checkpoint - Ensure counselor lead management is complete
  - All counselor features working: create, search, filter, view details, update status/date, add remarks, delete
  - Ask user if questions arise

## Phase 3: Excel Operations

These tasks enable bulk lead import and export via Excel files.

- [x] 3.1 Create lead Excel template download functionality
  - **Files**: js/leadUploader.js (new, with generateExcelTemplate), templates/lead-template-sample.xlsx (or generate dynamically)
  - **Acceptance Criteria**: Template file downloads with headers (studentName, phone, email, university, course, totalFee, lenderName, productType, callStatus, rescheduleDate); includes sample data row; no real lead data included
  - **Dependencies**: None; can work in parallel
  - **Requirements Met**: Requirements 14.1, 14.2, 14.3, 14.4, 14.5, 14.6
  
  - [ ]* 3.1.1 Write property test for Excel template structure
    - **Property 31: Excel template structure**
    - **Validates: Requirements 14.2, 14.3, 14.5**

  - [ ]* 3.1.2 Write property test for Excel template no real data
    - **Property 32: Excel template no real data**
    - **Validates: Requirements 14.6**

- [x] 3.2 Implement Excel/CSV file parser and lead creation
  - **Files**: js/leadUploader.js (uploadExcelFile), js/leads.js (createLeadFromRow)
  - **Acceptance Criteria**: Parser accepts .xlsx and .csv formats; validates required columns (name, phone); for each row, validates data and creates lead if valid; returns summary of successful and failed rows
  - **Dependencies**: Tasks 1.2, 3.1 must be complete
  - **Requirements Met**: Requirements 3.2, 3.3, 3.6, 3.7, 3.8
  
  - [ ]* 3.2.1 Write property test for Excel file format support
    - **Property 6: Excel file format support**
    - **Validates: Requirements 3.2, 3.6**

  - [ ]* 3.2.2 Write property test for Excel upload partial success
    - **Property 7: Excel upload partial success**
    - **Validates: Requirements 3.5, 15.4, 15.5**

  - [ ]* 3.2.3 Write unit tests for row validation
    - Test valid row, missing name, missing phone, invalid phone format, invalid email
    - _Requirements: 3.3, 15.2, 15.3_

- [x] 3.3 Implement upload error reporting
  - **Files**: js/leadUploader.js (validateLeadRow), js/leadsUI.js (renderUploadResults)
  - **Acceptance Criteria**: For each invalid row, report row number and specific error (missing name, invalid phone, invalid email); show summary of successful/failed counts; suggest corrections
  - **Dependencies**: Tasks 3.2 must be complete
  - **Requirements Met**: Requirements 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7

- [x] 3.4 Add upload interface to counselor leads view
  - **Files**: calculator.html (add upload button and modal to Leads tab), js/leadsUI.js (attach upload handlers), css/leads.css (upload modal styles)
  - **Acceptance Criteria**: Upload button visible in leads tab; clicking opens file selector; file upload triggers parser; results modal shows success/failure summary; option to upload another file
  - **Dependencies**: Tasks 2.2, 3.2, 3.3 must be complete
  - **Requirements Met**: Requirements 3.1

- [x] 3.5 Implement export functionality
  - **Files**: js/leadUploader.js (exportLeadsToExcel)
  - **Acceptance Criteria**: Export button available to counselors; exports their leads to .xlsx with all fields; exports respecting current filters
  - **Dependencies**: Tasks 2.5, 3.1 must be complete
  - **Requirements Met**: Requirements 3.1 (counselor export feature)

- [x] 3.6 Checkpoint - Verify Excel operations work
  - Download template, upload valid file, upload partial file, export leads
  - Ask user if questions arise

## Phase 4: Admin Features

These tasks add system-wide admin features for viewing and managing all leads.

- [x] 4.1 Add Leads tab to admin.html interface
  - **Files**: admin.html (add Leads tab button and container), css/admin-styles.css (add admin leads styles)
  - **Acceptance Criteria**: Admin Leads tab visible in admin.html; clicking shows admin leads container; contains filters and leads table
  - **Dependencies**: Task 1.2 should be complete
  - **Requirements Met**: Requirements 5.1

- [x] 4.2 Implement admin leads view with all leads
  - **Files**: js/admin.js (extend or new file for admin leads functions), js/leadsUI.js (add renderAdminLeadsTable)
  - **Acceptance Criteria**: Admin can see all leads from all counselors; table shows counselor email column plus all standard lead columns; loads all leads efficiently
  - **Dependencies**: Tasks 1.2, 4.1 must be complete
  - **Requirements Met**: Requirements 5.2, 5.3, 5.10, 5.11
  
  - [ ]* 4.2.1 Write property test for admin lead visibility
    - **Property 9: Admin lead visibility**
    - **Validates: Requirements 5.2, 13.3**

  - [ ]* 4.2.2 Write unit tests for admin leads table rendering
    - Test with 0, 1, 100, 1000 leads from multiple counselors
    - _Requirements: 5.2, 5.3_

- [x] 4.3 Implement advanced admin filters (counselor email, date range)
  - **Files**: js/admin.js (or extension), js/leadsUI.js (add admin filter handlers)
  - **Acceptance Criteria**: Admin can filter by: call status, lender, product type, counselor email, date range (from-to, inclusive); multiple filters AND together; clearing filters shows all leads
  - **Dependencies**: Tasks 1.2, 4.2 must be complete
  - **Requirements Met**: Requirements 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 16.5, 16.6, 16.7
  
  - [ ]* 4.3.1 Write property test for admin filtering
    - **Property 11: Admin filtering**
    - **Validates: Requirements 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 16.5, 16.6, 16.7**

- [x] 4.4 Implement admin status updates (call and remittance)
  - **Files**: js/admin.js (add status update handlers), js/leads.js (authorization already in place)
  - **Acceptance Criteria**: Admin can update call status and remittance status from lead detail modal; updates persist; admin can update any lead regardless of ownership
  - **Dependencies**: Tasks 1.4, 2.6, 4.2 must be complete
  - **Requirements Met**: Requirements 6.6, 6.7, 6.8, 6.9, 13.6, 15 (admin status)
  
  - [ ]* 4.4.1 Write property test for admin status update authorization
    - **Property 15: Admin status update authorization**
    - **Validates: Requirements 6.5, 6.9, 13.6**

- [x] 4.5 Implement admin lead export to Excel
  - **Files**: js/admin.js (add export handler), js/leadUploader.js (exportLeadsToExcel with admin scope)
  - **Acceptance Criteria**: Export button in admin leads view; exports all filtered leads to .xlsx with all fields including counselor email; returns success message with timestamp
  - **Dependencies**: Tasks 3.1, 4.3 must be complete
  - **Requirements Met**: Requirements 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7
  
  - [ ]* 4.5.1 Write property test for admin lead export
    - **Property 35: Admin lead export**
    - **Validates: Requirements 19.2, 19.3, 19.4**

- [x] 4.6 Checkpoint - Verify admin features work
  - View all leads, apply filters, update statuses (call + remittance), export filtered leads
  - Ask user if questions arise

- [x] 4.7 Implement lead reassignment functionality (NEW)
  - **Files**: js/leads.js (add reassignLead function), js/admin.js (add reassignment handler), js/leadsUI.js (add reassignment modal)
  - **Acceptance Criteria**: Admin can reassign lead to another counselor; system records originator (unchanged) and updates fulfiller (current owner); reassignment history stored; timeline entry created; success confirmation shown
  - **Dependencies**: Tasks 1.2, 2.6, 4.2 must be complete
  - **Requirements Met**: Requirements 27.1, 27.2, 27.3, 27.4, 27.9, 27.10
  
  - [ ]* 4.7.1 Write property test for lead reassignment preserves originator
    - **Property 37: Lead reassignment preserves originator**
    - **Validates: Requirements 27.3, 28.1, 28.3**

  - [ ]* 4.7.2 Write property test for lead reassignment updates fulfiller
    - **Property 38: Lead reassignment updates fulfiller**
    - **Validates: Requirements 27.3, 28.2, 28.4**

- [x] 4.8 Add reassignment history tracking and display
  - **Files**: js/leadsUI.js (add reassignment history section to detail modal), js/leads.js (getReasignmentHistory)
  - **Acceptance Criteria**: Lead detail shows "Originator" and "Current Owner" clearly; reassignment history displays all past reassignments with from/to counselor, date, and reason; timeline includes reassignment events
  - **Dependencies**: Tasks 4.7 must be complete
  - **Requirements Met**: Requirements 27.5, 27.6, 28.5, 28.6

- [ ] 4.9 Implement reassignment filtering and export
  - **Files**: js/admin.js (add originator/fulfiller filters), js/leadUploader.js (add columns to export)
  - **Acceptance Criteria**: Admin can filter by Originator (creator) and Current Owner (fulfiller); export includes "Originator Email" and "Current Owner Email" columns; filters work independently and in combination
  - **Dependencies**: Tasks 4.2, 4.3, 4.5 must be complete
  - **Requirements Met**: Requirements 27.7, 27.8
  
  - [ ]* 4.9.1 Write property test for originator/fulfiller filtering
    - **Property 39: Originator and fulfiller filtering**
    - **Validates: Requirements 27.7**

- [ ] 4.10 Checkpoint - Verify lead reassignment works
  - Reassign a lead from one counselor to another, verify originator unchanged, view reassignment history, filter by originator/fulfiller, export with correct columns
  - Ask user if questions arise

## Phase 5: Quote Integration

These tasks connect the lead system to the existing quote system for seamless auto-creation and linking.

- [x] 5.1 Extend firestore.js with lead lookup and creation for quotes
  - **Files**: firestore.js (add getOrCreateLeadForQuote, getLeadByPhoneAndProduct)
  - **Acceptance Criteria**: getOrCreateLeadForQuote checks if lead exists (by phone + productType + userId); if yes, returns leadId; if no, creates new lead with "Connected" status and returns leadId; handles different product types separately
  - **Dependencies**: Tasks 1.2 must be complete
  - **Requirements Met**: Requirements 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7, 20.8, 20.9
  
  - [ ]* 5.1.1 Write property test for quote-generated lead auto-create
    - **Property 27: Quote-generated lead auto-create**
    - **Validates: Requirements 20.1, 20.2, 20.3, 20.4, 20.5, 20.6**

  - [ ]* 5.1.2 Write property test for quote-generated lead linking
    - **Property 28: Quote-generated lead linking**
    - **Validates: Requirements 20.8**

  - [x]* 5.1.3 Write property test for multi-product lead separation
    - **Property 29: Multi-product lead separation**
    - **Validates: Requirements 20.9**

- [ ] 5.2 Modify quote generation to auto-create/link leads
  - **Files**: calculator.html (JavaScript for quote generation), firestore.js (integrate lead creation), js/quotes.js or inline (add lead creation call)
  - **Acceptance Criteria**: When counselor generates quote with name + phone, system automatically creates/links lead; quote stores leadId; lead is pre-populated with quote data (name, phone, email); lead owner matches quote creator
  - **Dependencies**: Tasks 1.2, 5.1 must be complete
  - **Requirements Met**: Requirements 10.1, 10.2, 10.3, 10.4, 20.1-20.9

- [ ] 5.3 Add "Generate Quote" button to lead detail modal
  - **Files**: js/leadsUI.js (add button to detail modal), calculator.html (implement link handler)
  - **Acceptance Criteria**: Clicking button pre-populates quote form with lead's name, phone, email, lender; opens calculator in new tab or redirects; form is ready for currency/amount entry
  - **Dependencies**: Tasks 2.6, 5.2 must be complete
  - **Requirements Met**: Requirements 10.1, 10.4

  - [ ]* 5.3.1 Write property test for quote pre-population
    - **Property 30: Quote pre-population**
    - **Validates: Requirements 10.1**

- [x] 5.4 Display associated quotes in lead detail modal
  - **Files**: js/leadsUI.js (add quotes section to detail modal), js/leads.js (add getQuotesForLead)
  - **Acceptance Criteria**: Lead detail modal shows list of all quotes linked to this lead; each quote shows date/time; clicking quote opens it for viewing; if no quotes, shows "No quotes yet"
  - **Dependencies**: Tasks 2.6, 5.2 must be complete
  - **Requirements Met**: Requirements 9.4, 10.6, 11.2, 11.3, 11.4
  
  - [x]* 5.4.1 Write property test for quote-lead association
    - **Property 23: Quote-lead association**
    - **Validates: Requirements 10.2, 10.3, 11.1**

  - [ ]* 5.4.2 Write property test for quote-to-lead linkage
    - **Property 24: Quote-to-lead linkage**
    - **Validates: Requirements 9.4, 10.6, 11.2, 11.3, 11.4, 12.4**

- [ ] 5.5 Checkpoint - Verify quote-lead integration works
  - Generate quote from scratch (auto-creates lead), view lead, generate another quote (links to existing), see both quotes in lead detail
  - Ask user if questions arise

## Phase 6: Testing & Polish

These tasks ensure quality, performance, and deployment readiness.

- [ ] 6.1 Run all property-based tests and fix any failures
  - **Files**: All test files with @pbt annotations
  - **Acceptance Criteria**: All 36 property tests pass (100 iterations each); no counterexamples reported
  - **Dependencies**: All previous phases must be complete
  - **Requirements Met**: All properties (1-36)

- [ ] 6.2 Run all unit tests for lead CRUD, validation, Excel operations
  - **Files**: All unit test files
  - **Acceptance Criteria**: All unit tests pass (50-60 tests); coverage includes validation, CRUD, security, Excel, filtering, integration
  - **Dependencies**: All previous phases must be complete
  - **Requirements Met**: All requirements

- [ ] 6.3 Performance testing and optimization
  - **Files**: js/leads.js, js/leadsUI.js, firestore.js (optimize queries)
  - **Acceptance Criteria**: Counselor loads leads within 2 seconds; admin loads 1000 leads within 3 seconds; filter/search responds within 500ms; lead detail opens within 1 second; all per Requirements 17.1-17.5
  - **Dependencies**: All previous phases must be complete
  - **Requirements Met**: Requirements 17.1, 17.2, 17.3, 17.4, 17.5

- [ ] 6.4 Mobile responsiveness testing
  - **Files**: css/leads.css, css/responsive.css (verify mobile styles)
  - **Acceptance Criteria**: All lead views work on mobile (phones + tablets); tables display as cards on mobile; modals are full-screen; filters collapsible; no horizontal scrolling; all per Requirements 18.1-18.5
  - **Dependencies**: All previous phases must be complete
  - **Requirements Met**: Requirements 18.1, 18.2, 18.3, 18.4, 18.5

- [ ] 6.5 Manual end-to-end testing checklist
  - **Acceptance Criteria**: Complete testing checklist covering: create lead (manual), upload leads (Excel), search/filter, view detail, update status/date/remarks, delete lead, generate quote (auto-creates lead), view quote in lead detail, admin views all leads, admin filters by counselor, admin exports leads
  - **Dependencies**: All implementation phases complete
  - **Requirements Met**: All requirements (integration validation)

- [ ] 6.6 Deploy to staging environment
  - **Files**: firestore.rules (deploy), Firebase hosting (deploy), database indexes (verify active)
  - **Acceptance Criteria**: All code deployed to staging; Firestore rules and indexes active; all features accessible via staging URL; no console errors
  - **Dependencies**: All previous tasks complete
  - **Requirements Met**: Deployment readiness

- [ ] 6.7 Final verification on staging
  - **Acceptance Criteria**: All features work on staging environment; no regression issues; performance meets requirements; ready for production deployment
  - **Dependencies**: Task 6.6 must be complete
  - **Requirements Met**: Production readiness

---

## Summary

**Total Tasks:** 60+ individual tasks organized in 6 phases (updated with lead reassignment features)

**Phase Breakdown:**
- Phase 1: 5 tasks (database & core infrastructure)
- Phase 2: 11 tasks (counselor lead management)
- Phase 3: 6 tasks (Excel operations)
- Phase 4: 10 tasks (admin features + lead reassignment) - UPDATED
- Phase 5: 5 tasks (quote integration)
- Phase 6: 7 tasks (testing & polish)

**Optional Sub-Tasks:** 35+ property tests and unit tests marked with `*` can be skipped for faster MVP

**Implementation Language:** JavaScript (ES6+) using Firebase Firestore and HTML5

**Key Milestones:**
- After Phase 1: Core data layer complete and tested
- After Phase 2: Counselor can fully manage their leads
- After Phase 3: Bulk operations available
- After Phase 4: Admin has full visibility
- After Phase 5: Quote system integrated
- After Phase 6: Production-ready release
