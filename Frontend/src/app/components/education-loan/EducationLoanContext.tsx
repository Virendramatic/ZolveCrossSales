import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { apiClient } from '../../services/api';

export interface EducationLoan {
  id: string;
  loanCode: string;
  leadId: string;
  university: string;
  course: string;
  targetCountry?: string;
  totalLoanAmount: number;
  expectedIntake?: string;
  collateralType: 'SECURED' | 'NON_COLLATERAL';
  coApplicantName?: string;
  coApplicantType?: 'SALARIED' | 'SELF_EMPLOYED';
  loanStage: 'STARTED' | 'DOCS_PENDING' | 'DOCS_RECEIVED' | 'CALL_SCHEDULED' | 'SANCTIONED' | 'DISBURSED' | 'LOST';
  stageUpdatedAt: string;
  counselorZrmId: string;
  lead?: any;
  lenderApplications?: LenderApplication[];
  documentRequests?: DocumentRequest[];
  stageHistory?: StageHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface LenderApplication {
  id: string;
  lenderCode: string;
  lenderName: string;
  matchScore?: number;
  lenderStatus: 'INTERESTED' | 'APPLIED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'DISBURSED' | 'WITHDRAWN';
  sanctionAmount?: number;
  roi?: number;
  processingFee?: number;
  sanctionDate?: string;
  sanctionValidity?: string;
  disbursementAmount?: number;
  disbursementDate?: string;
  rejectionReason?: string;
  statusHistory?: StatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistory {
  id: string;
  previousStatus?: string;
  newStatus: string;
  changedAt: string;
  changedBy: string;
  reason?: string;
}

export interface StageHistory {
  id: string;
  previousStage?: string;
  newStage: string;
  transitionTimestamp: string;
  responsibleCounselorId?: string;
  reason?: string;
}

export interface DocumentRequest {
  id: string;
  docRequestCode: string;
  categories: string[];
  sentDate?: string;
  deadline?: string;
  status: 'PENDING' | 'PARTIAL_RECEIVED' | 'COMPLETED' | 'EXPIRED';
  completedAt?: string;
  documents: DocumentSubmission[];
}

export interface DocumentSubmission {
  id: string;
  name: string;
  category: string;
  documentType: string;
  required: boolean;
  status: 'NOT_STARTED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  submissionDate?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface EducationLoanContextType {
  loans: EducationLoan[];
  selectedLoan: EducationLoan | null;
  loading: boolean;
  error: string | null;

  // Actions
  loadLoans: (filters?: any) => Promise<void>;
  selectLoan: (loanId: string) => Promise<void>;
  createLoan: (leadId: string, data: any) => Promise<EducationLoan>;
  updateLoan: (loanId: string, data: any) => Promise<EducationLoan>;
  updateLoanStage: (loanId: string, newStage: string, reason?: string) => Promise<EducationLoan>;
  deleteLoan: (loanId: string) => Promise<void>;

  // Lender actions
  addLender: (loanId: string, data: any) => Promise<LenderApplication>;
  updateLenderStatus: (loanId: string, lenderId: string, data: any) => Promise<LenderApplication>;
  removeLender: (loanId: string, lenderId: string) => Promise<void>;

  // Document actions
  requestDocuments: (loanId: string, data: any) => Promise<DocumentRequest>;
  approveDocument: (loanId: string, docRequestId: string, documentId: string) => Promise<void>;
  rejectDocument: (loanId: string, docRequestId: string, documentId: string, reason: string) => Promise<void>;
  uploadDocument: (loanId: string, data: any) => Promise<any>;
  getDocumentStatus: (loanId: string, documentRequestId: string) => Promise<any>;
  getDocumentVersions: (loanId: string, documentId: string) => Promise<any>;

  // Lender matching actions
  matchLenders: (loanId: string) => Promise<any>;
  getMatchRecommendations: (loanId: string) => Promise<any>;

  clearError: () => void;
}

const EducationLoanContext = createContext<EducationLoanContextType | undefined>(undefined);

export const EducationLoanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loans, setLoans] = useState<EducationLoan[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<EducationLoan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((err: any) => {
    const message = err?.error?.message || err?.message || 'An error occurred';
    setError(message);
    console.error('Education Loan Error:', message);
  }, []);

  const loadLoans = useCallback(
    async (filters?: any) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.getLoans(filters);
        if (response.success && response.data) {
          setLoans(response.data.data || []);
        }
      } catch (err) {
        handleError(err);
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  const selectLoan = useCallback(
    async (loanId: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.getLoan(loanId);
        if (response.success && response.data) {
          setSelectedLoan(response.data);
        }
      } catch (err) {
        handleError(err);
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  const createLoan = useCallback(
    async (leadId: string, data: any): Promise<EducationLoan> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.createLoan(leadId, data);
        if (response.success && response.data) {
          const newLoan = response.data;
          setLoans((prev) => [newLoan, ...prev]);
          return newLoan;
        }
        throw new Error('Failed to create loan');
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  const updateLoan = useCallback(
    async (loanId: string, data: any): Promise<EducationLoan> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.updateLoan(loanId, data);
        if (response.success && response.data) {
          const updated = response.data;
          setLoans((prev) => prev.map((l) => (l.id === loanId ? updated : l)));
          if (selectedLoan?.id === loanId) {
            setSelectedLoan(updated);
          }
          return updated;
        }
        throw new Error('Failed to update loan');
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedLoan, handleError]
  );

  const updateLoanStage = useCallback(
    async (loanId: string, newStage: string, reason?: string): Promise<EducationLoan> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.updateLoanStage(loanId, newStage, reason);
        if (response.success && response.data) {
          const updated = response.data;
          setLoans((prev) => prev.map((l) => (l.id === loanId ? updated : l)));
          if (selectedLoan?.id === loanId) {
            setSelectedLoan(updated);
          }
          return updated;
        }
        throw new Error('Failed to update loan stage');
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedLoan, handleError]
  );

  const deleteLoan = useCallback(
    async (loanId: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.deleteLoan(loanId);
        if (response.success) {
          setLoans((prev) => prev.filter((l) => l.id !== loanId));
          if (selectedLoan?.id === loanId) {
            setSelectedLoan(null);
          }
        }
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedLoan, handleError]
  );

  const addLender = useCallback(
    async (loanId: string, data: any): Promise<LenderApplication> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.addLender(loanId, data);
        if (response.success && response.data) {
          const lender = response.data;
          if (selectedLoan?.id === loanId) {
            setSelectedLoan((prev) => ({
              ...prev!,
              lenderApplications: [...(prev?.lenderApplications || []), lender],
            }));
          }
          return lender;
        }
        throw new Error('Failed to add lender');
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedLoan, handleError]
  );

  const updateLenderStatus = useCallback(
    async (loanId: string, lenderId: string, data: any): Promise<LenderApplication> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.updateLenderStatus(loanId, lenderId, data);
        if (response.success && response.data) {
          const lender = response.data;
          if (selectedLoan?.id === loanId) {
            setSelectedLoan((prev) => ({
              ...prev!,
              lenderApplications: (prev?.lenderApplications || []).map((l) =>
                l.id === lenderId ? lender : l
              ),
            }));
          }
          return lender;
        }
        throw new Error('Failed to update lender status');
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedLoan, handleError]
  );

  const removeLender = useCallback(
    async (loanId: string, lenderId: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.removeLender(loanId, lenderId);
        if (response.success) {
          if (selectedLoan?.id === loanId) {
            setSelectedLoan((prev) => ({
              ...prev!,
              lenderApplications: (prev?.lenderApplications || []).filter((l) => l.id !== lenderId),
            }));
          }
        }
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedLoan, handleError]
  );

  const requestDocuments = useCallback(
    async (loanId: string, data: any): Promise<DocumentRequest> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.requestDocuments(loanId, data);
        if (response.success && response.data) {
          const docRequest = response.data;
          if (selectedLoan?.id === loanId) {
            setSelectedLoan((prev) => ({
              ...prev!,
              documentRequests: [...(prev?.documentRequests || []), docRequest],
            }));
          }
          return docRequest;
        }
        throw new Error('Failed to request documents');
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedLoan, handleError]
  );

