# Zolve CRM - Leads Module Implementation (Phase 2-4)

## Overview

This document describes the production-grade implementation of the Leads module for the Zolve CRM platform, covering both backend API and frontend UI components.

## Project Status

✅ **Phase 1**: Project Setup & Foundation - COMPLETE
✅ **Phase 2**: Core Lead Management API - COMPLETE  
✅ **Phase 3**: Comments & Interaction History - COMPLETE
✅ **Phase 4**: Product Instances & Multi-Product Framework - COMPLETE

## Backend Implementation

### Technology Stack
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with refresh token rotation
- **Validation**: Zod schemas
- **Testing**: Jest + Supertest for integration tests

### API Endpoints

#### Lead CRUD Operations
```
POST   /api/leads                    - Create new lead
GET    /api/leads                    - List leads (paginated, filterable)
GET    /api/leads/:id                - Get single lead
PUT    /api/leads/:id                - Update lead
DELETE /api/leads/:id                - Soft delete lead
```

#### Call Status & Reschedule
```
PUT    /api/leads/:id/call-status    - Update call status
PUT    /api/leads/:id/reschedule     - Set reschedule date
```

#### Bulk Operations
```
POST   /api/leads/bulk-import        - Bulk import from CSV
POST   /api/leads/bulk-assign        - Bulk assign to counselor
GET    /api/leads/stats              - Get statistics
```

#### Comments
```
POST   /api/leads/:id/comments       - Create comment
GET    /api/leads/:id/comments       - List comments (paginated)
PUT    /api/comments/:id             - Edit comment
DELETE /api/comments/:id             - Delete comment
GET    /api/comments/search          - Search comments
```

#### Products
```
POST   /api/leads/:id/products       - Create product instance
GET    /api/leads/:id/products       - List products for lead
PUT    /api/leads/:id/products/:productId/status - Update product status
DELETE /api/products/:productId      - Delete product

GET    /api/leads/view/:productType  - Get leads by product type
```

### Key Features

#### 1. Authentication & RBAC
- JWT-based authentication with token refresh
- Role-based access control (ADMIN, COUNSELOR)
- COUNSELOR can only access their assigned leads
- ADMIN can access all resources
- Permission validation on every endpoint

#### 2. Soft Deletion
- All deletes use soft-delete (archive) pattern
- `archivedAt` timestamp tracking
- Data preserved for audit trail
- Related records (comments, products) also archived

#### 3. Cursor-Based Pagination
- 50 items per page default
- Cursor-based navigation (scalable for large datasets)
- `nextCursor` and `hasMore` returned
- Prevents offset/limit issues with concurrent updates

#### 4. Audit Logging
- All actions logged in AuditLog table
- Tracks: entity type, action, user, changes, timestamp
- Supports sensitive data access logging

#### 5. Error Handling
- Standardized error response format
- Proper HTTP status codes
- Validation errors with field details
- Request ID for tracing

### Data Models

#### Lead (Master Entity)
```typescript
{
  id: string;                    // Unique identifier
  leadCode: string;              // ZL-XXXX format
  name: string;
  phone: string;
  email?: string;
  country?: string;
  intake?: string;
  globalCallStatus: CallStatus;  // NOT_CALLED | RESPONDING | NOT_RESPONDING | CONVERTED
  rescheduleDate?: Date;
  currentOwnerId?: string;       // Assigned counselor
  createdByUserId: string;       // Immutable
  leadSource?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
}
```

#### Call Statuses
- **NOT_CALLED**: Initial state, no contact attempt
- **RESPONDING**: Lead responds positively to calls
- **NOT_RESPONDING**: Lead not reachable after multiple attempts
- **CONVERTED**: Lead has completed purchase/signup

### Service Layer Architecture

All business logic encapsulated in service classes:

- **LeadService**: Lead CRUD, status management, reschedule
- **CommentService**: Comment CRUD, search functionality
- **ProductService**: Product instance management
- **BulkService**: CSV import, bulk assignments
- **AuthService**: JWT token generation, validation
- **AuditService**: Logging and audit trail

### Testing

#### Unit Tests
- 15+ test cases for LeadService
- Mock Prisma client
- Permission-based access control verified
- CRUD operations validated

