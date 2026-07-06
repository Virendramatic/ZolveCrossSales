# Education Loan Module - Integration Guide

## How to Integrate into Existing Zolve CRM App

This guide shows how to add the Education Loan module to your existing leads application.

---

## Step 1: Update App Component

### Before (Current App.tsx)

```typescript
import { LeadsModule } from './components/leads';

export default function App() {
  return <LeadsModule />;
}
```

### After (With Education Loan Tab)

```typescript
import { useState } from 'react';
import { LeadsModule } from './components/leads';
import { EducationLoanModule } from './components/education-loan';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';

export default function App() {
  const [activeTab, setActiveTab] = useState('leads');

  return (
    <div className="min-h-screen bg-gray-50">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full rounded-none border-b bg-white">
          <TabsTrigger value="leads" className="flex-1">
            Leads
          </TabsTrigger>
          <TabsTrigger value="education-loans" className="flex-1">
            Education Loans
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="m-0">
          <LeadsModule />
        </TabsContent>

        <TabsContent value="education-loans" className="m-0">
          <EducationLoanModule initialView="list" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## Step 2: Update Lead Detail View (Add Education Loan Tab)

### Inside LeadDetailView.tsx

```typescript
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { EducationLoanModule } from '../education-loan';

interface LeadDetailViewProps {
  leadId: string;
  // ... other props
}

export const LeadDetailView: React.FC<LeadDetailViewProps> = ({
  leadId,
  // ... other props
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="products">Products</TabsTrigger>
        <TabsTrigger value="comments">Comments</TabsTrigger>
        <TabsTrigger value="education-loan">Education Loan</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        {/* Existing lead overview content */}
      </TabsContent>

      <TabsContent value="products">
        {/* Existing products content */}
      </TabsContent>

      <TabsContent value="comments">
        {/* Existing comments content */}
      </TabsContent>

      <TabsContent value="education-loan" className="mt-4">
        <EducationLoanModule 
          leadId={leadId}
          initialView="list"
        />
      </TabsContent>
    </Tabs>
  );
};
```

---

## Step 3: Add "Create Education Loan" Button to Lead Detail

### Option A: Quick Create from Lead Detail Header

```typescript
// Inside LeadDetailView.tsx
import { Button } from '../ui/button';
import { EducationLoanModule } from '../education-loan';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

