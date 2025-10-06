/**
 * Admin Service
 * 
 * Handles all admin-related API calls for managing users, charities, and system operations.
 */
import axios, { AxiosInstance } from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error('VITE_API_URL is not defined in your .env.local file');
}

// --- Types ---
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'donor' | 'charity_admin' | 'admin';
  status: 'active' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface Charity {
  id: number;
  owner_id: number;
  name: string;
  reg_no?: string;
  tax_id?: string;
  mission?: string;
  vision?: string;
  website?: string;
  contact_email: string;
  contact_phone?: string;
  logo_path?: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  verified_at?: string;
  verification_notes?: string;
  created_at: string;
  updated_at: string;
  owner?: User;
  documents?: CharityDocument[];
}

export interface CharityDocument {
  id: number;
  charity_id: number;
  document_type: string;
  file_path: string;
  uploaded_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface DashboardMetrics {
  total_users: number;
  total_donors: number;
  total_charity_admins: number;
  charities: number;
  pending_verifications: number;
  campaigns: number;
  donations: number;
}

// --- Admin Service Class ---
class AdminService {
  private apiClient: AxiosInstance;

  constructor() {
    this.apiClient = axios.create({
      baseURL: API_URL,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    // Interceptor to add auth token
    this.apiClient.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // --- Token Management ---
  private getToken(): string | null {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  }

  // --- Dashboard Metrics ---
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const response = await this.apiClient.get<DashboardMetrics>('/api/metrics');
    return response.data;
  }

  // --- Charity Verification ---
  async getPendingCharities(page: number = 1): Promise<PaginatedResponse<Charity>> {
    const response = await this.apiClient.get<PaginatedResponse<Charity>>('/api/admin/verifications', {
      params: { page }
    });
    return response.data;
  }

  async approveCharity(charityId: number, notes?: string): Promise<{ message: string }> {
    const response = await this.apiClient.patch(`/api/admin/charities/${charityId}/approve`, {
      notes
    });
    return response.data;
  }

  async rejectCharity(charityId: number, notes: string): Promise<{ message: string }> {
    const response = await this.apiClient.patch(`/api/admin/charities/${charityId}/reject`, {
      notes
    });
    return response.data;
  }

  // --- User Management ---
  async getUsers(page: number = 1, filters?: { role?: string; status?: string; search?: string }): Promise<PaginatedResponse<User>> {
    // Note: This endpoint needs to be added to the backend
    const response = await this.apiClient.get<PaginatedResponse<User>>('/api/admin/users', {
      params: { page, ...filters }
    });
    return response.data;
  }

  async suspendUser(userId: number): Promise<{ message: string }> {
    const response = await this.apiClient.patch(`/api/admin/users/${userId}/suspend`);
    return response.data;
  }

  async activateUser(userId: number): Promise<{ message: string }> {
    // Note: This endpoint needs to be added to the backend
    const response = await this.apiClient.patch(`/api/admin/users/${userId}/activate`);
    return response.data;
  }

  // --- Charity Management ---
  async getAllCharities(page: number = 1, filters?: { status?: string; search?: string }): Promise<PaginatedResponse<Charity>> {
    // Note: This endpoint needs to be added to the backend
    const response = await this.apiClient.get<PaginatedResponse<Charity>>('/api/admin/charities', {
      params: { page, ...filters }
    });
    return response.data;
  }

  async getCharityDetails(charityId: number): Promise<Charity> {
    const response = await this.apiClient.get<Charity>(`/api/charities/${charityId}`);
    return response.data;
  }
}

// Export singleton instance
export const adminService = new AdminService();
