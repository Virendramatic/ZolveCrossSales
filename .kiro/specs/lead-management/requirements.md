# Requirements Document: Lead Management Feature

## Introduction

The Lead Management Feature enables counselors in the Zolve Quote System to systematically track, manage, and follow up with student leads for remittance services. Counselors can create leads manually or via Excel upload, track call statuses, manage reschedule dates, and generate quotes pre-populated with lead data. Admins have visibility into all leads across the organization with advanced filtering and search capabilities.

## Glossary

- **Lead**: A potential student customer represented by their contact information, university details, course information, and fee amount
- **Counselor**: A user with "user" role who manages leads and generates quotes
- **Admin**: A user with "admin" role who has visibility into all leads and system-wide reporting
- **Lead Status**: The current state of a lead's engagement (Not Called, Not Responding, Converted, Rescheduled, DND)
- **Remarks**: Free-form text notes added by counselors to record interaction details and follow-up information
- **Reschedule Date**: A future date when the counselor plans to follow up with a lead
- **Lead Detail View**: A modal or frame displaying complete lead information, remarks history, and associated quotes
- **Quote**: A pre-populated remittance quote generated from a lead's information
- **Excel Template**: A structured spreadsheet for bulk lead upload with defined columns for all lead data
- **DND**: Do Not Disturb - a lead status indicating the student requested not to be contacted
- **Originator**: The counselor who initially created or first owned the lead
- **Fulfiller**: The current owner/counselor responsible for the lead (can change via reassignment)
- **Lead Reassignment**: Transfer of lead ownership from one counselor to another (e.g., Loan agent to Remittance agent)

## Requirements

### Requirement 1: Lead Data Model

**User Story:** As a counselor, I want to maintain comprehensive student lead information, so that I can track and manage opportunities effectively across multiple products.

#### Acceptance Criteria

1. THE Lead_Data_Model SHALL store the following fields: student name, phone, email, university, course, total fee, lender name, product type, call status, reschedule date, and remarks
2. THE Product_Type field SHALL indicate which Zolve product this lead is for (e.g., Remittance, Loan, Accommodation, etc.)
3. THE Product_Type field SHALL default to "Remittance" when not specified, but support other product types for future expansion
4. THE Lead_Data_Model SHALL support five call status values: Not Called, Not Responding, Converted, Rescheduled, DND
5. THE Lender_Name field SHALL be a dropdown selection from a predefined list of lenders (managed by admin)
6. WHEN a lead is created, THE System SHALL record the creation timestamp and the counselor's user ID as the lead owner
7. THE Lead_Data_Model SHALL store remarks as free-form text with support for multiple entries per lead
8. THE Lead_Data_Model SHALL validate that only student name and phone are mandatory; all other fields (email, university, course, total fee, lender name, product type) MAY be empty or use defaults
9. THE Remarks_System SHALL maintain a complete history of all remarks with creation timestamp and the counselor who added each remark

**Correctness Properties:**
- Invariant: Each lead must have exactly one owner (counselor who created it)
- Invariant: Lead status must always be one of the five defined values
- Invariant: Student name and phone must never be empty; other fields may be null/empty
- Invariant: Each lead must have a product type (defaults to "Remittance" if not specified)
- Round-trip: A lead created with specific data SHALL retain all provided data unchanged when retrieved

### Requirement 2: Manual Lead Entry

**User Story:** As a counselor, I want to manually add individual leads through a form, so that I can quickly capture student information for new prospects across different products.

#### Acceptance Criteria

1. WHEN a counselor accesses the lead creation form, THE System SHALL present input fields for all lead data fields
2. THE Lead_Creation_Form SHALL include a Product_Type field (dropdown) defaulting to "Remittance"
3. THE Lead_Creation_Form SHALL validate that student name is not empty before accepting submission
4. THE Lead_Creation_Form SHALL validate that phone number is not empty and is in valid format before accepting submission
5. THE Lead_Creation_Form SHALL validate that if email is provided, it must be in valid format
6. THE Lender_Name field SHALL be a dropdown menu with predefined lender options
7. WHEN a counselor submits a valid lead form (with student name and phone), THE System SHALL save the lead and display a success confirmation
8. IF student name or phone is empty, THEN THE System SHALL prevent form submission and highlight the missing required field
9. WHEN a lead is successfully created, THE System SHALL set the initial call status to "Not Called"
10. WHEN a lead is successfully created, THE System SHALL set the lead owner to the currently logged-in counselor
11. WHEN a lead is successfully created, THE System SHALL set the product type to the selected value (or default to "Remittance")

**Correctness Properties:**
- Example: A lead with student name "Rahul Singh", phone "9876543210", product type "Remittance", and no other fields can be successfully created
- Example: A lead with student name "Priya Sharma", phone "9123456789", product type "Loan", email "[email]@example.com", university "IIT Delhi", course "B.Tech", total fee 500000, lender name "SBI" can be successfully created
- Edge case: Phone numbers with various formats (with/without country code) should be accepted or rejected consistently
- Edge case: Email validation must reject invalid formats and accept all valid RFC 5322 formats if provided

### Requirement 3: Lead Upload via Excel Template

**User Story:** As a counselor, I want to upload multiple leads from an Excel file, so that I can quickly add leads in bulk from existing records across different products.

#### Acceptance Criteria

