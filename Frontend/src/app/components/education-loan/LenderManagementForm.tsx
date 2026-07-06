import React, { useState } from 'react';
import { useEducationLoan } from './EducationLoanContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface LenderManagementFormProps {
  loanId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type FormMode = 'add' | 'updateStatus';

export const LenderManagementForm: React.FC<LenderManagementFormProps> = ({
  loanId,
  onSuccess,
  onCancel,
}) => {
  const { selectedLoan, addLender, updateLenderStatus, removeLender, loading, error } =
    useEducationLoan();
  const [mode, setMode] = useState<FormMode>('add');
  const [localError, setLocalError] = useState<string>('');

  // Add Lender Form
  const [addForm, setAddForm] = useState({
    lenderName: '',
    matchScore: '',
    recommendationSource: 'MANUAL' as const,
  });

  // Update Status Form
  const [selectedLenderId, setSelectedLenderId] = useState<string>('');
  const [statusForm, setStatusForm] = useState({
    lenderStatus: '',
    sanctionAmount: '',
    roi: '',
    processingFee: '',
    sanctionDate: '',
    sanctionValidity: '',
    disbursementAmount: '',
    disbursementDate: '',
    rejectionReason: '',
  });

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setLocalError('');
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!addForm.lenderName.trim()) {
      setLocalError('Lender name is required');
      return;
    }

    try {
      await addLender(loanId, {
        lenderName: addForm.lenderName,
        matchScore: addForm.matchScore ? Number(addForm.matchScore) : undefined,
        recommendationSource: addForm.recommendationSource,
      });
      setAddForm({
        lenderName: '',
        matchScore: '',
        recommendationSource: 'MANUAL',
      });
      onSuccess?.();
    } catch (err: any) {
      setLocalError(err?.error?.message || err?.message || 'Failed to add lender');
    }
  };

  const handleStatusChange = (name: string, value: string) => {
    setStatusForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setLocalError('');
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!selectedLenderId) {
      setLocalError('Please select a lender');
      return;
    }

    if (!statusForm.lenderStatus) {
      setLocalError('Please select a new status');
      return;
    }

    try {
      const updateData: any = {
        lenderStatus: statusForm.lenderStatus,
      };

      // Add status-specific fields
      if (statusForm.lenderStatus === 'APPROVED') {
        if (statusForm.sanctionAmount) {
          updateData.sanctionAmount = Number(statusForm.sanctionAmount);
        }
        if (statusForm.roi) {
          updateData.roi = Number(statusForm.roi);
        }
        if (statusForm.processingFee) {
          updateData.processingFee = Number(statusForm.processingFee);
        }
        if (statusForm.sanctionDate) {
          updateData.sanctionDate = new Date(statusForm.sanctionDate);
        }
        if (statusForm.sanctionValidity) {
          updateData.sanctionValidity = new Date(statusForm.sanctionValidity);
        }
      }

      if (statusForm.lenderStatus === 'DISBURSED') {
        if (statusForm.disbursementAmount) {
          updateData.disbursementAmount = Number(statusForm.disbursementAmount);
        }
        if (statusForm.disbursementDate) {
          updateData.disbursementDate = new Date(statusForm.disbursementDate);
        }
      }

      if (statusForm.lenderStatus === 'REJECTED') {
        if (statusForm.rejectionReason) {
          updateData.rejectionReason = statusForm.rejectionReason;
        }
      }

      await updateLenderStatus(loanId, selectedLenderId, updateData);
      setStatusForm({
        lenderStatus: '',
        sanctionAmount: '',
        roi: '',
        processingFee: '',
        sanctionDate: '',
        sanctionValidity: '',
        disbursementAmount: '',
        disbursementDate: '',
        rejectionReason: '',
      });
      setSelectedLenderId('');
      onSuccess?.();
    } catch (err: any) {
      setLocalError(err?.error?.message || err?.message || 'Failed to update lender status');
    }
  };

  const handleRemoveLender = async (lenderId: string) => {
    if (!confirm('Are you sure you want to remove this lender?')) {
      return;
    }

    try {
      await removeLender(loanId, lenderId);
      setSelectedLenderId('');
      onSuccess?.();
    } catch (err: any) {
      setLocalError(err?.error?.message || err?.message || 'Failed to remove lender');
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Lender Management</CardTitle>
      </CardHeader>
      <CardContent>
        {(localError || error) && (
          <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {localError || error}
          </div>
        )}

        <Tabs value={mode} onValueChange={(v) => setMode(v as FormMode)}>
          <TabsList>
            <TabsTrigger value="add">Add Lender</TabsTrigger>
            <TabsTrigger value="updateStatus">Update Status</TabsTrigger>
          </TabsList>

          {/* Add Lender Tab */}
          <TabsContent value="add" className="mt-6">
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lenderName">Lender Name *</Label>
                <Input
                  id="lenderName"
                  name="lenderName"
                  placeholder="e.g., HDFC Credila"
                  value={addForm.lenderName}
                  onChange={handleAddChange}
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="matchScore">Match Score (0-100)</Label>
                  <Input
                    id="matchScore"
                    name="matchScore"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g., 85"
                    value={addForm.matchScore}
                    onChange={handleAddChange}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recommendationSource">Recommendation Source</Label>
                  <Select
                    value={addForm.recommendationSource}
                    onValueChange={(value) =>
                      setAddForm((prev) => ({
                        ...prev,
                        recommendationSource: value as 'AUTO_RECOMMENDED' | 'MANUAL',
                      }))
                    }
                    disabled={loading}
                  >
                    <SelectTrigger id="recommendationSource">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MANUAL">Manual</SelectItem>
                      <SelectItem value="AUTO_RECOMMENDED">Auto-Recommended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Lender'}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Update Status Tab */}
          <TabsContent value="updateStatus" className="mt-6">
            <form onSubmit={handleStatusSubmit} className="space-y-4">
              {/* Select Lender */}
              <div className="space-y-2">
                <Label htmlFor="selectLender">Select Lender</Label>
                <Select value={selectedLenderId} onValueChange={setSelectedLenderId}>
                  <SelectTrigger id="selectLender">
                    <SelectValue placeholder="Choose a lender..." />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedLoan?.lenderApplications?.map((lender) => (
                      <SelectItem key={lender.id} value={lender.id}>
                        {lender.lenderName} ({lender.lenderStatus})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedLenderId && (
                <>
                  {/* New Status */}
                  <div className="space-y-2">
                    <Label htmlFor="lenderStatus">New Status *</Label>
                    <Select
                      value={statusForm.lenderStatus}
                      onValueChange={(value) => handleStatusChange('lenderStatus', value)}
                      disabled={loading}
                    >
                      <SelectTrigger id="lenderStatus">
                        <SelectValue placeholder="Select status..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INTERESTED">Interested</SelectItem>
                        <SelectItem value="APPLIED">Applied</SelectItem>
                        <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                        <SelectItem value="DISBURSED">Disbursed</SelectItem>
                        <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Conditional Fields Based on Status */}
                  {statusForm.lenderStatus === 'APPROVED' && (
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-sm">Sanction Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="sanctionAmount">Sanction Amount (₹)</Label>
                          <Input
                            id="sanctionAmount"
                            name="sanctionAmount"
                            type="number"
                            placeholder="e.g., 4200000"
                            value={statusForm.sanctionAmount}
                            onChange={(e) =>
                              handleStatusChange('sanctionAmount', e.target.value)
                            }
                            disabled={loading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="roi">ROI (%)</Label>
                          <Input
                            id="roi"
                            name="roi"
                            type="number"
                            step="0.1"
                            placeholder="e.g., 11.5"
                            value={statusForm.roi}
                            onChange={(e) => handleStatusChange('roi', e.target.value)}
                            disabled={loading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="processingFee">Processing Fee (₹)</Label>
                          <Input
                            id="processingFee"
                            name="processingFee"
                            type="number"
                            placeholder="e.g., 42000"
                            value={statusForm.processingFee}
                            onChange={(e) =>
                              handleStatusChange('processingFee', e.target.value)
                            }
                            disabled={loading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sanctionDate">Sanction Date</Label>
                          <Input
                            id="sanctionDate"
                            name="sanctionDate"
                            type="date"
                            value={statusForm.sanctionDate}
                            onChange={(e) =>
                              handleStatusChange('sanctionDate', e.target.value)
                            }
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {statusForm.lenderStatus === 'DISBURSED' && (
                    <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-sm">Disbursement Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="disbursementAmount">Disbursement Amount (₹)</Label>
                          <Input
                            id="disbursementAmount"
                            name="disbursementAmount"
                            type="number"
                            placeholder="e.g., 4200000"
                            value={statusForm.disbursementAmount}
                            onChange={(e) =>
                              handleStatusChange('disbursementAmount', e.target.value)
                            }
                            disabled={loading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="disbursementDate">Disbursement Date</Label>
                          <Input
                            id="disbursementDate"
                            name="disbursementDate"
                            type="date"
                            value={statusForm.disbursementDate}
                            onChange={(e) =>
                              handleStatusChange('disbursementDate', e.target.value)
                            }
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {statusForm.lenderStatus === 'REJECTED' && (
                    <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="font-semibold text-sm">Rejection Details</h4>
                      <div className="space-y-2">
                        <Label htmlFor="rejectionReason">Rejection Reason</Label>
                        <Input
                          id="rejectionReason"
                          name="rejectionReason"
                          placeholder="Why was the lender rejected?"
                          value={statusForm.rejectionReason}
                          onChange={(e) =>
                            handleStatusChange('rejectionReason', e.target.value)
                          }
                          disabled={loading}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 justify-end pt-4">
                    {onCancel && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => handleRemoveLender(selectedLenderId)}
                      disabled={loading}
                    >
                      Remove Lender
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Updating...' : 'Update Status'}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
