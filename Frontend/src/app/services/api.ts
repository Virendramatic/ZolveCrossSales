/**
 * API Service - Handles all backend API communication
 * Includes auth token management and error handling
 */

const BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}

class ApiClient {
  private token: string | null = localStorage.getItem('auth_token');

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, options);
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error?.message || 'API request failed');
      }

      return responseData;
    } catch (error) {
      throw error;
    }
  }

  // Leads API
  async createLead(data: {
    name: string;
    phone: string;
    email?: string;
    country?: string;
    intake?: string;
    leadSource?: string;
    notes?: string;
  }) {
    return this.request<any>('POST', '/leads', data);
  }

  async getLeads(params?: {
    limit?: number;
    cursor?: string;
    callStatus?: string;
    status?: string;
    country?: string;
    intake?: string;
    sortBy?: 'name' | 'created' | 'status';
  }) {
    const query = new URLSearchParams();
    if (params) {
      if (params.limit) query.append('limit', params.limit.toString());
      if (params.cursor) query.append('cursor', params.cursor);
      if (params.callStatus) query.append('callStatus', params.callStatus);
      if (params.status) query.append('status', params.status);
      if (params.country) query.append('country', params.country);
      if (params.intake) query.append('intake', params.intake);
      if (params.sortBy) query.append('sortBy', params.sortBy);
    }

    const queryStr = query.toString();
    return this.request<{
      leads: any[];
      nextCursor: string | null;
      hasMore: boolean;
    }>('GET', `/leads${queryStr ? '?' + queryStr : ''}`);
  }

  async getLead(leadId: string) {
    return this.request<any>('GET', `/leads/${leadId}`);
  }

  async updateLead(leadId: string, data: any) {
    return this.request<any>('PUT', `/leads/${leadId}`, data);
  }

  async updateCallStatus(leadId: string, globalCallStatus: string) {
    return this.request<any>('PUT', `/leads/${leadId}/call-status`, {
      globalCallStatus,
    });
  }

  async setRescheduleDate(leadId: string, rescheduleDate: Date) {
    return this.request<any>('PUT', `/leads/${leadId}/reschedule`, {
      rescheduleDate: rescheduleDate.toISOString(),
    });
  }

  async deleteLead(leadId: string) {
    return this.request<any>('DELETE', `/leads/${leadId}`);
  }

  // Comments API
  async createComment(leadId: string, data: { content: string; isInternal?: boolean }) {
    return this.request<any>('POST', `/leads/${leadId}/comments`, data);
  }

  async getComments(leadId: string, params?: { limit?: number; cursor?: string }) {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.cursor) query.append('cursor', params.cursor);

    const queryStr = query.toString();
    return this.request<{
      comments: any[];
      nextCursor: string | null;
      hasMore: boolean;
    }>('GET', `/leads/${leadId}/comments${queryStr ? '?' + queryStr : ''}`);
  }

  async updateComment(commentId: string, content: string) {
    return this.request<any>('PUT', `/comments/${commentId}`, { content });
  }

  async deleteComment(commentId: string) {
    return this.request<any>('DELETE', `/comments/${commentId}`);
  }

  // Bulk API
  async bulkImportLeads(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${BASE_URL}/leads/bulk-import`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Bulk import failed');
    }

    return response.json();
  }

  async bulkAssignLeads(leadIds: string[], targetCounselorId: string) {
    return this.request<any>('POST', '/leads/bulk-assign', {
      leadIds,
      targetCounselorId,
    });
  }

  async getStats() {
    return this.request<any>('GET', '/leads/stats');
  }

  // Products API
  async createProduct(leadId: string, productType: string) {
    return this.request<any>('POST', `/leads/${leadId}/products`, {
      productType,
    });
  }

  async getProducts(leadId: string) {
    return this.request<any[]>('GET', `/leads/${leadId}/products`);
  }

  async updateProductStatus(leadId: string, productId: string, status: string) {
    return this.request<any>('PUT', `/leads/${leadId}/products/${productId}/status`, {
      status,
    });
  }

  async deleteProduct(productId: string) {
    return this.request<any>('DELETE', `/products/${productId}`);
  }

  // Education Loans API
  async createLoan(leadId: string, data: {
    university: string;
    course: string;
    targetCountry?: string;
    totalLoanAmount: number;
    expectedIntake?: string;
    collateralType?: 'SECURED' | 'NON_COLLATERAL';
    coApplicantName?: string;
    coApplicantType?: 'SALARIED' | 'SELF_EMPLOYED';
  }) {
    return this.request<any>('POST', '/loans', { leadId, ...data });
  }

  async getLoan(loanId: string) {
    return this.request<any>('GET', `/loans/${loanId}`);
  }

  async getLoans(params?: {
    stage?: string;
    counselorId?: string;
    country?: string;
    collateralType?: string;
    limit?: number;
    offset?: number;
  }) {
    const query = new URLSearchParams();
    if (params) {
      if (params.stage) query.append('stage', params.stage);
      if (params.counselorId) query.append('counselorId', params.counselorId);
      if (params.country) query.append('country', params.country);
      if (params.collateralType) query.append('collateralType', params.collateralType);
      if (params.limit) query.append('limit', params.limit.toString());
      if (params.offset) query.append('offset', params.offset.toString());
    }

    const queryStr = query.toString();
    return this.request<any>('GET', `/loans${queryStr ? '?' + queryStr : ''}`);
  }

  async updateLoan(loanId: string, data: any) {
    return this.request<any>('PUT', `/loans/${loanId}`, data);
  }

  async deleteLoan(loanId: string) {
    return this.request<any>('DELETE', `/loans/${loanId}`);
  }

  async updateLoanStage(loanId: string, newStage: string, reason?: string) {
    return this.request<any>('PUT', `/loans/${loanId}/stage`, { newStage, reason });
  }

  async getLoanStageHistory(loanId: string) {
    return this.request<any[]>('GET', `/loans/${loanId}/stage-history`);
  }

  // Lender Management
  async addLender(loanId: string, data: {
    lenderName: string;
    matchScore?: number;
    recommendationSource?: string;
  }) {
    return this.request<any>('POST', `/loans/${loanId}/lenders`, data);
  }

  async getLenders(loanId: string, params?: { status?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);

    const queryStr = query.toString();
    return this.request<any[]>('GET', `/loans/${loanId}/lenders${queryStr ? '?' + queryStr : ''}`);
  }

  async getLender(loanId: string, lenderId: string) {
    return this.request<any>('GET', `/loans/${loanId}/lenders/${lenderId}`);
  }

  async updateLenderStatus(loanId: string, lenderId: string, data: any) {
    return this.request<any>('PUT', `/loans/${loanId}/lenders/${lenderId}`, data);
  }

  async removeLender(loanId: string, lenderId: string) {
    return this.request<any>('DELETE', `/loans/${loanId}/lenders/${lenderId}`);
  }

  // Document Management
  async requestDocuments(loanId: string, data: {
    categories: string[];
    deadline?: Date;
  }) {
    return this.request<any>('POST', `/loans/${loanId}/document-request`, data);
  }

  async getDocumentRequest(loanId: string, docRequestId: string) {
    return this.request<any>('GET', `/loans/${loanId}/document-request/${docRequestId}`);
  }

  async approveDocument(loanId: string, docRequestId: string, documentId: string) {
    return this.request<any>(
      'PUT',
      `/loans/${loanId}/document-request/${docRequestId}/documents/${documentId}/approve`,
      {}
    );
  }

  async rejectDocument(loanId: string, docRequestId: string, documentId: string, reason: string) {
    return this.request<any>(
      'PUT',
      `/loans/${loanId}/document-request/${docRequestId}/documents/${documentId}/reject`,
      { reason }
    );
  }

  async getLoanStats() {
    return this.request<any>('GET', '/loans/stats');
  }

  // Document Uploads
  async uploadDocument(loanId: string, data: {
    documentRequestId: string;
    documentId: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }) {
    return this.request<any>('POST', `/loans/${loanId}/documents`, data);
  }

  async getDocumentStatus(loanId: string, documentRequestId: string) {
    return this.request<any>('GET', `/loans/${loanId}/documents/${documentRequestId}`);
  }

  async getDocumentVersions(loanId: string, documentId: string) {
    return this.request<any>('GET', `/loans/${loanId}/documents/${documentId}/versions`);
  }

  async approveDocumentUpload(loanId: string, documentId: string, documentRequestId: string) {
    return this.request<any>(
      'PUT',
      `/loans/${loanId}/documents/${documentId}/approve`,
      { documentRequestId }
    );
  }

  async rejectDocumentUpload(loanId: string, documentId: string, documentRequestId: string, reason: string) {
    return this.request<any>(
      'PUT',
      `/loans/${loanId}/documents/${documentId}/reject`,
      { documentRequestId, reason }
    );
  }

  // Lender Matching
  async matchLenders(loanId: string, autoCreate: boolean = true) {
    const endpoint = autoCreate ? 'POST' : 'GET';
    return this.request<any>(endpoint, `/loans/${loanId}/match`);
  }

  async getMatchRecommendations(loanId: string) {
    return this.request<any>('GET', `/loans/${loanId}/match`);
  }

  async rerrunMatcher(loanId: string) {
    return this.request<any>('POST', `/loans/${loanId}/match/rerun`);
  }
}

export const apiClient = new ApiClient();