#### Integration Tests
Created in `backend/src/__tests__/lead.integration.test.ts`:
- End-to-end API testing with supertest
- Authentication flow validation
- Permission-based filtering
- Error handling

Run tests:
```bash
npm test lead.service.test.ts          # Unit tests
npm test lead.integration.test.ts      # Integration tests
npm run test:integration               # All integration tests
```

## Frontend Implementation

### Technology Stack
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
- **State Management**: React Context API
- **HTTP Client**: Fetch API (native)
- **Styling**: Tailwind CSS

### Component Architecture

```
LeadsModule (Main Container)
├── LeadsProvider (Context)
│   ├── LeadsListView
│   │   ├── Filters (Status, Country, Search)
│   │   ├── Leads Table
│   │   └── Pagination
│   ├── LeadDetailView (Drawer)
│   │   ├── Call Status Manager
│   │   ├── Reschedule Date Picker
│   │   ├── Lead Information Editor
│   │   ├── Products Section
│   │   └── Comments Section
│   └── LeadCreationForm (Modal)
│       └── Form Fields
```

### Key Features

#### 1. State Management (LeadsContext)
- Centralized lead state
- Loading and error states
- Pagination support (nextCursor, hasMore)
- CRUD operations with immediate UI updates

#### 2. Leads List View
- Table with sortable columns:
  - Name, Phone, Email, Location, Call Status, Intake
- Real-time filtering:
  - Search by name or phone
  - Filter by call status
  - Filter by country
- Pagination with load more button
- Click row to open detail view

#### 3. Lead Detail View
- Slide-out drawer panel (responsive)
- Edit lead information inline
- Call status selector with validation
- Reschedule date picker (future dates only)
- Product instances section
- Comments section (read-only in this phase)
- Metadata display (created, updated, source)
- Soft delete with confirmation dialog

#### 4. Lead Creation Form
- Modal dialog
- Form validation:
  - Name required
  - Phone required
  - Email format validation
- Error display
- Loading state during submission
- Auto-close on success
- Form reset after creation

#### 5. API Client (services/api.ts)
- Centralized HTTP communication
- Automatic JWT token handling
- Standard error handling
- Type-safe responses
- All endpoints:
  - Leads CRUD
  - Comments CRUD
  - Bulk operations
  - Products management

### Component Files

#### Services
- `Frontend/src/app/services/api.ts` - API client with all endpoints

#### Components
- `Frontend/src/app/components/leads/LeadsModule.tsx` - Main container
- `Frontend/src/app/components/leads/LeadsContext.tsx` - State management
- `Frontend/src/app/components/leads/LeadsListView.tsx` - List and filters
- `Frontend/src/app/components/leads/LeadDetailView.tsx` - Detail panel
- `Frontend/src/app/components/leads/LeadCreationForm.tsx` - Creation dialog
- `Frontend/src/app/components/ui/dialog.tsx` - Dialog component

#### Exports
- `Frontend/src/app/components/leads/index.ts` - Barrel export

### Integration with App

To integrate LeadsModule into the main App.tsx:

```typescript
import { LeadsModule } from './components/leads';

function App() {
  const [currentTab, setCurrentTab] = useState<Tab>('leads');

  return (
    <div>
      {/* Tabs */}
      <div className="tabs">
        <button onClick={() => setCurrentTab('leads')}>Leads</button>
        {/* Other tabs */}
      </div>

      {/* Content */}
      {currentTab === 'leads' && <LeadsModule />}
      {/* Other tab content */}
    </div>
  );
}
```

### Environment Configuration

Frontend expects backend URL in environment:
```
VITE_API_URL=http://localhost:3000/api
```

Defaults to `http://localhost:3000/api` if not set.

## Database Schema

### Core Tables

#### leads
- Primary table for all CRM leads
- Soft delete with `archivedAt`
- Indexes on: callStatus, currentOwnerId, createdByUserId, archivedAt

#### comments
- Linked to leads via leadId
- Soft delete support
- Author tracking with name/role caching

#### product_instances
- Links leads to products
- Tracks product-specific status
- Owner assignment (counselor)

#### users
- Counselor/Admin accounts
- Role-based access control
- Last login tracking

#### audit_logs
- Immutable audit trail
- Tracks all entity changes
- User action attribution

