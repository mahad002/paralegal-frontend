import { fetchAPI } from './fetchAPI';
import type { Case } from '@/types';

// Utility function to handle API responses safely
async function handleAPI<T>(apiCall: Promise<T>): Promise<T | { error: string }> {
  try {
    return await apiCall;
  } catch (error) {
    console.error('API Error:', error);
    return { error: error instanceof Error ? error.message : 'An unexpected error occurred' };
  }
}

// 🔹 Fetch all cases (Admin & Firm Users)
export const getAllCases = async (): Promise<Case[] | { error: string }> => {
  console.log("Fetching all cases...");
  return handleAPI(fetchAPI('/cases', { method: 'GET' }));
};

// 🔹 Fetch a specific case by ID
export const getCaseById = async (id: string): Promise<Case | { error: string }> => {
  console.log(`Fetching case by ID: ${id}`);
  return handleAPI(fetchAPI(`/cases/${id}`, { method: 'GET' }));
};

// 🔹 Create a new case
export const createCase = async (caseData: Partial<Case>): Promise<Case | { error: string }> => {
  console.log("Creating new case with data:", caseData);
  return handleAPI(fetchAPI('/cases', {
    method: 'POST',
    body: JSON.stringify(caseData),
  }));
};

// 🔹 Update an existing case
export const updateCase = async (id: string, caseData: Partial<Case>): Promise<Case | { error: string }> => {
  console.log(`Updating case ID: ${id}`, caseData);
  return handleAPI(fetchAPI(`/cases/${id}`, {
    method: 'PUT',
    body: JSON.stringify(caseData),
  }));
};

// 🔹 Delete a case (Admin Only)
export const deleteCase = async (id: string): Promise<{ message: string } | { error: string }> => {
  console.log(`Deleting case ID: ${id}`);
  return handleAPI(fetchAPI(`/cases/${id}`, { method: 'DELETE' }));
};

// 🔹 Get Cases by User
export const getCasesByUser = async (userId: string): Promise<Case[] | { error: string }> => {
  if (!userId) {
    console.error("Error: User ID is missing while fetching cases.");
    return { error: "User ID is missing" };
  }

  console.log(`Fetching cases for user ID: ${userId}`);
  return handleAPI(fetchAPI(`/cases/user/${userId}`, { method: 'GET' }));
};

// 🔹 Get Cases by Firm (Firm Users Only)
export const getCasesByFirm = async (): Promise<Case[] | { error: string }> => {
  console.log("Fetching cases for firm...");
  return handleAPI(fetchAPI('/cases/firm/lawyers-cases', { method: 'GET' }));
};

// 🔹 Revert Case to Specific Commit
export const revertCaseToCommit = async (caseId: string, commitId: string): Promise<{ message: string } | { error: string }> => {
  console.log(`Reverting case ID: ${caseId} to commit ID: ${commitId}`);
  return handleAPI(fetchAPI(`/cases/revert/${caseId}/${commitId}`, { method: 'POST' }));
};