  const approveDocument = useCallback(
    async (loanId: string, docRequestId: string, documentId: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.approveDocument(loanId, docRequestId, documentId);
        if (response.success) {
          // Refresh the selected loan to get updated document status
          if (selectedLoan?.id === loanId) {
            await selectLoan(loanId);
          }
        }
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedLoan, selectLoan, handleError]
  );

  const rejectDocument = useCallback(
    async (loanId: string, docRequestId: string, documentId: string, reason: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.rejectDocument(loanId, docRequestId, documentId, reason);
        if (response.success) {
          // Refresh the selected loan to get updated document status
          if (selectedLoan?.id === loanId) {
            await selectLoan(loanId);
          }
        }
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedLoan, selectLoan, handleError]
  );

  const uploadDocument = useCallback(
    async (loanId: string, data: any) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.uploadDocument(loanId, data);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error('Failed to upload document');
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  const getDocumentStatus = useCallback(
    async (loanId: string, documentRequestId: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.getDocumentStatus(loanId, documentRequestId);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error('Failed to get document status');
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  const getDocumentVersions = useCallback(
    async (loanId: string, documentId: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.getDocumentVersions(loanId, documentId);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error('Failed to get document versions');
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  const matchLenders = useCallback(
    async (loanId: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.matchLenders(loanId);
        if (response.success && response.data) {
          // Update selected loan with new lenders if present
          if (selectedLoan?.id === loanId && response.data.createdLenders) {
            setSelectedLoan((prev) => ({
              ...prev!,
              lenderApplications: [
                ...(prev?.lenderApplications || []),
                ...response.data.createdLenders,
              ],
            }));
          }
          return response.data;
        }
        throw new Error('Failed to match lenders');
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedLoan, handleError]
  );

  const getMatchRecommendations = useCallback(
    async (loanId: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.getMatchRecommendations(loanId);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error('Failed to get recommendations');
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <EducationLoanContext.Provider
      value={{
        loans,
        selectedLoan,
        loading,
        error,
        loadLoans,
        selectLoan,
        createLoan,
        updateLoan,
        updateLoanStage,
        deleteLoan,
        addLender,
        updateLenderStatus,
        removeLender,
        requestDocuments,
        approveDocument,
        rejectDocument,
        uploadDocument,
        getDocumentStatus,
        getDocumentVersions,
        matchLenders,
        getMatchRecommendations,
        clearError,
      }}
    >
      {children}
    </EducationLoanContext.Provider>
  );
};

export const useEducationLoan = () => {
  const context = React.useContext(EducationLoanContext);
  if (!context) {
    throw new Error('useEducationLoan must be used within EducationLoanProvider');
  }
  return context;
};