1. WHEN a counselor requests the Excel template, THE System SHALL provide a downloadable template file with columns for all lead data fields
2. THE Lead_Uploader SHALL accept .xlsx and .csv file formats
3. WHEN a counselor uploads a file, THE System SHALL validate that required columns (student name and phone) are present before processing
4. THE Excel_Template SHALL include a Product_Type column that defaults to "Remittance" if not specified in the upload
5. WHEN a counselor uploads a file with invalid data, THE System SHALL return a detailed error report indicating which rows have errors and why
6. WHEN a counselor uploads a valid file, THE System SHALL create all leads in the file and display the count of successfully added leads
7. WHEN leads are uploaded, THE System SHALL set the lead owner to the uploading counselor for all imported leads
8. WHEN leads are uploaded, THE System SHALL set the initial call status to "Not Called" for all imported leads
9. THE Excel_Template_Downloader SHALL provide a template with sample data demonstrating the expected format
10. THE Excel_Template SHALL clearly indicate which columns are mandatory (student name, phone) and which are optional

**Correctness Properties:**
- Round-trip: An exported list of leads (formatted as Excel) uploaded back SHALL result in leads with identical data values
- Invariant: After a successful upload of N leads, exactly N new leads must exist in the database owned by the uploading counselor
- Example: A CSV with 10 valid leads (name and phone populated) uploads successfully and creates 10 new leads in the system
- Example: A CSV with 3 valid leads and 2 invalid leads (missing name or phone) reports 3 successful and 2 failed rows
- Edge case: A CSV with name/phone populated but other fields empty should successfully create leads with empty optional fields
- Edge case: A CSV without a Product_Type column should default all leads to "Remittance"

### Requirement 4: Counselor Lead View

**User Story:** As a counselor, I want to see my leads in a dedicated interface, so that I can manage my specific prospects and follow-ups across different products.

#### Acceptance Criteria

1. THE Counselor_Lead_View SHALL be accessible from the calculator.html interface via a "Leads" tab
2. THE Counselor_Lead_View SHALL display only leads owned by the currently logged-in counselor
3. WHILE a counselor is viewing their leads, THE System SHALL display each lead with: student name, phone, email, product type, call status, and reschedule date
4. THE Counselor_Lead_View SHALL provide search functionality by student name
5. THE Counselor_Lead_View SHALL provide filtering by call status
6. THE Counselor_Lead_View SHALL provide filtering by lender
7. THE Counselor_Lead_View SHALL provide filtering by product type
8. WHEN a counselor clicks on a lead, THE System SHALL open the lead detail view modal with complete information
9. THE Counselor_Lead_View SHALL display leads in a table format with sorting by student name and date created

**Correctness Properties:**
- Invariant: A counselor SHALL only see leads where the lead owner matches their user ID
- Example: Counselor A sees exactly 5 leads they created; Counselor B's leads do not appear in Counselor A's view
- Edge case: If a counselor has no leads, the view SHALL display "No leads found" message
- Example: Counselor filters by product type "Loan" and sees only loan leads

### Requirement 5: Admin Lead View

**User Story:** As an admin, I want to view all leads across all counselors, so that I can monitor system activity and generate reports across different products.

#### Acceptance Criteria

1. THE Admin_Lead_View SHALL be accessible from admin.html as a dedicated "Leads" tab
2. THE Admin_Lead_View SHALL display all leads from all counselors in the system
3. WHILE an admin is viewing leads, THE System SHALL display: counselor email, student name, phone, email, product type, call status, lender, and reschedule date
4. THE Admin_Lead_View SHALL provide search functionality by student name
5. THE Admin_Lead_View SHALL provide filtering by call status
6. THE Admin_Lead_View SHALL provide filtering by lender
7. THE Admin_Lead_View SHALL provide filtering by counselor/user email
8. THE Admin_Lead_View SHALL provide filtering by product type
9. THE Admin_Lead_View SHALL provide date range filtering (from date and to date)
10. WHEN an admin clicks on a lead, THE System SHALL open the lead detail view modal with complete information
11. THE Admin_Lead_View SHALL display leads in a table format with column for counselor email and product type

**Correctness Properties:**
- Invariant: An admin SHALL see all leads in the system regardless of ownership
- Invariant: A non-admin user SHALL NOT access the admin leads view
- Example: Admin views 150 total leads from 5 different counselors across multiple products
- Example: Admin filters by product type "Loan" and sees only loan leads from all counselors

### Requirement 6: Lead Status Management

**User Story:** As a counselor, I want to update a lead's call status, so that I can track the progress of my follow-up activities.

#### Acceptance Criteria

1. WHEN a counselor views a lead detail, THE System SHALL display the current call status with an option to change it
2. THE Call_Status_Selector SHALL present exactly five options: Not Called, Not Responding, Converted, Rescheduled, DND
3. WHEN a counselor selects a new call status, THE System SHALL immediately update the lead and display a success confirmation
4. WHEN a call status is updated, THE System SHALL record the timestamp of the status change
5. THE System SHALL only allow counselors to update their own leads' call status; ADMINS SHALL be able to update any lead's call status
6. WHEN a counselor views a lead detail, THE System SHALL display the current remittance status with an option to change it
7. THE Remittance_Status_Selector SHALL present predefined remittance status options (to be configured by admin)
8. WHEN a counselor selects a new remittance status, THE System SHALL immediately update the lead and display a success confirmation
9. THE System SHALL only allow admins to update remittance status for any lead

