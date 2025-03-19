import { fetchAPI } from './fetchAPI';
import type { CaseCommit } from '@/types';

// Utility function to handle errors gracefully
async function handleAPI<T>(apiCall: Promise<T>): Promise<T | { error: string }> {
  try {
    return await apiCall;
  } catch (error) {
    console.error('API Error:', error);
    return { error: error instanceof Error ? error.message : 'An unexpected error occurred' };
  }
}

// Get all commits for a specific case (Paginated)
// Request Param: caseId
// Returns: { commits: CaseCommit[], totalPages: number } or { error: string }
export const getCaseCommits = async (caseId: string): Promise<{ commits: CaseCommit[], totalPages: number } | { error: string }> =>
  handleAPI(fetchAPI(`/case-commits/case/${caseId}`, { method: 'GET' }));

// Get a specific commit by ID
// Request Param: commitId
// Returns: CaseCommit object or { error: string }
export const getCommitById = async (commitId: string): Promise<CaseCommit | { error: string }> =>
  handleAPI(fetchAPI(`/case-commits/${commitId}`, { method: 'GET' }));

// Get all commits (Admin Only)
// Returns: { commits: CaseCommit[], totalPages: number } or { error: string }
export const getAllCommits = async (): Promise<{ commits: CaseCommit[], totalPages: number } | { error: string }> =>
  handleAPI(fetchAPI('/case-commits', { method: 'GET' }));

// Add a new commit to a case
// Request Param: caseId
// Request Body: { commitTitle, commitDescription, snapshot }
// Returns: Created CaseCommit object or { error: string }
export const addCaseCommit = async (caseId: string, data: Partial<CaseCommit>): Promise<CaseCommit | { error: string }> =>
  handleAPI(fetchAPI(`/case-commits/case/${caseId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  }));

// Revert a case to a specific commit
// Request Params: caseId, commitId
// Returns: { message: 'Case reverted successfully', commit: CaseCommit } or { error: string }
export const revertToCommit = async (caseId: string, commitId: string): Promise<{ message: string, commit: CaseCommit } | { error: string }> =>
  handleAPI(fetchAPI(`/case-commits/revert/${caseId}/${commitId}`, { method: 'POST' }));

// Delete a commit (Admin Only)
// Request Param: commitId
// Returns: { message: 'Commit deleted successfully' } or { error: string }
export const deleteCommit = async (commitId: string): Promise<{ message: string } | { error: string }> =>
  handleAPI(fetchAPI(`/case-commits/${commitId}`, { method: 'DELETE' }));
