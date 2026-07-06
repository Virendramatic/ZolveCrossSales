# Multiuser Quote System - Requirements

## Overview
Transform the single-user quote calculator into a multiuser system with user authentication, quote persistence, user quote management, and admin portal.

## User Stories

### 1. Authentication & User Management
- **As a** new user, **I want to** sign up with email/password or Google account, **so that** I can access the quote calculator
- **As a** returning user, **I want to** log in with email/password or Google, **so that** I can access my quotes
- **As a** user, **I want to** log out, **so that** my session ends securely
- **As an** admin, **I want to** access `/admin` portal with admin-only view, **so that** I can manage the system

### 2. Quote Generation & Storage
- **As a** user, **I want to** generate a quote using the calculator, **so that** I can see the transfer details
- **As a** user, **I want the** quote to auto-save when I click "Generate Quote", **so that** I don't lose my data
- **As a** user, **I want** all quote details stored (fees, GST, rates, timestamps), **so that** I can view complete information later

### 3. Quote Management (User Dashboard)
- **As a** user, **I want to** see an "All Quotes" tab showing my saved quotes, **so that** I can view my history
- **As a** user, **I want to** see for each quote: Customer Name, Quote Date, Foreign Amount, INR Amount, **so that** I can quickly identify quotes
- **As a** user, **I want to** click a quote to view full details (all fee breakdowns), **so that** I can review the complete information
- **As a** user, **I want to** edit a saved quote, **so that** I can update the information
- **As a** user, **I want to** delete a saved quote, **so that** I can remove unwanted quotes
- **As a** user, **I want to** download any saved quote as PDF, **so that** I have a copy for records

### 4. Admin Portal
- **As an** admin, **I want to** access `/admin` and see all users' quotes, **so that** I can monitor the system
- **As an** admin, **I want to** search/filter quotes by user, date, or amount, **so that** I can find specific quotes
- **As an** admin, **I want to** view complete quote details for any quote, **so that** I can verify accuracy
- **As an** admin, **I want to** add new admins by email, **so that** I can delegate admin tasks
- **As an** admin, **I want to** remove admin privileges from a user, **so that** I can revoke access
- **As an** admin, **I want to** delete any user account and their quotes, **so that** I can manage users
- **As an** admin, **I want to** see analytics: total quotes generated, date range, amounts, **so that** I can understand system usage

### 5. Data & Security
- **As a** system, **I want to** store all quotes in Firestore with user ID linking, **so that** data is persistent and organized
- **As a** system, **I want to** implement Firestore security rules, **so that** users can only access their own data
- **As a** system, **I want to** enforce admin role verification, **so that** only admins access admin features

## Technical Requirements

### Authentication
- Email/Password authentication via Firebase Auth
- Google OAuth option alongside email/password
- Admin role detection based on Firestore user document
- Automatic redirect to login if not authenticated

### Database Schema
- **Users Collection**:
  - `uid`: User ID (from Firebase Auth)
  - `email`: User email
  - `name`: User display name
  - `role`: "user" or "admin"
  - `createdAt`: Timestamp

- **Quotes Collection**:
  - `userId`: Reference to user
  - `customerName`: String
  - `customerPhone`: String
  - `currency`: String (USD, EUR, etc.)
  - `exchangeRate`: Number
  - `forexFee`: Number (paisa)
  - `foreignAmount`: Number
  - `baseAmount`: Number (INR)
  - `forexFeeAmount`: Number (INR)
  - `swiftFee`: Number (INR)
  - `gst`: Number (INR)
  - `totalCharges`: Number (INR)
  - `totalINR`: Number (INR)
  - `recipientAmount`: Number (foreign)
  - `createdAt`: Timestamp
  - `updatedAt`: Timestamp

### Firestore Security Rules
- Users can read/write only their own quotes
- Admins can read all quotes
- Only admins can modify admin status
- Admin portal accessible only to admin role users

### UI Components
- Login page (email/password + Google)
- Main calculator (existing)
- "All Quotes" tab with table/list view
- Quote detail modal
- Edit quote form
- Admin portal with user/quote management
- Admin analytics dashboard

## Acceptance Criteria

1. ✅ Users can sign up and log in with email/password
2. ✅ Users can log in with Google account
3. ✅ Quotes auto-save to Firestore on "Generate Quote" click
4. ✅ Users see "All Quotes" tab with their quotes only
5. ✅ Users can edit and delete their quotes
6. ✅ Quotes show: Customer Name, Date, Foreign Amount, INR Amount
7. ✅ Admin can access `/admin` portal
8. ✅ Admin sees all user quotes
9. ✅ Admin can add/remove other admins
10. ✅ Admin can delete users
11. ✅ Firestore security rules prevent unauthorized access
12. ✅ PDF download works for any quote
