import React, { useState } from 'react';
import { EducationLoanProvider } from './EducationLoanContext';
import { EducationLoanListView } from './EducationLoanListView';
import { LoanCreationForm } from './LoanCreationForm';
import { LoanDetailView } from './LoanDetailView';
import { LenderManagementForm } from './LenderManagementForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '../ui/dialog';
import { Button } from '../ui/button';

interface EducationLoanModuleProps {
  leadId?: string;
  initialView?: 'list' | 'create';
}

type DialogState = 'none' | 'createLoan' | 'manageLender' | 'requestDocuments';

const EducationLoanModuleContent: React.FC<EducationLoanModuleProps> = ({
  leadId,
  initialView = 'list',
}) => {
  const [currentView, setCurrentView] = useState(initialView);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState<DialogState>('none');

  const handleSelectLoan = (loanId: string) => {
    setSelectedLoanId(loanId);
    setCurrentView('detail');
  };

  const handleCreateSuccess = () => {
    setCurrentView('list');
    setDialogState('none');
  };

  const handleDialogSuccess = () => {
    setDialogState('none');
  };

  return (
    <div className="space-y-6 p-6">
      {currentView === 'list' && (
        <EducationLoanListView
          onSelectLoan={handleSelectLoan}
          onCreateLoan={() => (leadId ? setDialogState('createLoan') : setCurrentView('create'))}
          filters={{}}
        />
      )}

      {currentView === 'create' && !leadId && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Button onClick={() => setCurrentView('list')} variant="outline" className="w-full">
              ← Back to List
            </Button>
          </div>
          <div className="md:col-span-2">
            <LoanCreationForm
              leadId="new"
              onSuccess={handleCreateSuccess}
              onCancel={() => setCurrentView('list')}
            />
          </div>
        </div>
      )}

      {currentView === 'detail' && selectedLoanId && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div>
            <Button
              onClick={() => setCurrentView('list')}
              variant="outline"
              className="w-full mb-4"
            >
              ← Back to List
            </Button>
          </div>
          <div className="lg:col-span-3">
            <LoanDetailView
              onLenderAdded={() => setDialogState('manageLender')}
              onDocumentsRequested={() => setDialogState('requestDocuments')}
            />
          </div>
        </div>
      )}

      {/* Dialog: Create Loan */}
      <Dialog open={dialogState === 'createLoan'} onOpenChange={(open) => {
        if (!open) setDialogState('none');
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Education Loan</DialogTitle>
            <DialogClose />
          </DialogHeader>
          {leadId && (
            <LoanCreationForm
              leadId={leadId}
              onSuccess={handleDialogSuccess}
              onCancel={() => setDialogState('none')}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Manage Lender */}
      <Dialog open={dialogState === 'manageLender'} onOpenChange={(open) => {
        if (!open) setDialogState('none');
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Lenders</DialogTitle>
            <DialogClose />
          </DialogHeader>
          {selectedLoanId && (
            <LenderManagementForm
              loanId={selectedLoanId}
              onSuccess={handleDialogSuccess}
              onCancel={() => setDialogState('none')}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const EducationLoanModule: React.FC<EducationLoanModuleProps> = (props) => {
  return (
    <EducationLoanProvider>
      <EducationLoanModuleContent {...props} />
    </EducationLoanProvider>
  );
};
