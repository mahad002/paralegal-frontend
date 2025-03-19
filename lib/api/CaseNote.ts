import { fetchAPI } from './fetchAPI';
import type { CaseNote } from '@/types';

// Utility function to handle errors gracefully
async function handleAPI<T>(apiCall: Promise<T>): Promise<T | { error: string }> {
  try {
    return await apiCall;
  } catch (error) {
    console.error('API Error:', error);
    return { error: error instanceof Error ? error.message : 'An unexpected error occurred' };
  }
}

// Get all notes for a specific case
export const getCaseNotes = async (caseId: string): Promise<CaseNote[] | { error: string }> =>
  handleAPI(fetchAPI(`/case-notes/${caseId}`, { method: 'GET' }));

// Get a specific note by ID
export const getCaseNoteById = async (noteId: string): Promise<CaseNote | { error: string }> =>
  handleAPI(fetchAPI(`/case-notes/note/${noteId}`, { method: 'GET' }));

// Add a new note to a case
export const addCaseNote = async (caseId: string, noteData: Partial<CaseNote>): Promise<CaseNote | { error: string }> =>
  handleAPI(fetchAPI(`/case-notes/${caseId}`, {
    method: 'POST',
    body: JSON.stringify(noteData),
  }));

// Update a case note
export const updateCaseNote = async (noteId: string, noteData: Partial<CaseNote>): Promise<CaseNote | { error: string }> =>
  handleAPI(fetchAPI(`/case-notes/note/${noteId}`, {
    method: 'PUT',
    body: JSON.stringify(noteData),
  }));

// Delete a case note
export const deleteCaseNote = async (noteId: string): Promise<{ message: string } | { error: string }> =>
  handleAPI(fetchAPI(`/case-notes/note/${noteId}`, { method: 'DELETE' }));

// Analyze case note content
export const analyzeCaseNote = async (content: string): Promise<any | { error: string }> =>
  handleAPI(fetchAPI('/case-notes/analyze', {
    method: 'POST',
    body: JSON.stringify({ content }),
  }));

// Get case note statistics
export const getCaseNoteStats = async (caseId: string): Promise<any | { error: string }> =>
  handleAPI(fetchAPI(`/case-notes/stats/${caseId}`, { method: 'GET' }));