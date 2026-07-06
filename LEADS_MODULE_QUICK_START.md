# Leads Module - Quick Start Guide

## 5-Minute Setup

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations
npm run db:seed          # Seed sample data

# Start development server
npm run dev              # Runs on http://localhost:3000
```

### Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Start development server
npm run dev              # Runs on http://localhost:5173
```

### Environment Configuration

**Backend** (.env):
```
DATABASE_URL=postgresql://user:password@localhost:5432/zolve_crm
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
```

**Frontend** (.env.local):
```
VITE_API_URL=http://localhost:3000/api
```

## API Usage Examples

### Authentication
```bash
# Login (from auth.routes.ts)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"counselor@test.com","password":"password"}'

# Returns:
{
  "token": "eyJhbGc...",
  "user": { "id": "...", "name": "...", "role": "COUNSELOR" }
}
```

### Create Lead
```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Priya Sharma",
    "phone": "+91 9876543210",
    "email": "priya@example.com",
    "country": "India",
    "intake": "Fall 2026",
    "notes": "Interested in education loan"
  }'
```

### List Leads (with Filters)
```bash
# All leads
curl http://localhost:3000/api/leads \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filtered by call status
curl "http://localhost:3000/api/leads?callStatus=RESPONDING" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filtered by country and intake
curl "http://localhost:3000/api/leads?country=India&intake=Fall%202026" \
  -H "Authorization: Bearer YOUR_TOKEN"

# With pagination
curl "http://localhost:3000/api/leads?limit=10&cursor=last_lead_id" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Single Lead
```bash
curl http://localhost:3000/api/leads/LEAD_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Lead
```bash
curl -X PUT http://localhost:3000/api/leads/LEAD_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Priya Sharma Updated",
    "notes": "Updated notes"
  }'
```

### Update Call Status
```bash
curl -X PUT http://localhost:3000/api/leads/LEAD_ID/call-status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "globalCallStatus": "RESPONDING"
  }'

# Valid statuses:
# - NOT_CALLED
# - RESPONDING
# - NOT_RESPONDING
# - CONVERTED
```

### Set Reschedule Date
```bash
curl -X PUT http://localhost:3000/api/leads/LEAD_ID/reschedule \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rescheduleDate": "2024-07-01T15:00:00Z"
  }'
```

### Delete Lead (Soft Delete)
```bash
curl -X DELETE http://localhost:3000/api/leads/LEAD_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Add Comment
```bash
curl -X POST http://localhost:3000/api/leads/LEAD_ID/comments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Excellent lead, high intent",
    "isInternal": false
  }'
```

### List Comments
```bash
curl "http://localhost:3000/api/leads/LEAD_ID/comments?limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Bulk Import Leads (Admin Only)
```bash
# CSV file format:
# name,phone,email,country,intake,notes
# Priya,+91 9876543210,priya@test.com,India,Fall 2026,Test lead
# Rahul,+91 9876543211,rahul@test.com,India,Spring 2027,Another test

curl -X POST http://localhost:3000/api/leads/bulk-import \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "file=@leads.csv"
```

### Bulk Assign Leads (Admin Only)
```bash
curl -X POST http://localhost:3000/api/leads/bulk-assign \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "leadIds": ["lead1", "lead2", "lead3"],
    "targetCounselorId": "counselor123"
  }'
```

## Frontend Component Usage

### In React Component
```typescript
import { LeadsModule } from '@/components/leads';

export function CRMDashboard() {
  return (
    <div className="flex h-screen">
      <LeadsModule />
    </div>
  );
}
```

### Using LeadsContext Directly
```typescript
import { useLeads } from '@/components/leads';

export function CustomComponent() {
  const { 
    leads, 
    loading, 
    error,
    createLead,
    updateCallStatus 
  } = useLeads();

  return (
    <div>
      {leads.map(lead => (
        <div key={lead.id}>
          <h3>{lead.name}</h3>
          <button onClick={() => updateCallStatus(lead.id, 'RESPONDING')}>
            Mark as Responding
          </button>
        </div>
      ))}
    </div>
  );
}
```

## Testing

### Run All Tests
```bash
cd backend
npm test
```

### Run Specific Test Suite
```bash
npm test lead.service.test.ts
npm test lead.integration.test.ts
```

### Test Coverage
```bash
npm test -- --coverage
```

## Database Queries

### View All Leads
```sql
SELECT * FROM leads WHERE archived_at IS NULL;
```

### View Leads by Call Status
```sql
SELECT * FROM leads 
WHERE global_call_status = 'RESPONDING' AND archived_at IS NULL;
```

### View Comments for a Lead
```sql
SELECT * FROM comments 
WHERE lead_id = 'LEAD_ID' AND deleted_at IS NULL 
ORDER BY created_at DESC;
```

### View Audit Log
```sql
SELECT * FROM audit_logs 
WHERE entity_id = 'LEAD_ID' 
ORDER BY timestamp DESC;
```

## Debugging

### Backend Logs
- Structured logging with Winston/Pino
- Check `src/middleware/requestLogger.ts` for request logging
- All errors logged with stack traces

### Frontend Errors
- Open browser DevTools (F12)
- Check Console tab for API errors
- Network tab shows all API requests
- LeadsContext error state displayed in UI

### Database Issues
```bash
# Check PostgreSQL connection
psql -c "SELECT version();"

# Verify migrations
npm run db:migrate status

# Reset database (CAUTION)
npm run db:migrate reset
```

## Performance Tips

### Backend
- Enable Redis caching (reduces DB queries)
- Use indexes on frequently filtered columns
- Implement request rate limiting
- Monitor query performance

### Frontend
- Use React DevTools Profiler
- Check Network tab for slow requests
- Debounce search filters
- Lazy load detail view

## Common Issues & Fixes

### Issue: "Invalid JWT Token"
```
Solution: Check JWT_SECRET matches between auth and verification
         Verify token hasn't expired (15 min expiry)
         Clear localStorage and re-login
```

### Issue: "403 Forbidden - Cannot access other user's leads"
```
Solution: This is expected! Counselors can only see their own leads
         Use ADMIN account to see all leads
         Ask admin to assign leads to your account
```

### Issue: "Database connection failed"
```
Solution: Verify DATABASE_URL in .env
         Check PostgreSQL is running: psql -U postgres
         Check database exists: psql -l
```

### Issue: "CORS error on frontend"
```
Solution: Verify VITE_API_URL matches backend URL
         Check FRONTEND_URL in backend .env
         Ensure backend CORS middleware is configured
```

## Next Steps

1. **Create some leads** through the UI or API
2. **Update call statuses** to test status management
3. **Add comments** to leads to track interactions
4. **Run tests** to verify everything works
5. **Explore the database** to see data structure
6. **Check audit logs** to track changes

## Useful Resources

- API Documentation: See design.md
- Database Schema: prisma/schema.prisma
- Code Examples: backend/src/services/__tests__/
- Component Props: Frontend/src/app/components/leads/

## Support

For detailed API documentation, see `LEADS_MODULE_IMPLEMENTATION.md`

For database schema details, see `.kiro/specs/zolve-crm-lead-first/design.md`
