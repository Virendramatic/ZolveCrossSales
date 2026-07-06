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

interface LoanCreationFormProps {
  leadId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const LoanCreationForm: React.FC<LoanCreationFormProps> = ({
  leadId,
  onSuccess,
  onCancel,
}) => {
  const { createLoan, loading, error } = useEducationLoan();
  const [formData, setFormData] = useState({
    university: '',
    course: '',
    targetCountry: '',
    totalLoanAmount: '',
    expectedIntake: '',
    collateralType: 'NON_COLLATERAL' as const,
    coApplicantName: '',
    coApplicantType: 'SALARIED' as const,
  });
  const [localError, setLocalError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setLocalError('');
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setLocalError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    // Validation
    if (!formData.university.trim()) {
      setLocalError('University is required');
      return;
    }
    if (!formData.course.trim()) {
      setLocalError('Course is required');
      return;
    }
    if (!formData.totalLoanAmount || Number(formData.totalLoanAmount) <= 0) {
      setLocalError('Valid loan amount is required');
      return;
    }

    try {
      await createLoan(leadId, {
        university: formData.university,
        course: formData.course,
        targetCountry: formData.targetCountry || undefined,
        totalLoanAmount: Number(formData.totalLoanAmount),
        expectedIntake: formData.expectedIntake || undefined,
        collateralType: formData.collateralType,
        coApplicantName: formData.coApplicantName || undefined,
        coApplicantType: formData.coApplicantType || undefined,
      });
      onSuccess?.();
    } catch (err: any) {
      setLocalError(err?.error?.message || err?.message || 'Failed to create loan');
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create Education Loan Application</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {(localError || error) && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {localError || error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* University */}
            <div className="space-y-2">
              <Label htmlFor="university">University *</Label>
              <Input
                id="university"
                name="university"
                placeholder="e.g., Carnegie Mellon University"
                value={formData.university}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {/* Course */}
            <div className="space-y-2">
              <Label htmlFor="course">Course *</Label>
              <Input
                id="course"
                name="course"
                placeholder="e.g., MS Computer Science"
                value={formData.course}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {/* Target Country */}
            <div className="space-y-2">
              <Label htmlFor="targetCountry">Target Country</Label>
              <Input
                id="targetCountry"
                name="targetCountry"
                placeholder="e.g., USA"
                value={formData.targetCountry}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {/* Loan Amount */}
            <div className="space-y-2">
              <Label htmlFor="totalLoanAmount">Loan Amount (₹) *</Label>
              <Input
                id="totalLoanAmount"
                name="totalLoanAmount"
                type="number"
                placeholder="e.g., 4500000"
                value={formData.totalLoanAmount}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {/* Expected Intake */}
            <div className="space-y-2">
              <Label htmlFor="expectedIntake">Expected Intake</Label>
              <Input
                id="expectedIntake"
                name="expectedIntake"
                placeholder="e.g., Fall 26"
                value={formData.expectedIntake}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {/* Collateral Type */}
            <div className="space-y-2">
              <Label htmlFor="collateralType">Collateral Type</Label>
              <Select
                value={formData.collateralType}
                onValueChange={(value) => handleSelectChange('collateralType', value)}
                disabled={loading}
              >
                <SelectTrigger id="collateralType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NON_COLLATERAL">Non-Collateral</SelectItem>
                  <SelectItem value="SECURED">Secured</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Co-Applicant Information (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Co-Applicant Name */}
              <div className="space-y-2">
                <Label htmlFor="coApplicantName">Co-Applicant Name</Label>
                <Input
                  id="coApplicantName"
                  name="coApplicantName"
                  placeholder="e.g., Parent Name"
                  value={formData.coApplicantName}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              {/* Co-Applicant Type */}
              <div className="space-y-2">
                <Label htmlFor="coApplicantType">Co-Applicant Type</Label>
                <Select
                  value={formData.coApplicantType}
                  onValueChange={(value) => handleSelectChange('coApplicantType', value)}
                  disabled={loading}
                >
                  <SelectTrigger id="coApplicantType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SALARIED">Salaried</SelectItem>
                    <SelectItem value="SELF_EMPLOYED">Self-Employed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-6 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Loan'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