**Correctness Properties:**
- Invariant: After status update, querying the lead SHALL return the new status value
- Example: A lead with call status "Not Called" is updated to "Rescheduled" and persists with the new status
- Example: A lead's remittance status can be updated by admin only
- Edge case: Rapid consecutive status updates should all be applied correctly without data loss

### Requirement 7: Reschedule Date Management

**User Story:** As a counselor, I want to set a reschedule date for follow-up, so that I know when to contact the lead again.

#### Acceptance Criteria

1. WHEN a counselor views a lead detail, THE System SHALL display the current reschedule date with an option to update it
2. THE Reschedule_Date_Picker SHALL accept dates in the future only
3. IF a counselor attempts to set a reschedule date in the past, THEN THE System SHALL reject the input and display an error message
4. WHEN a counselor sets or updates a reschedule date, THE System SHALL immediately save the change and display a success confirmation
5. WHEN a reschedule date is updated, THE System SHALL record the timestamp of the update
6. THE System SHALL only allow counselors to update their own leads' reschedule dates; ADMINS SHALL be able to update any lead's reschedule date
7. THE Reschedule_Date_Picker SHALL default to no date if none is currently set

**Correctness Properties:**
- Invariant: A reschedule date must always be in the future or null
- Example: Setting a reschedule date to "2025-03-15" for a lead currently dated "2025-03-10" succeeds
- Example: Attempting to set a reschedule date to "2025-03-05" when current date is "2025-03-10" fails
- Edge case: Leap year dates should be handled correctly

### Requirement 8: Remarks Management

**User Story:** As a counselor, I want to add and view remarks for leads, so that I can maintain a record of interactions and follow-up notes.

#### Acceptance Criteria

1. WHEN a counselor views a lead detail, THE System SHALL display the complete remarks history in chronological order
2. WHEN a counselor adds a remark, THE System SHALL accept free-form text input
3. WHEN a counselor adds a remark, THE System SHALL record the timestamp and counselor who created it
4. THE Remarks_History SHALL display each remark with: text, creation timestamp, and the counselor's name who added it
5. WHEN a new remark is added, THE System SHALL append it to the history without modifying existing remarks
6. THE System SHALL only allow counselors to add remarks to their own leads; ADMINS SHALL be able to add remarks to any lead
7. THE System SHALL display remarks in reverse chronological order (newest first) in the UI

**Correctness Properties:**
- Invariant: The number of remarks SHALL never decrease; only new remarks can be added
- Invariant: Existing remarks SHALL never be modified or deleted
- Round-trip: A remark added with specific text and timestamp SHALL appear in the remarks history with unchanged text
- Example: A counselor adds 3 remarks to a lead; all 3 remarks persist in the history with their original timestamps

### Requirement 9: Lead Detail View

**User Story:** As a counselor, I want to view comprehensive lead information and history, so that I can make informed follow-up decisions.

#### Acceptance Criteria

1. WHEN a counselor clicks on a lead from the leads table, THE System SHALL open a modal or frame displaying complete lead information
2. THE Lead_Detail_View SHALL display all lead fields: student name, phone, email, university, course, total fee, lender name, call status, reschedule date, and all remarks
3. THE Lead_Detail_View SHALL display a complete remarks history with timestamps and counselor names
4. THE Lead_Detail_View SHALL provide a section showing all quotes generated from this lead with quote creation dates
5. WHEN a counselor clicks on a quote in the lead detail, THE System SHALL open that quote for viewing or editing
6. THE Lead_Detail_View SHALL provide inline editing for call status, reschedule date, and remarks
7. THE Lead_Detail_View SHALL display an inline form for adding new remarks
8. WHEN the lead detail view is open, THE System SHALL show a button to generate a new quote pre-populated with this lead's data

**Correctness Properties:**
- Invariant: All lead information displayed in detail view SHALL match the current database state
- Example: Opening a lead detail view shows a student name matching the lead table entry
- Edge case: A lead with 50+ remarks should display all remarks without performance degradation

### Requirement 10: Quote Generation from Lead

**User Story:** As a counselor, I want to generate a quote pre-populated with a lead's data, so that I can quickly create quotes without re-entering information.

#### Acceptance Criteria

1. WHEN a counselor clicks "Generate Quote" from a lead detail, THE System SHALL pre-populate the quote form with: student name, phone, email, and lender name from the lead
2. WHEN a quote is generated from a lead, THE System SHALL create an association linking the quote to the source lead
3. WHEN a quote is saved that was generated from a lead, THE System SHALL record the lead ID in the quote document
4. WHEN a counselor generates a quote from a lead, THE Quote_Generator SHALL present the calculator form pre-populated and ready for the counselor to enter currency and amount information
5. THE System SHALL only allow counselors to generate quotes from their own leads; ADMINS SHALL be able to generate quotes from any lead
6. WHEN a counselor is viewing a lead detail, THE System SHALL display a list of all quotes previously generated from this lead

**Correctness Properties:**
- Invariant: A quote generated from a lead SHALL be owned by the same counselor who owns the lead
- Round-trip: Pre-populated data from lead to quote form SHALL match the source lead data
- Example: Generating a quote from a lead with name "Priya Sharma" results in the quote form showing "Priya Sharma" in the name field
- Edge case: A lead can generate multiple quotes; all quotes should link back to the same lead

### Requirement 11: Lead-Quote Association

