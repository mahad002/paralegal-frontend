const API_URL = process.env.API_URL || 'https://paralegal-backend.onrender.com';

import type {
  User,
  Case,
  CaseNote,
  ChatHistory,
  CaseCommit,
  LoginResponse,
} from '@/types';

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`API Error [${response.status}]:`, data);
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('Network or Server Error:', error);
    throw new Error('Something went wrong. Please try again later.');
  }
}

export const api = {
  // Authentication Routes
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return fetchAPI<LoginResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getCurrentUser: async (token: string): Promise<User> => {
    try {
      const data = await fetchAPI<{ user: User }>('/users/me', { method: 'GET' });
      return data.user;
    } catch (error) {
      console.error('Failed to fetch the current user:', error);
      throw error;
    }
  },

  signup: async (name: string, email: string, password: string, role: User['role']): Promise<{ message: string }> => {
    return fetchAPI('/users/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
  },

  // Password Management Routes
  forgotPassword: async (email: string): Promise<{ resetToken: string; message: string }> => {
    return fetchAPI('/users/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (resetToken: string, newPassword: string): Promise<{ message: string }> => {
    return fetchAPI('/users/reset-password', {
      method: 'POST',
      body: JSON.stringify({ resetToken, newPassword }),
    });
  },

  // Admin User Management Routes
  getAllUsers: async (): Promise<User[]> => {
    return fetchAPI('/users', { method: 'GET' });
  },

  getUserById: async (id: string): Promise<User> => {
    return fetchAPI(`/users/${id}`, { method: 'GET' });
  },

  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    return fetchAPI(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  deleteUser: async (id: string): Promise<{ message: string }> => {
    return fetchAPI(`/users/${id}`, { method: 'DELETE' });
  },

  // Firm Management Routes
  getFirmLawyers: async (): Promise<User[]> => {
    return fetchAPI('/users/lawyers', { method: 'GET' });
  },

  addLawyerToFirm: async (data: {
    lawyerId?: string;
    name?: string;
    email?: string;
    password?: string;
  }): Promise<{ message: string }> => {
    return fetchAPI('/users/lawyers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  removeLawyerFromFirm: async (lawyerId: string): Promise<{ message: string }> => {
    return fetchAPI(`/users/lawyers/${lawyerId}`, { method: 'DELETE' });
  },

  getFirmCases: async (): Promise<Case[]> => {
    return fetchAPI('/firm/cases', { method: 'GET' });
  },

  assignLawyerToCase: async (caseId: string, lawyerId: string): Promise<{ message: string }> => {
    return fetchAPI(`/firm/cases/${caseId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ lawyerId }),
    });
  },

  // Lawyer Routes
  getLawyerCases: async (): Promise<Case[]> => {
    return fetchAPI('/lawyer/cases', { method: 'GET' });
  },

  updateLawyerProfile: async (profileData: Partial<User>): Promise<User> => {
    return fetchAPI('/lawyer/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Case Management Routes
  getCases: async (userId: string): Promise<Case[]> => {
    return fetchAPI(`/cases/user/${userId}`, { method: 'GET' });
  },

  getCasesCount: async (userId: string): Promise<{ activeCases: number; recentNotesCount: number }> => {
    const cases = await fetchAPI<Case[]>(`/cases/user/${userId}`, { method: 'GET' });
    const activeCases = cases.length;
    const recentNotesCount = cases.length > 0 ? (await api.getCaseNotes(cases[0]._id)).length : 0;
    return { activeCases, recentNotesCount };
  },

  getCase: async (id: string): Promise<Case> => {
    return fetchAPI(`/cases/${id}`, { method: 'GET' });
  },

  createCase: async (caseData: Partial<Case>): Promise<Case> => {
    return fetchAPI('/cases', {
      method: 'POST',
      body: JSON.stringify(caseData),
    });
  },

  updateCase: async (id: string, caseData: Partial<Case>): Promise<Case> => {
    return fetchAPI(`/cases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(caseData),
    });
  },

  deleteCase: async (id: string): Promise<{ message: string }> => {
    return fetchAPI(`/cases/${id}`, { method: 'DELETE' });
  },

  getAllCases: async (): Promise<Case[]> => {
    return fetchAPI('/cases', { method: 'GET' });
  },

  // Case Commit Routes
  getCaseCommits: async (caseId: string): Promise<CaseCommit[]> => {
    return fetchAPI(`/case-commits/${caseId}`, { method: 'GET' });
  },

  addCaseCommit: async (caseId: string, commitData: Partial<CaseCommit>): Promise<CaseCommit> => {
    return fetchAPI(`/case-commits/${caseId}`, {
      method: 'POST',
      body: JSON.stringify(commitData),
    });
  },

  // Case Note Routes
  getCaseNotes: async (caseId: string): Promise<CaseNote[]> => {
    return fetchAPI(`/case-notes/${caseId}`, { method: 'GET' });
  },

  getCaseNoteById: async (noteId: string): Promise<CaseNote> => {
    return fetchAPI(`/case-notes/note/${noteId}`, { method: 'GET' });
  },

  addCaseNote: async (caseId: string, noteData: Partial<CaseNote>): Promise<CaseNote> => {
    return fetchAPI(`/case-notes/${caseId}`, {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  },

  updateCaseNote: async (noteId: string, noteData: Partial<CaseNote>): Promise<CaseNote> => {
    return fetchAPI(`/case-notes/note/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    });
  },

  deleteCaseNote: async (noteId: string): Promise<{ message: string }> => {
    return fetchAPI(`/case-notes/note/${noteId}`, { method: 'DELETE' });
  },

  // Chat History Routes
  getChatHistoryForAssistanceBot: async (caseId: string): Promise<ChatHistory[]> => {
    return fetchAPI(`/chat-history/assistance/${caseId}`, { method: 'GET' });
  },

  addChatHistoryForAssistanceBot: async (caseId: string, chatData: Partial<ChatHistory>): Promise<ChatHistory> => {
    return fetchAPI(`/chat-history/assistance/${caseId}`, {
      method: 'POST',
      body: JSON.stringify(chatData),
    });
  },

  getChatHistoryForComplianceBot: async (): Promise<ChatHistory[]> => {
    return fetchAPI('/chat-history/compliance', { method: 'GET' });
  },

  addChatHistoryForComplianceBot: async (chatData: Partial<ChatHistory>): Promise<ChatHistory> => {
    return fetchAPI('/chat-history/compliance', {
      method: 'POST',
      body: JSON.stringify(chatData),
    });
  },

  // Analytics Routes
  getCaseAnalytics: async (): Promise<{
    totalCases: number;
    activeCases: number;
    resolvedCases: number;
    averageResolutionTime: number;
  }> => {
    return fetchAPI('/analytics/cases', { method: 'GET' });
  },

  getLawyerAnalytics: async (): Promise<{
    totalLawyers: number;
    activeLawyers: number;
    averageCaseLoad: number;
  }> => {
    return fetchAPI('/analytics/lawyers', { method: 'GET' });
  },

  // Document Management Routes
  uploadDocument: async (caseId: string, formData: FormData): Promise<{ url: string }> => {
    return fetchAPI(`/documents/${caseId}/upload`, {
      method: 'POST',
      body: formData,
      headers: {}, // Let the browser set the correct Content-Type for FormData
    });
  },

  getDocuments: async (caseId: string): Promise<Array<{ url: string; name: string; type: string }>> => {
    return fetchAPI(`/documents/${caseId}`, { method: 'GET' });
  },

  deleteDocument: async (caseId: string, documentId: string): Promise<{ message: string }> => {
    return fetchAPI(`/documents/${caseId}/${documentId}`, { method: 'DELETE' });
  },
};