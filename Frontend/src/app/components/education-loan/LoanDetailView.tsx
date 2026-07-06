import React, { useState } from 'react';
import { useEducationLoan } from './EducationLoanContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
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

const validTransitions: Record<string, string[]> = {
  STARTED: ['DOCS_PENDING', 'LOST'],
  DOCS_PENDING: ['DOCS_RECEIVED', 'LOST'],
  DOCS_RECEIVED: ['CALL_SCHEDULED', 'LOST'],
  CALL_SCHEDULED: ['SANCTIONED', 'LOST'],
  SANCTIONED: ['DISBURSED', 'LOST'],
  DISBURSED: [],
  LOST: [],
};

interface LoanDetailViewProps {
  onLenderAdded?: () => void;
  onDocumentsRequested?: () => void;
}

export const LoanDetailView: React.FC<LoanDetailViewProps> = ({
  onLenderAdded,
  onDocumentsRequested,
}) => {
  const { selectedLoan, loading, updateLoanStage } = useEducationLoan();
  const [stageTransitioning, setStageTransitioning] = useState(false);

  if (!selectedLoan) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-gray-500">
          Select a loan to view details
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const nextStages = validTransitions[selectedLoan.loanStage] || [];

  const handleStageTransition = async (newStage: string) => {
    setStageTransitioning(true);
    try {
      await updateLoanStage(selectedLoan.id, newStage, 'Transitioned by counselor');
    } finally {
      setStageTransitioning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{selectedLoan.university}</h2>
                <Badge className={stageColors[selectedLoan.loanStage]}>
                  {stageLabels[selectedLoan.loanStage]}
                </Badge>
              </div>
              <p className="text-lg text-gray-600">{selectedLoan.course}</p>
            </div>
            <div className="text-right font-mono text-sm">
              <div className="font-semibold">{selectedLoan.loanCode}</div>
              <div className="text-gray-500">
                {new Date(selectedLoan.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Loan Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Loan Amount</div>
              <div className="font-semibold">₹{(selectedLoan.totalLoanAmount / 100000).toFixed(1)}L</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Target Country</div>
              <div className="font-semibold">{selectedLoan.targetCountry || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Expected Intake</div>
              <div className="font-semibold">{selectedLoan.expectedIntake || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Collateral Type</div>
              <div className="font-semibold">
                {selectedLoan.collateralType === 'SECURED' ? 'Secured' : 'Non-Collateral'}
              </div>
            </div>
            {selectedLoan.coApplicantName && (
              <>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Co-Applicant</div>
                  <div className="font-semibold">{selectedLoan.coApplicantName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Co-Applicant Type</div>
                  <div className="font-semibold">{selectedLoan.coApplicantType}</div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stage Management */}
      {nextStages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stage Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {nextStages.map((stage) => (
                <Button
                  key={stage}
                  variant="outline"
                  onClick={() => handleStageTransition(stage)}
                  disabled={stageTransitioning}
                  className={stageColors[stage]}
                >
                  Move to {stageLabels[stage]}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for Lenders, Documents, History */}
      <Tabs defaultValue="lenders" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lenders">
            Lenders ({selectedLoan.lenderApplications?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="documents">
            Documents ({selectedLoan.documentRequests?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Lenders Tab */}
        <TabsContent value="lenders">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Lender Applications</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onLenderAdded}
                >
                  Add Lender
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!selectedLoan.lenderApplications || selectedLoan.lenderApplications.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No lenders added yet. Click "Add Lender" to get started.
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedLoan.lenderApplications.map((lender) => (
                    <div
                      key={lender.id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{lender.lenderName}</h4>
                          <p className="text-xs text-gray-500">{lender.lenderCode}</p>
                        </div>
                        <Badge>
                          {lender.lenderStatus}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Match Score:</span>
                          <span className="ml-1 font-semibold">{lender.matchScore || 'N/A'}</span>
                        </div>
                        {lender.sanctionAmount && (
                          <div>
                            <span className="text-gray-500">Sanction:</span>
                            <span className="ml-1 font-semibold">
                              ₹{(lender.sanctionAmount / 100000).toFixed(1)}L
                            </span>
                          </div>
                        )}
                        {lender.roi && (
                          <div>
                            <span className="text-gray-500">ROI:</span>
                            <span className="ml-1 font-semibold">{lender.roi}%</span>
                          </div>
                        )}
                        {lender.disbursementAmount && (
                          <div>
                            <span className="text-gray-500">Disbursed:</span>
                            <span className="ml-1 font-semibold">
                              ₹{(lender.disbursementAmount / 100000).toFixed(1)}L
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Documents</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onDocumentsRequested}
                >
                  Request Documents
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!selectedLoan.documentRequests || selectedLoan.documentRequests.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No documents requested yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {selectedLoan.documentRequests.map((docRequest) => (
                    <div key={docRequest.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold">{docRequest.docRequestCode}</h4>
                        <Badge>{docRequest.status}</Badge>
                      </div>
                      <div className="space-y-2">
                        {docRequest.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded"
                          >
                            <div>
                              <span className="font-medium">{doc.name}</span>
                              <span className="ml-2 text-gray-500 text-xs">
                                ({doc.category})
                                {!doc.required && ' [Optional]'}
                              </span>
                            </div>
                            <Badge
                              variant={doc.status === 'APPROVED' ? 'default' : 'secondary'}
                            >
                              {doc.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stage History</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedLoan.stageHistory || selectedLoan.stageHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No stage transitions yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedLoan.stageHistory.map((history, index) => (
                    <div key={history.id} className="flex gap-4">
                      <div className="text-sm font-mono text-gray-500">
                        {new Date(history.transitionTimestamp).toLocaleDateString()} at{' '}
                        {new Date(history.transitionTimestamp).toLocaleTimeString()}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm">
                          {history.previousStage && (
                            <>
                              <Badge variant="outline" className="mr-2">
                                {stageLabels[history.previousStage]}
                              </Badge>
                              <span className="text-gray-500">→</span>
                            </>
                          )}
                          <Badge className="ml-2">
                            {stageLabels[history.newStage]}
                          </Badge>
                        </div>
                        {history.reason && (
                          <p className="text-xs text-gray-600 mt-1">{history.reason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