**User Story:** As a counselor, I want to see which quotes were generated from each lead, so that I can track my quote history per customer.

#### Acceptance Criteria

1. WHEN a quote is generated from a lead, THE System SHALL store the source lead's ID in the quote record
2. WHEN a counselor views a lead detail, THE System SHALL display a list of all quotes generated from that lead
3. WHEN an admin views a lead detail, THE System SHALL display a list of all quotes generated from that lead
4. WHEN a lead is deleted, THE System SHALL retain the quotes but remove or null the lead reference
5. WHEN a counselor clicks on a quote from the lead detail's quote list, THE System SHALL open that quote for viewing

**Correctness Properties:**
- Invariant: A quote can be associated with at most one lead
- Invariant: Deleting a lead SHALL NOT delete associated quotes
- Example: If 3 quotes were generated from a lead, the lead detail shows all 3 quotes

### Requirement 12: Lead Deletion

**User Story:** As a counselor, I want to delete leads, so that I can remove duplicates or incorrect entries.

#### Acceptance Criteria

1. WHEN a counselor views a lead detail, THE System SHALL provide a delete button
2. WHEN a counselor clicks delete, THE System SHALL display a confirmation dialog with clear language about the action
3. WHEN a counselor confirms deletion, THE System SHALL delete the lead from the database
4. WHEN a lead is deleted, THE System SHALL NOT delete associated quotes
5. WHEN a counselor confirms deletion, THE System SHALL display a success message
6. WHEN a lead is deleted, THE System SHALL remove it from the leads view
7. THE System SHALL only allow counselors to delete their own leads; ADMINS SHALL be able to delete any lead

**Correctness Properties:**
- Invariant: After deletion, querying for the lead SHALL return no result
- Invariant: Quotes associated with a deleted lead SHALL persist in the database
- Example: Deleting a lead removes it from the counselor's leads view
- Edge case: Attempting to view a deleted lead's details should show an error or redirect

### Requirement 13: Lead Security

**User Story:** As the system, I want to ensure only authorized users can access their leads, so that student data remains confidential and secure.

#### Acceptance Criteria

1. WHEN a counselor attempts to view a lead, THE System SHALL verify the lead's owner matches the current user
2. IF a counselor attempts to access another counselor's lead, THEN THE System SHALL deny access and return an error
3. WHEN an admin attempts to view a lead, THE System SHALL allow access regardless of ownership
4. WHEN a counselor attempts to modify a lead (status, reschedule date, remarks), THE System SHALL verify ownership before allowing the change
5. IF a counselor attempts to modify another counselor's lead, THEN THE System SHALL deny the modification and return an error
6. WHEN an admin attempts to modify any lead, THE System SHALL allow the modification
7. THE System SHALL enforce lead ownership at the database level through Firestore security rules

**Correctness Properties:**
- Invariant: A counselor SHALL only modify leads they own
- Invariant: An admin SHALL be able to modify any lead
- Example: Counselor A cannot change status on Counselor B's lead
- Example: Admin can change status on any lead

### Requirement 14: Excel Template Format and Download

**User Story:** As a counselor, I want to download a pre-formatted Excel template, so that I know exactly how to format my lead data for upload.

#### Acceptance Criteria

1. WHEN a counselor clicks "Download Template" in the lead upload interface, THE System SHALL provide a downloadable .xlsx file
2. THE Excel_Template SHALL contain a header row with column names for all lead fields
3. THE Excel_Template SHALL include one example data row demonstrating the expected format
4. THE Excel_Template SHALL include instructions or notes about required vs. optional fields
5. THE Excel_Template column names SHALL match exactly the field names used in the database
6. WHEN the template is downloaded, THE System SHALL ensure it contains no actual lead data (only sample/example data)

**Correctness Properties:**
- Round-trip: Data formatted according to the template and uploaded SHALL be accepted by the uploader
- Example: A template with columns [Name, Phone, Email, University, Course, Total Fee, Lender] uploaded with data in matching columns succeeds
- Invariant: The template structure SHALL remain consistent across multiple downloads

### Requirement 15: Lead Upload Error Handling

**User Story:** As a counselor, I want to understand why my lead upload failed, so that I can correct the data and retry.

#### Acceptance Criteria

1. WHEN a counselor uploads a file with missing required columns, THE System SHALL return an error indicating which columns are missing
2. WHEN a counselor uploads a file with invalid phone format in a row, THE System SHALL report the row number and the validation error
3. WHEN a counselor uploads a file with invalid email format in a row, THE System SHALL report the row number and the validation error
4. WHEN a counselor uploads a file with some valid and some invalid rows, THE System SHALL skip invalid rows and create leads for valid rows
5. WHEN a counselor uploads a file, THE System SHALL provide a summary report with counts of successful and failed rows
6. FOR failed rows, THE System SHALL display specific error messages indicating what needs to be corrected
7. THE System SHALL suggest corrections (e.g., "Row 5: Invalid phone format, expected 10 digits or with country code")

**Correctness Properties:**
- Example: File with 3 valid rows and 2 rows with invalid phone numbers uploads successfully with 3 leads created and 2 errors reported
- Edge case: File with all invalid rows should report 0 successful leads and N error messages
- Edge case: File with valid data but extra columns should still process successfully

### Requirement 16: Lead Filtering and Search

**User Story:** As a counselor and admin, I want to quickly find specific leads, so that I can efficiently manage my follow-ups and reports.

