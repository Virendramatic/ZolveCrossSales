import React, { createContext, useContext, useState, useCallback } from 'react';
import { apiClient } from '../../services/api';

export interface Lead {
  id: string;
  leadCode: string;
  name: string;
  phone: string;
  email?: string;
  country?: string;
  intake?: string;
  leadSource?: string;
  notes?: string;
  globalCallStatus: string;
  rescheduleDate?: string;
  createdByUserId: string;
  currentOwnerId?: string;
  createdAt: string;
  updatedAt: string;
  productInstances: any[];
  comments: any[];
}

interface LeadsContextType {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  selectedLead: Lead | null;
  nextCursor: string | null;
  hasMore: boolean;

  // Actions
  fetchLeads: (params?: any) => Promise<void>;
  fetchLead: (leadId: string) => Promise<void>;
  createLead: (data: any) => Promise<Lead>;
  updateLead: (leadId: string, data: any) => Promise<Lead>;
  deleteLead: (leadId: string) => Promise<void>;
  updateCallStatus: (leadId: string, status: string) => Promise<void>;
  setRescheduleDate: (leadId: string, date: Date) => Promise<void>;
  clearError: () => void;
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export const LeadsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const clearError = useCallback(() => setError(null), []);

  const fetchLeads = useCallback(async (params?: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getLeads(params);
      if (response.success && response.data) {
        setLeads(response.data.leads);
        setNextCursor(response.data.nextCursor);
        setHasMore(response.data.hasMore);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch leads';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLead = useCallback(async (leadId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getLead(leadId);
      if (response.success && response.data) {
        setSelectedLead(response.data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch lead';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createLead = useCallback(async (data: any) => {
    try {
      setError(null);
      const response = await apiClient.createLead(data);
      if (response.success && response.data) {
        setLeads(prev => [response.data, ...prev]);
        return response.data;
      }
      throw new Error('Failed to create lead');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create lead';
      setError(message);
      throw err;
    }
  }, []);

  const updateLead = useCallback(async (leadId: string, data: any) => {
    try {
      setError(null);
      const response = await apiClient.updateLead(leadId, data);
      if (response.success && response.data) {
        setLeads(prev => prev.map(l => l.id === leadId ? response.data : l));
        if (selectedLead?.id === leadId) {
          setSelectedLead(response.data);
        }
        return response.data;
      }
      throw new Error('Failed to update lead');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update lead';
      setError(message);
      throw err;
    }
  }, [selectedLead]);

  const deleteLead = useCallback(async (leadId: string) => {
    try {
      setError(null);
      const response = await apiClient.deleteLead(leadId);
      if (response.success) {
        setLeads(prev => prev.filter(l => l.id !== leadId));
        if (selectedLead?.id === leadId) {
          setSelectedLead(null);
        }
      } else {
        throw new Error('Failed to delete lead');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete lead';
      setError(message);
      throw err;
    }
  }, [selectedLead]);

  const updateCallStatus = useCallback(async (leadId: string, status: string) => {
    try {
      setError(null);
      const response = await apiClient.updateCallStatus(leadId, status);
      if (response.success && response.data) {
        setLeads(prev => prev.map(l => l.id === leadId ? response.data : l));
        if (selectedLead?.id === leadId) {
          setSelectedLead(response.data);
        }
      } else {
        throw new Error('Failed to update call status');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update call status';
      setError(message);
      throw err;
    }
  }, [selectedLead]);

  const setRescheduleDate = useCallback(async (leadId: string, date: Date) => {
    try {
      setError(null);
      const response = await apiClient.setRescheduleDate(leadId, date);
      if (response.success && response.data) {
        setLeads(prev => prev.map(l => l.id === leadId ? response.data : l));
        if (selectedLead?.id === leadId) {
          setSelectedLead(response.data);
        }
      } else {
        throw new Error('Failed to set reschedule date');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to set reschedule date';
      setError(message);
      throw err;
    }
  }, [selectedLead]);

  return (
    <LeadsContext.Provider
      value={{
        leads,
        loading,
        error,
        selectedLead,
        nextCursor,
        hasMore,
        fetchLeads,
        fetchLead,
        createLead,
        updateLead,
        deleteLead,
        updateCallStatus,
        setRescheduleDate,
        clearError,
      }}
    >
      {children}
    </LeadsContext.Provider>
  );
};

export const useLeads = () => {
  const context = useContext(LeadsContext);
  if (!context) {
    throw new Error('useLeads must be used within LeadsProvider');
  }
  return context;
};