export const LeadDetailView: React.FC<LeadDetailViewProps> = ({ leadId }) => {
  const [showCreateLoan, setShowCreateLoan] = useState(false);

  return (
    <div className="space-y-4">
      {/* Lead Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{lead.name}</h1>
        <Button 
          onClick={() => setShowCreateLoan(true)}
          className="ml-auto"
        >
          + Create Education Loan
        </Button>
      </div>

      {/* Tabs content as above */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* ... */}
      </Tabs>

      {/* Create Loan Dialog */}
      <Dialog open={showCreateLoan} onOpenChange={setShowCreateLoan}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Education Loan for {lead.name}</DialogTitle>
          </DialogHeader>
          <LoanCreationForm
            leadId={leadId}
            onSuccess={() => setShowCreateLoan(false)}
            onCancel={() => setShowCreateLoan(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
```

---

## Step 4: Add Quick Stats to Dashboard

### Add Education Loan Stats to Main Dashboard

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { apiClient } from '../services/api';

export const Dashboard: React.FC = () => {
  const [loanStats, setLoanStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const response = await apiClient.getLoanStats();
      setLoanStats(response.data);
    };
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Existing stats */}

      {/* Education Loan Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Total Loans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {loanStats?.totalLoans || 0}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">In Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {(loanStats?.byStage?.DOCS_PENDING || 0) + 
             (loanStats?.byStage?.CALL_SCHEDULED || 0)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Sanctioned</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {loanStats?.byStage?.SANCTIONED || 0}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Disbursed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {loanStats?.byStage?.DISBURSED || 0}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

---

## Step 5: Connect to Existing Navigation

### Update Sidebar/Navigation

```typescript
// In your navigation/sidebar component
import { EducationLoanModule } from '../education-loan';

export const Sidebar: React.FC = () => {
  const [activeSection, setActiveSection] = useState('leads');

  return (
    <div>
      <nav className="space-y-2">
        <Button
          variant={activeSection === 'leads' ? 'default' : 'ghost'}
          onClick={() => setActiveSection('leads')}
          className="w-full justify-start"
        >
          📋 Leads
        </Button>
        <Button
          variant={activeSection === 'education-loans' ? 'default' : 'ghost'}
          onClick={() => setActiveSection('education-loans')}
          className="w-full justify-start"
        >
          🎓 Education Loans
        </Button>
      </nav>

      <main className="mt-4">
        {activeSection === 'leads' && <LeadsModule />}
        {activeSection === 'education-loans' && <EducationLoanModule initialView="list" />}
      </main>
    </div>
  );
};
```

---

## Step 6: Update LeadsContext to Include Education Loans

### Optional: Link Leads and Education Loans in Context

```typescript
// In LeadsContext.tsx
import { useEducationLoan } from '../education-loan';

export const LeadsModule: React.FC = () => {
  const { selectedLead } = useLeads();
  const { selectLoan } = useEducationLoan();

  // When selecting a lead, check if it has an education loan
  useEffect(() => {
    if (selectedLead?.id) {
      // Could automatically load associated education loan
      // getEducationLoanByLeadId(selectedLead.id)
    }
  }, [selectedLead?.id]);

  return (
    // ... existing code
  );
};
```

---

## Step 7: Update API Client (Already Done)

The API client in `Frontend/src/app/services/api.ts` already includes all education loan methods:

```typescript
// Already available:
apiClient.createLoan(leadId, data)
apiClient.getLoan(loanId)
apiClient.getLoans(params)
apiClient.updateLoan(loanId, data)
apiClient.updateLoanStage(loanId, newStage)
apiClient.addLender(loanId, data)
apiClient.updateLenderStatus(loanId, lenderId, data)
apiClient.requestDocuments(loanId, data)
apiClient.approveDocument(loanId, docRequestId, documentId)
// ... and more
```

---

## Step 8: Add Navigation Links

### Update Main Navigation Header

```typescript
import { EducationLoanModule } from '../education-loan';
import { Button } from '../ui/button';

export const Header: React.FC = () => {
  const [showEducationLoans, setShowEducationLoans] = useState(false);

  return (
    <header className="bg-white border-b">
      <div className="flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold">Zolve CRM</h1>
        
        <nav className="flex gap-4">
          <Button variant="ghost" size="sm">
            Leads
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowEducationLoans(!showEducationLoans)}
          >
            Education Loans
          </Button>
          <Button variant="ghost" size="sm">
            Reports
          </Button>
        </nav>
      </div>

      {showEducationLoans && (
        <EducationLoanModule initialView="list" />
      )}
    </header>
  );
};
```

---

## Complete Example: Full Integration

### Updated App.tsx

```typescript
import { useState } from 'react';
import { LeadsModule } from './components/leads';
import { EducationLoanModule } from './components/education-loan';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card } from './components/ui/card';

type AppView = 'leads' | 'education-loans' | 'dashboard';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-blue-600">🎓 Zolve CRM</h1>
            <nav className="flex gap-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-4 py-2 rounded ${
                  currentView === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('leads')}
                className={`px-4 py-2 rounded ${
                  currentView === 'leads'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Leads
              </button>
              <button
                onClick={() => setCurrentView('education-loans')}
                className={`px-4 py-2 rounded ${
                  currentView === 'education-loans'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Education Loans
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'leads' && <LeadsModule />}
        {currentView === 'education-loans' && <EducationLoanModule initialView="list" />}
      </main>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-gray-600">Total Loans</p>
          <p className="text-3xl font-bold">42</p>
        </Card>
        <Card className="p-4">
          <p className="text-gray-600">In Progress</p>
          <p className="text-3xl font-bold">18</p>
        </Card>
        <Card className="p-4">
          <p className="text-gray-600">Sanctioned</p>
          <p className="text-3xl font-bold">15</p>
        </Card>
        <Card className="p-4">
          <p className="text-gray-600">Disbursed</p>
          <p className="text-3xl font-bold">9</p>
        </Card>
      </div>
    </div>
  );
}
```

---

## Testing the Integration

### 1. Check Backend is Running

```bash
cd backend
npm run dev
# Should see: Server running on http://localhost:3000
```

### 2. Check Frontend Compiles

```bash
cd Frontend
npm run dev
# Should see: VITE v6.3.5 ready in XX ms
```

### 3. Test Navigation

- Open http://localhost:5173 (or your frontend port)
- Click "Education Loans" tab
- You should see the loan list view
- Click "New Loan" to create a test loan

### 4. Test API Endpoint Directly

```bash
# Create a loan
curl -X POST http://localhost:3000/api/loans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "leadId": "LEAD_ID",
    "university": "MIT",
    "course": "MS Computer Science",
    "totalLoanAmount": 5000000,
    "collateralType": "NON_COLLATERAL"
  }'

# List loans
curl http://localhost:3000/api/loans \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Troubleshooting Integration Issues

### Issue: "Module not found" errors

**Solution**: Ensure imports are correct:
```typescript
// ✅ Correct
import { EducationLoanModule } from './components/education-loan';

// ❌ Wrong
import EducationLoanModule from './components/education-loan';  // No default export
```

### Issue: API calls returning 401 Unauthorized

**Solution**: Ensure auth token is being sent:
```typescript
// In api.ts
setToken(localStorage.getItem('auth_token'));

// Or manually set after login
apiClient.setToken(jwtToken);
```

### Issue: Styles not applying correctly

**Solution**: Ensure Tailwind CSS is configured:
```bash
cd Frontend
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Issue: Types not recognized in components

**Solution**: Ensure TypeScript is configured:
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "jsx": "react-jsx",
    "esModuleInterop": true
  }
}
```

---

## Performance Considerations

1. **Lazy Load Education Loans**: Only render when tab is active
   ```typescript
   {currentView === 'education-loans' && <EducationLoanModule />}
   ```

2. **Filter on Backend**: Don't load all loans, use filters
   ```typescript
   getLoans({ stage: 'STARTED', limit: 50 })
   ```

3. **Pagination**: Use cursor-based pagination for large lists

4. **Memoize Context**: Wrap provider at high level to prevent re-renders
   ```typescript
   const MemoizedEducationLoanProvider = React.memo(EducationLoanProvider);
   ```

---

## What's Next?

1. ✅ **Module Integrated**: Education Loan module is now available as a tab/section
2. 📊 **Add Analytics**: Dashboard showing loan metrics
3. 🔔 **Add Notifications**: Email alerts on stage transitions
4. 🤖 **Lender Matching**: Auto-recommend lenders based on scoring
5. 📱 **Mobile Support**: Make responsive for mobile devices

---

## Support

If you encounter any issues:

1. Check the **EDUCATION_LOAN_QUICK_START.md** for common workflows
2. Review **EDUCATION_LOAN_IMPLEMENTATION.md** for architecture details
3. Check backend logs: `npm run dev` in backend folder
4. Check frontend console: Browser DevTools → Console
5. Check database: `npx prisma studio`

---

Done! The Education Loan module is now fully integrated into your Zolve CRM application. 🎉