#### Acceptance Criteria

1. WHEN a user searches by student name, THE System SHALL return leads containing the search term (case-insensitive partial match)
2. WHEN a user filters by call status, THE System SHALL return only leads with the selected status
3. WHEN a user filters by lender, THE System SHALL return only leads with the selected lender
4. WHEN a user applies multiple filters simultaneously, THE System SHALL return leads matching all applied filter criteria
5. WHEN an admin filters by counselor email, THE System SHALL return only leads owned by the selected counselor
6. WHEN an admin applies a date range filter, THE System SHALL return leads created within the specified date range (inclusive)
7. WHEN a user clears all filters, THE System SHALL display all leads accessible to that user
8. THE System SHALL apply filters and search in real-time or near-real-time (< 1 second response time)

**Correctness Properties:**
- Example: Searching for "Rahul" returns leads with names containing "Rahul" but not "Rajesh"
- Example: Filtering by status "Converted" returns only leads with that exact status
- Metamorphic: Filtering by status A then status B in sequence should produce a subset or empty result, never a superset
- Example: Applying filters [Status=Converted, Lender=ICICI] should return fewer results than Status=Converted alone
- Edge case: Searching for special characters should either escape them or display a helpful message

### Requirement 17: Lead View Performance

**User Story:** As a user, I want the lead views to load and update quickly, so that I can work efficiently without frustrating delays.

#### Acceptance Criteria

1. WHEN a counselor loads their leads view, THE System SHALL display the leads list within 2 seconds on a standard internet connection
2. WHEN an admin loads the all-leads view, THE System SHALL display leads within 3 seconds even with 1000+ leads in the system
3. WHEN a user applies a filter or search, THE System SHALL update results within 500ms
4. WHEN a user scrolls through a large leads table, THE System SHALL maintain smooth performance (no lag or freezing)
5. WHEN a user opens a lead detail view, THE System SHALL load and display all information within 1 second

**Correctness Properties:**
- Example: With 500 leads in the system, filtering by status returns results in < 500ms
- Invariant: Performance SHALL not degrade linearly with lead count; pagination or virtualization should be employed

### Requirement 18: Lead View Responsiveness

**User Story:** As a mobile user, I want to view and manage leads on my phone, so that I can stay productive while away from my desk.

#### Acceptance Criteria

1. THE Lead_Views SHALL be responsive and functional on mobile devices (phones and tablets)
2. WHEN a user views leads on a mobile device, THE System SHALL display leads in a mobile-optimized format (stacked cards or single-column table)
3. WHEN a user clicks on a lead on mobile, THE System SHALL open the lead detail view in a full-screen or overlay format
4. WHEN a user applies filters on mobile, THE System SHALL display a collapsible filter panel to conserve screen space
5. THE Lead_Detail_View SHALL be scrollable and readable on mobile screens without horizontal scrolling for primary content

**Correctness Properties:**
- Example: A mobile user can view, search, filter, and update leads without errors or layout issues
- Invariant: Mobile view SHALL show all critical information (name, status, reschedule date) without truncation

### Requirement 19: Admin Lead Export

**User Story:** As an admin, I want to export all leads to an Excel file, so that I can generate reports and perform external analysis.

#### Acceptance Criteria

1. WHEN an admin is viewing the leads tab in admin.html, THE System SHALL provide an "Export to Excel" button
2. WHEN an admin clicks "Export to Excel", THE System SHALL generate and download a .xlsx file containing all visible leads
3. THE Exported_File SHALL include all lead fields: student name, phone, email, university, course, total fee, lender name, call status, reschedule date, counselor email, and creation date
4. WHEN an admin has active filters applied, THE System SHALL export only the filtered results
5. THE Exported_File SHALL include a header row with clear column names
6. THE Exported_File SHALL be formatted for easy reading and further processing in Excel or other tools
7. WHEN the export completes, THE System SHALL display a success message with the export timestamp

**Correctness Properties:**
- Example: An admin exports 50 leads and receives a .xlsx file with 50 data rows plus headers
- Example: An admin filters by status "Converted" and exports; the exported file contains only "Converted" leads
- Invariant: Exported data SHALL match the current database state at time of export
- Round-trip: Data exported from the system should be re-uploadable as leads (with same values preserved)

### Requirement 19: Product-Based Navigation System

**User Story:** As a counselor, I want to easily switch between different product modules (Remittance, Loan, Accommodation, etc.), so that I can access product-specific features and manage cross-product opportunities.

#### Acceptance Criteria

1. WHEN a counselor opens calculator.html, THE System SHALL display a navigation bar with product buttons (Remittance, Loan, etc.) next to the profile button
2. THE Product_Navigation_Bar SHALL display buttons for each enabled product type in the system
3. WHEN a counselor clicks a product button, THE System SHALL switch the main content area to show the selected product's interface
4. THE Currently_Selected_Product SHALL be visually highlighted in the navigation bar
5. THE Navigation_System SHALL support dynamic addition of new product buttons without code changes (configuration-driven)
6. WHEN a new product is added to the system configuration, THE Navigation_Bar SHALL automatically display the new product button
7. THE Navigation_System SHALL maintain the same structure for both calculator.html and admin.html
8. EACH product button SHALL link to that product's specific interface (e.g., Remittance leads tab, Loan leads tab, Accommodation leads tab)
9. THE System SHALL remember the user's last selected product and restore it on next visit

