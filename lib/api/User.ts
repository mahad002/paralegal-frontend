import { fetchAPI } from './fetchAPI';
import type { User, LoginResponse } from '@/types';

// Utility function to handle API responses safely
async function handleAPI<T>(apiCall: Promise<T>): Promise<T | { error: string }> {
  try {
    return await apiCall;
  } catch (error) {
    console.error('API Error:', error);
    return { error: error instanceof Error ? error.message : 'An unexpected error occurred' };
  }
}

// 🔹 **Login User**
// Returns: { token, user } or { error }
export const login = async (email: string, password: string): Promise<LoginResponse | { error: string }> =>
  handleAPI(fetchAPI('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }));

// 🔹 **Get Currently Authenticated User**
// Returns: { user } or { error }
export const getCurrentUser = async (): Promise<User | { error: string }> => {
  const response: { success?: boolean; user?: User; error?: string } = await fetchAPI('/users/me', { method: 'GET' });

  console.log("Current User Response:", response);

  if (response?.success && response.user) {
    return response.user;
  }

  return { error: response?.error || 'Failed to fetch user' };
};

// 🔹 **Register a New User**
// Request: { name, email, password, role }
// Returns: { message } or { error }
export const signup = async (name: string, email: string, password: string, role: User['role']): Promise<{ message: string } | { error: string }> =>
  handleAPI(fetchAPI('/users/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role }),
  }));

// 🔹 **Forgot Password**
export const forgotPassword = async (email: string): Promise<{ resetToken: string; message: string } | { error: string }> =>
  handleAPI(fetchAPI('/users/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }));

// 🔹 **Reset Password**
export const resetPassword = async (resetToken: string, newPassword: string): Promise<{ message: string } | { error: string }> =>
  handleAPI(fetchAPI('/users/reset-password', {
    method: 'POST',
    body: JSON.stringify({ resetToken, newPassword }),
  }));
// 🔹 **Get All Users (Admin Only)**
// Returns: Array of Users or { error }
export const getAllUsers = async (): Promise<User[] | { error: string }> =>
  handleAPI(fetchAPI('/users/getAllUsers', { method: 'GET' }));

// 🔹 **Get User by ID**
export const getUserById = async (id: string): Promise<User | { error: string }> =>
  handleAPI(fetchAPI(`/users/${id}`, { method: 'GET' }));

// 🔹 **Update User Details**
export const updateUser = async (id: string, userData: Partial<User>): Promise<User | { error: string }> =>
  handleAPI(fetchAPI(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }));

// 🔹 **Delete User (Admin Only)**
export const deleteUser = async (id: string): Promise<{ message: string } | { error: string }> =>
  handleAPI(fetchAPI(`/users/${id}`, { method: 'DELETE' }));

// Lawyer Management APIs for Firms
// Get lawyers under a firm
// Returns: Array of User objects (Lawyers) or { error: string }
export const getFirmLawyers = async (): Promise<User[] | { error: string }> =>
  handleAPI(fetchAPI('/users/lawyers', { method: 'GET' }));

// 🔹 **Add an Existing Lawyer to a Firm**
// Request: { lawyerId }
// Returns: { message } or { error }
export const addExistingLawyerToFirm = async (lawyerId: string): Promise<{ message: string } | { error: string }> =>
  handleAPI(fetchAPI('/users/lawyers/add', {
    method: 'POST',
    body: JSON.stringify({ lawyerId }),
  }));

// 🔹 **Register a New Lawyer Under a Firm**
// Request: { name, email, password }
// Returns: { message, lawyer } or { error }
export const registerLawyerThroughFirm = async (name: string, email: string, password: string): Promise<{ message: string; lawyer?: User } | { error: string }> =>
  handleAPI(fetchAPI('/users/lawyers/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  }));

// 🔹 **Remove a Lawyer from a Firm**
// Request: { lawyerId }
// Returns: { message } or { error }
export const removeLawyerFromFirm = async (lawyerId: string): Promise<{ message: string } | { error: string }> =>
  handleAPI(fetchAPI(`/users/lawyers/${lawyerId}`, { method: 'DELETE' }));