### Foreign Keys & Indexes
- All foreign keys indexed
- Composite indexes on frequently queried combinations
- Query performance verified

## Error Handling

### Backend

Standard error response format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {"field": "error message"},
    "requestId": "unique-request-id",
    "timestamp": "2024-06-25T10:30:00Z"
  }
}
```

Common error codes:
- `UNAUTHORIZED` (401) - Missing/invalid JWT
- `FORBIDDEN` (403) - Insufficient permissions
- `VALIDATION_ERROR` (400) - Invalid input
- `NOT_FOUND` (404) - Resource not found
- `CONFLICT` (409) - Duplicate/constraint violation
- `INTERNAL_ERROR` (500) - Server error

### Frontend

Error handling in all components:
- API errors caught and displayed
- Auto-dismiss after 5 seconds
- Specific error messages from server
- User-friendly error UI

## Security Considerations

### Authentication
- JWT tokens with 15-minute expiry
- Refresh tokens (7-day expiry) in httpOnly cookies
- Token rotation on refresh

### Authorization
- RBAC enforced on all endpoints
- COUNSELOR scoped to own leads
- ADMIN unrestricted access
- Permission checks logged

### Input Validation
- All inputs validated with Zod schemas
- Type checking in TypeScript
- Frontend validation for UX
- Backend validation for security

### Data Protection
- Passwords hashed with bcrypt (12 rounds)
- Soft delete pattern for data retention
- Audit trail for compliance
- No PII in logs

## Performance Optimizations

### Backend
- Cursor-based pagination (scalable)
- Database indexes on all query columns
- Redis caching (5-min TTL)
- Prisma connection pooling
- Lazy-load relationships

### Frontend
- Context API for state (minimal re-renders)
- Lazy component loading
- Debounced search
- Image optimization (Lucide React icons)
- Responsive design

## Deployment

### Backend
```bash
# Build
npm run build

# Start
npm start

# Environment variables required
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
NODE_ENV=production
```

### Frontend
```bash
# Build
npm run build

# Serve (via Firebase/S3)
firebase deploy
```

## Future Enhancements

### Phase 5+
- [ ] Education Loan Applications CRUD
- [ ] Lender Matching Engine
- [ ] Document Management
- [ ] Real-time notifications
- [ ] Advanced reporting
- [ ] Email integrations
- [ ] SMS reminders
- [ ] Analytics dashboard

### Possible Improvements
- [ ] GraphQL API alternative
- [ ] WebSocket for real-time updates
- [ ] Advanced search with Elasticsearch
- [ ] Bulk export to Excel/CSV
- [ ] Custom field support
- [ ] Workflow automation
- [ ] Multi-language support
- [ ] Mobile app (React Native)

## Documentation

### API Documentation
- REST endpoints fully documented
- Response format standardized
- Error codes comprehensive
- Examples provided

### Code Documentation
- JSDoc comments on all public methods
- Type definitions comprehensive
- Service layer well-documented
- Component props documented

### Database Documentation
- Schema well-organized
- Relationships clear
- Indexes documented
- Migrations tracked

## Development Workflow

### Prerequisites
```bash
# Backend
Node.js 18+
PostgreSQL 13+
Redis (for sessions)

# Frontend
Node.js 18+
```

### Local Setup
```bash
# Backend
cd backend
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev

# Frontend (new terminal)
cd Frontend
npm install
npm run dev
```

### Running Tests
```bash
# Backend
npm test                          # All tests
npm test lead.service.test        # Unit tests
npm run test:integration          # Integration tests

# Frontend
npm run test                       # React Testing Library (when configured)
```

## Compliance & Standards

- ✅ RBAC with proper permission checking
- ✅ Audit logging for all operations
- ✅ Soft delete for data retention
- ✅ Input validation on all endpoints
- ✅ Error handling with proper status codes
- ✅ JWT authentication with refresh
- ✅ Type-safe frontend with TypeScript
- ✅ Component prop documentation
- ✅ API response standardization
- ✅ Cursor-based pagination

## Support & Contact

For issues or questions about the Leads module:
1. Check API logs for errors
2. Review database state
3. Check browser console for frontend errors
4. Refer to test files for usage examples

---

**Last Updated**: June 25, 2024
**Version**: 1.0.0
**Status**: Production Ready