**Correctness Properties:**
- Invariant: Only enabled products from system configuration appear as buttons
- Example: A counselor sees buttons for "Remittance", "Loan", "Leads" in navigation bar
- Example: Adding "Accommodation" to product configuration automatically shows "Accommodation" button without code changes
- Edge case: If only one product is enabled, navigation still displays (no special handling)
- Round-trip: User selects Loan, navigates away, returns; system remembers Loan was selected

### Requirement 21: Tentative Commitment Tracking

**User Story:** As a counselor, I want to record when a lead agrees to transfer on a future date with a tentative amount, so that I can track commitments and set follow-up reminders for execution.

#### Acceptance Criteria

1. WHEN a counselor updates a lead's status to "Converted", THE System SHALL allow entering a tentative commitment date and tentative transfer amount
2. THE Tentative_Commitment_Date field SHALL store a future date when the customer plans to execute the transfer
3. WHEN entering tentative amount, COUNSELOR SHALL select a currency (USD, EUR, GBP, etc.) and enter amount in that currency
4. THE System SHALL automatically convert the amount to INR using these fixed rates: USD=95, EUR=110, GBP=125
5. THE Tentative_Amount_Commitment SHALL store: currency (e.g., USD), original amount (e.g., 100000), and calculated INR equivalent
6. WHEN a lead has a tentative commitment, THE System SHALL display the currency, original amount, and INR equivalent in the lead detail view
7. WHEN a lead has a tentative commitment date, THE System SHALL create a notification/reminder (to be shown on dashboard)
8. THE Tentative_Commitment data SHALL be visible to the lead owner (counselor) and admins
9. WHEN a tentative date passes without execution, THE System SHALL flag the lead as requiring follow-up

**Correctness Properties:**
- Invariant: Tentative commitment date must be in the future
- Invariant: Tentative amount must have valid currency and positive value
- Example: A lead with status "Converted" can have tentative date "2025-07-15", currency "USD", amount "100000", INR = 95,00,000
- Example: A lead with status "Converted", currency "EUR", amount "500000", INR = 5,50,00,000
- Example: A lead with status "Converted", currency "GBP", amount "1000000", INR = 12,50,00,000
- Edge case: If tentative date is today, it's still valid (not yet past)
- Round-trip: Storing and retrieving tentative commitment preserves currency, original amount, and INR equivalent

### Requirement 22: Daily Call Schedule & Notifications

**User Story:** As a counselor, I want to see which leads need to be called on a specific date, so that I can manage my daily call schedule efficiently.

#### Acceptance Criteria

1. WHEN a counselor views the Leads tab, THE System SHALL display a "Today's Calls" section showing leads with tentative commitment date = today or reschedule date = today
2. THE Today's_Calls section SHALL display: lead name, phone, tentative amount, and notes
3. WHEN a counselor filters leads by date, THE System SHALL return leads with reschedule date matching that date
4. THE Date_Filter_Range SHALL allow selecting a specific date or date range
5. WHEN a counselor navigates to the app, THE System SHALL show a notification badge if there are calls scheduled for today
6. THE Notification_Count SHALL display the number of leads to be called today
7. WHEN a counselor clicks the notification, THE System SHALL navigate to Today's Calls section

**Correctness Properties:**
- Example: On 2025-03-10, counselor sees 3 leads with reschedule date = 2025-03-10
- Example: Filtering by date range 2025-03-10 to 2025-03-15 shows all leads with dates in that range (inclusive)
- Invariant: Today's Calls should include both reschedule dates and tentative commitment dates
- Edge case: If today has no scheduled calls, show "No calls scheduled for today" message

### Requirement 23: Lead Pipeline & Activity Timeline

**User Story:** As a counselor or admin, I want to see the complete activity history and pipeline stage for each lead, so that I can understand the lead's journey and next steps.

#### Acceptance Criteria

1. WHEN viewing a lead detail, THE System SHALL display a timeline of all activities (creation, status changes, remarks, tentative commitments, quotes)
2. EACH Timeline_Entry SHALL show: timestamp, activity type, who made the change, and what changed
3. WHEN a lead status changes to "Converted" with tentative commitment, THE Timeline SHALL record the tentative date and amount
4. WHEN a lead is moved to "Rescheduled", THE Timeline SHALL record the new reschedule date
5. THE Timeline SHALL be sortable (newest first/oldest first) and searchable by activity type
6. WHEN hovering over a timeline entry, THE System SHALL show detailed information about that activity

**Correctness Properties:**
- Invariant: Timeline entries are immutable (cannot be edited or deleted)
- Example: Timeline shows: Creation → Quote Generated → Status Changed to "Rescheduled" → Tentative Commitment Set
- Round-trip: All changes made to a lead must appear in timeline (none should be missing)

### Requirement 24: Tentative Commitment Portal Notification

**User Story:** As a counselor, I want to receive a notification when a lead's tentative commitment date approaches, so that I can prepare for the transfer execution.

#### Acceptance Criteria

1. WHEN a lead has a tentative commitment date set, THE System SHALL create a notification rule for that date
2. ON the tentative commitment date, THE Portal_Notification SHALL appear when the counselor logs in
3. THE Notification_Message SHALL display: lead name, phone, tentative amount, and suggest next action
4. THE Notification SHALL include a "Call Lead" button linking directly to the lead detail
5. THE Notification SHALL include a "Mark as Done" button to acknowledge it
6. IF a counselor marks notification as done, THE System SHALL record this and not show duplicate notifications
7. THE Admin SHALL see aggregated view of all pending notifications across counselors

