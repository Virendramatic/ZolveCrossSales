import React, { useEffect, useState } from 'react';
import { useEducationLoan } from './EducationLoanContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';

const stageColors: Record<string, string> = {
  STARTED: 'bg-gray-100 text-gray-800',
  DOCS_PENDING: 'bg-yellow-100 text-yellow-800',
  DOCS_RECEIVED: 'bg-blue-100 text-blue-800',
  CALL_SCHEDULED: 'bg-purple-100 text-purple-800',
  SANCTIONED: 'bg-green-100 text-green-800',
  DISBURSED: 'bg-emerald-100 text-emerald-800',
  LOST: 'bg-red-100 text-red-800',
};

const stageLabels: Record<string, string> = {
  STARTED: 'Started',
  DOCS_PENDING: 'Docs Pending',
  DOCS_RECEIVED: 'Docs Received',
  CALL_SCHEDULED: 'Call Scheduled',
  SANCTIONED: 'Sanctioned',
  DISBURSED: 'Disbursed',
  LOST: 'Lost',
};

interface EducationLoanListViewProps {
  onSelectLoan?: (loanId: string) => void;
  onCreateLoan?: () => void;
  filters?: {
    stage?: string;
    country?: string;
    collateralType?: string;
  };
}

export const EducationLoanListView: React.FC<EducationLoanListViewProps> = ({
  onSelectLoan,
  onCreateLoan,
  filters,
}) => {
  const { loans, loading, error, loadLoans, selectLoan } = useEducationLoan();
  const [currentStageFilter, setCurrentStageFilter] = useState(filters?.stage || '');

  useEffect(() => {
    loadLoans({
      stage: currentStageFilter || undefined,
      ...filters,
    });
  }, [currentStageFilter, filters, loadLoans]);

  const handleSelectLoan = async (loanId: string) => {
    await selectLoan(loanId);
    onSelectLoan?.(loanId);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 flex-wrap">
          {['', 'STARTED', 'DOCS_PENDING', 'DOCS_RECEIVED', 'SANCTIONED', 'DISBURSED'].map((stage) => (
            <Button
              key={stage}
              variant={currentStageFilter === stage ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentStageFilter(stage)}
              className="text-xs"
            >
              {stage ? stageLabels[stage] : 'All'}
            </Button>
          ))}
        </div>
        {onCreateLoan && (
          <Button onClick={onCreateLoan} size="sm">
            New Loan
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      {loans.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            No education loans found. {onCreateLoan && <span>Click "New Loan" to get started.</span>}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {loans.map((loan) => (
            <Card
              key={loan.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleSelectLoan(loan.id)}
            >
              <CardContent className="pt-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{loan.university}</h3>
                      <Badge className={stageColors[loan.loanStage]}>
                        {stageLabels[loan.loanStage]}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{loan.course}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Loan Code:</span>
                        <span className="ml-2 font-mono font-semibold">{loan.loanCode}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Amount:</span>
                        <span className="ml-2 font-semibold">
                          ₹{(loan.totalLoanAmount / 100000).toFixed(1)}L
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Country:</span>
                        <span className="ml-2">{loan.targetCountry || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Intake:</span>
                        <span className="ml-2">{loan.expectedIntake || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-2">
                      {new Date(loan.createdAt).toLocaleDateString()}
                    </div>
                    {loan.lenderApplications && (
                      <Badge variant="secondary" className="text-xs">
                        {loan.lenderApplications.length} Lender{loan.lenderApplications.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
