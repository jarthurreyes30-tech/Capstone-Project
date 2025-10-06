/**
 * Authentication Service
 *
 * Handles all authentication-related API calls.
 * This service is adapted to use token-based authentication.
 */
import axios, { AxiosInstance } from 'axios';

// Get the base URL from environment variables.
// Note: We are using VITE_API_URL to match the .env.local file we created earlier.
const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error('VITE_API_URL is not defined in your .env.local file');
}

// --- Define Types for our data ---
interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'donor' | 'charity_admin' | 'admin';
  [key: string]: any;
}

export interface AuthResponse {
  token?: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface DonorRegistrationData {
  full_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  address?: string;
  preferred_contact_method?: 'email' | 'sms';
  anonymous_giving?: boolean;
  accept_terms: boolean;
}

export interface CharityRegistrationData {
  organization_name: string;
  legal_trading_name?: string;
  registration_number: string;
  tax_id: string;
  website?: string;
  contact_person_name: string;
  contact_email: string;
  contact_phone: string;
  password: string;
  password_confirmation: string;
  address: string;
  region: string;
  municipality: string;
  nonprofit_category: string;
  mission_statement: string;
  description: string;
  accept_terms: boolean;
  confirm_truthfulness: boolean;
}

// --- Create a reusable AuthService class ---
class AuthService {
  private apiClient: AxiosInstance;

  constructor() {
    this.apiClient = axios.create({
      baseURL: API_URL,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    // Interceptor to automatically add the auth token to requests
    this.apiClient.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // --- Core API Methods ---

  /**
   * Login with email and password.
   * Your backend should return a token and user object.
   */
  async login(credentials: LoginCredentials): Promise<User> {
    const response = await this.apiClient.post<AuthResponse>('/api/auth/login', credentials);
    
    if (response.data.token) {
      this.setToken(response.data.token, credentials.remember_me);
    }

    return response.data.user;
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    const response = await this.apiClient.get<User>('/api/me');
    return response.data;
  }

  /**
   * Logout the current user.
   */
  async logout(): Promise<void> {
    try {
      await this.apiClient.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
    this.clearToken();
  }

  /**
   * Register a new donor.
   */
  async registerDonor(data: any): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('name', data.full_name);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('password_confirmation', data.password_confirmation);
    if (data.phone) formData.append('phone', data.phone);
    if (data.address) formData.append('address', data.address);
    if (data.profile_image) formData.append('profile_image', data.profile_image);
    
    const response = await this.apiClient.post<AuthResponse>('/api/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  /**
   * Register a new charity.
   */
  async registerCharity(data: any): Promise<{ success: boolean, message: string }> {
    // If data is already FormData, use it directly
    if (data instanceof FormData) {
      const response = await this.apiClient.post('/api/auth/register-charity', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return { success: true, message: response.data.message };
    }
    
    // Otherwise, create FormData from object
    const formData = new FormData();
    
    // Representative details
    formData.append('name', data.contact_person_name);
    formData.append('email', data.contact_email);
    formData.append('password', data.password || 'TempPassword123!');
    formData.append('password_confirmation', data.password_confirmation || 'TempPassword123!');
    if (data.contact_phone) formData.append('phone', data.contact_phone);
    
    // Organization details
    formData.append('charity_name', data.organization_name);
    if (data.registration_number) formData.append('reg_no', data.registration_number);
    if (data.tax_id) formData.append('tax_id', data.tax_id);
    if (data.mission_statement) formData.append('mission', data.mission_statement);
    if (data.description) formData.append('vision', data.description);
    if (data.website) formData.append('website', data.website);
    formData.append('contact_email', data.contact_email);
    if (data.contact_phone) formData.append('contact_phone', data.contact_phone);
    if (data.address) formData.append('address', data.address);
    
    const response = await this.apiClient.post('/api/auth/register-charity', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return { success: true, message: response.data.message };
  }

  // --- Token Management ---
  private tokenKey = 'auth_token';

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey);
  }

  setToken(token: string, remember: boolean = false): void {
    if (remember) {
      localStorage.setItem(this.tokenKey, token);
    } else {
      sessionStorage.setItem(this.tokenKey, token);
    }
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

// Export a single instance of the service
export const authService = new AuthService();