**Correctness Properties:**
- Example: On 2025-03-20 (the tentative date), notification appears for lead "Rahul Singh" with ₹50,000 tentative amount
- Invariant: Notification appears only once per lead per date (no duplicates)
- Edge case: If multiple leads have same tentative date, show all in notification list

### Requirement 25: Commitment Execution Tracking

**User Story:** As a counselor or admin, I want to track whether tentative commitments are executed or need follow-up, so that I can measure conversion and identify bottlenecks.

#### Acceptance Criteria

1. WHEN a tentative commitment is executed (quote or transfer created), THE System SHALL mark it as "Executed"
2. WHEN a tentative commitment date passes without execution, THE Lead_Status SHALL show "Needs Follow-up"
3. THE Lead_Detail_View SHALL display commitment status: Pending, Executed, or Needs Follow-up
4. WHEN a counselor executes a commitment, THE System SHALL record the execution date and actual amount
5. IF actual amount differs from tentative amount, THE System SHALL flag this for review
6. WHEN filtering leads, COUNSELOR and ADMIN SHALL see option to filter by commitment status (Pending, Executed, Needs Follow-up)

**Correctness Properties:**
- Example: A lead with tentative date 2025-03-15 and amount ₹50,000, if quote created on 2025-03-15, marks as "Executed"
- Example: A lead with tentative date 2025-03-15 and no activity after that date shows "Needs Follow-up" on 2025-03-16
- Invariant: A lead cannot have both "Executed" and "Needs Follow-up" status for same commitment
- Edge case: Multiple tentative commitments per lead should track independently

**User Story:** As a counselor, I want leads to be automatically created when I generate a quote, so that quote activity is tracked as lead activity across the product ecosystem.

#### Acceptance Criteria

1. WHEN a counselor generates a new quote (with customer name and phone), THE System SHALL automatically create a corresponding lead if one doesn't already exist for this customer and product type
2. WHEN a lead is auto-created from a quote, THE System SHALL set the initial call status to "Connected" (indicating the customer was reached via quote generation)
3. WHEN a lead is auto-created from a quote, THE System SHALL link the quote to this lead (store lead ID in quote document)
4. WHEN a lead is auto-created from a quote, THE System SHALL pre-populate the lead with available quote data: customer name, phone, and optionally email if provided in quote
5. WHEN a lead is auto-created from a quote, THE System SHALL set the product type to "Remittance" (the current quote product)
6. WHEN a lead is auto-created from a quote, THE System SHALL set the lead owner to the counselor who generated the quote
7. WHEN a lead is auto-created from a quote, THE System SHALL set the remittance status to a default value (to be configured by admin)
8. WHEN a quote is generated and a lead already exists for that customer and product (by phone + product match), THE System SHALL link the quote to the existing lead without creating a duplicate
9. THE System MAY create multiple leads for the same phone number if they are for different products (e.g., one lead for Remittance, another for Loan)

**Correctness Properties:**
- Example: A counselor generates a Remittance quote for customer "Rahul Singh" with phone "9876543210"; if no Remittance lead exists for this phone, a new lead is created with status "Connected"
- Example: A counselor generates a second Remittance quote for the same phone number; it links to the existing Remittance lead without creating a duplicate
- Example: A counselor first generates a Remittance quote for phone "9876543210", then generates a Loan quote for the same phone; two separate leads are created (one for Remittance, one for Loan)
- Invariant: Every quote generated SHALL have an associated lead (either existing or newly created)
- Invariant: A quote-generated lead SHALL be owned by the same counselor who generated the quote
- Invariant: A quote is linked to only one lead



### Requirement 26: Pipeline Analytics & Forecasting

**User Story:** As a counselor or admin, I want to see the pipeline value by month and product, so that I can track my progress and forecast revenue.

#### Acceptance Criteria

1. WHEN a counselor views the Leads tab, THE System SHALL display a "My Pipeline" card showing:
   - Total pipeline value for their leads (sum of all tentative amounts converted to INR using rates: USD=95, EUR=110, GBP=125)
   - Pipeline value by month (showing expected revenue in INR by tentative commitment date)
   - Pipeline value by product type (Remittance, Loan, Accommodation, etc.)
   - Pipeline value by status (Pending, Executed, Needs Follow-up)
   - Multi-currency breakdown (e.g., USD 100k = ₹95 Lakh, EUR 500k = ₹55 Crore, GBP 1M = ₹125 Crore, Total = ₹141.15 Crore)

2. WHEN an admin views the Leads tab, THE System SHALL display a "Total Pipeline" card showing:
   - Total pipeline value across all counselors (aggregated in INR)
   - Pipeline value by month (all counselors combined in INR)
   - Pipeline value by product type (all counselors combined in INR)
   - Pipeline value by counselor (see individual counselor pipelines in INR)
   - Multi-currency breakdown (all currencies shown with INR equivalent)

3. EXAMPLE: July shows USD 100k (₹95L) + EUR 500k (₹55Cr) + GBP 1M (₹125Cr) = ₹141.15 Crore in pipeline

4. THE Pipeline_View SHALL allow filtering by:
   - Date range (show pipeline for specific months/quarters/years)
   - Product type (Remittance only, Loan only, etc.)
   - Currency (show pipeline in specific currencies)
   - Lender (see pipeline per lender) [Admin only]
   - Counselor (see individual counselor pipeline) [Admin only]

5. WHEN viewing pipeline data, THE System SHALL also display:
   - Conversion rate (Executed / Total)
   - Average deal size (in INR and by currency)
   - Leads needing follow-up (past due tentative dates)
   - Trend (pipeline growth/decline month-over-month in INR)

6. THE Pipeline_Analytics SHALL be exportable to Excel with detailed breakdown by:
   - Lead (with currency, original amount, and INR equivalent)
   - Month (showing both original currencies and INR total)
   - Product type
   - Counselor [Admin export includes, Counselor export shows only their leads]

7. CONVERSION RATES: USD multiplied by 95, EUR multiplied by 110, GBP multiplied by 125 to get INR equivalent

**Correctness Properties:**
- Example: Counselor sees July pipeline: USD 100k (₹95L) + EUR 500k (₹55Cr) + GBP 1M (₹125Cr) = ₹141.15Cr
- Example: Admin sees all counselors' July pipeline: same currencies and amounts aggregated, totaled in INR
- Invariant: Pipeline sum only includes leads with "Converted" status and valid tentative amounts
- Invariant: INR equivalent is calculated using fixed rates (USD=95, EUR=110, GBP=125)
- Edge case: If no leads have tentative dates in a month, show ₹0 for that month
- Round-trip: Exporting and re-importing pipeline data should preserve all currency values and allow recalculation
- Calculation: 100k USD = 100000 × 95 = 95,00,000 INR; 500k EUR = 500000 × 110 = 55,00,00,000 INR; 1M GBP = 1000000 × 125 = 125,00,00,000 INR

### Requirement 27: Lead Reassignment & Originator Tracking

**User Story:** As an admin or senior counselor, I want to reassign leads from one counselor to another (e.g., from Loan agent to Remittance agent), so that I can optimize lead distribution and track the originator-fulfiller relationship across product teams.

#### Acceptance Criteria

1. WHEN an admin or authorized user views a lead detail, THE System SHALL provide a "Reassign Lead" button
2. WHEN a lead is reassigned, THE System SHALL transfer ownership from the current counselor to a new counselor
3. WHEN a lead is reassigned, THE System SHALL record: the original lead creator (originator), current owner (fulfiller), reassignment date, and the admin who performed the reassignment
4. WHEN a lead is reassigned, THE System SHALL create a remark/activity entry in the lead's timeline showing who reassigned it and to whom
5. WHEN viewing a lead detail, THE System SHALL display: Originator (initial creator), Current Owner/Fulfiller, and all reassignment history
6. THE Lead_Detail_View SHALL show a "Reassignment History" section listing all past reassignments with: from counselor, to counselor, reassignment date, and reason (optional)
7. WHEN an admin filters leads, THE System SHALL provide filters for: originator/creator and current owner/fulfiller
8. WHEN exporting leads, THE System SHALL include columns for: Originator Email, Current Owner Email, and Latest Reassignment Date
9. WHEN a lead is reassigned, THE System SHALL preserve all existing remarks, quotes, and activity history without modification
10. THE System SHALL only allow admins (or delegated power users) to reassign leads; regular counselors cannot reassign leads

**Correctness Properties:**
- Invariant: A lead must have an originator (the initial creator) that never changes
- Invariant: A lead's current owner (fulfiller) can change multiple times via reassignment
- Example: Loan agent creates lead "Rahul Singh"; later admin reassigns to Remittance agent; lead shows: Originator = Loan agent, Fulfiller = Remittance agent
- Example: A lead reassigned 3 times shows all 3 reassignments in history: Original → Agent A → Agent B → Agent C
- Invariant: Reassignment SHALL NOT delete or modify any existing lead data, remarks, or quotes
- Round-trip: Exporting and filtering by originator/fulfiller should return consistent sets across operations
- Edge case: A lead created by Counselor A, reassigned to B, then back to A, shows all three states in history

### Requirement 28: Lead Data Model Extensions (Originator & Fulfiller Tracking)

**User Story:** As the system, I want to track lead origination and reassignment, so that business metrics can be calculated for both lead creators and current handlers.

#### Acceptance Criteria

1. THE Lead_Data_Model SHALL store an originatorUserId field that records the counselor who initially created the lead
2. THE Lead_Data_Model SHALL store a fulfillerUserId (or current userId) field that records the current lead owner
3. WHEN a lead is first created, THE System SHALL set originatorUserId = fulfillerUserId = current user
4. WHEN a lead is reassigned, THE System SHALL update fulfillerUserId to the new counselor while keeping originatorUserId unchanged
5. THE Lead_Data_Model SHALL store a reassignmentHistory sub-collection or array with entries for each reassignment containing:
   - fromCounselorId, toCounselorId, reassignmentDate, reassignedByAdminId, reason (optional)
6. WHEN a lead is viewed, both originator and fulfiller information SHALL be displayed with counselor names and emails

**Correctness Properties:**
- Invariant: originatorUserId SHALL never change after initial creation
- Invariant: fulfillerUserId can change only via explicit reassignment operation
- Example: originatorUserId = "user123" (Loan agent), fulfillerUserId = "user456" (Remittance agent after reassignment)
- Round-trip: Retrieving a reassigned lead shows unchanged originatorUserId and updated fulfillerUserId
