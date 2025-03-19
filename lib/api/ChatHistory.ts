import { fetchAPI } from './fetchAPI';
import type { ChatHistory } from '@/types';

// Utility function to handle errors gracefully
async function handleAPI<T>(apiCall: Promise<T>): Promise<T | { error: string }> {
  try {
    return await apiCall;
  } catch (error) {
    console.error('API Error:', error);
    return { error: error instanceof Error ? error.message : 'An unexpected error occurred' };
  }
}

// Get Assistance Bot Chats for a Specific Case
// Request Param: caseId
// Returns: Array of ChatHistory objects or { error: string }
export const getAssistanceChatHistory = async (caseId: string): Promise<ChatHistory[] | { error: string }> =>
  handleAPI(fetchAPI(`/chat-history/assistance/${caseId}`, { method: 'GET' }));

// Add Assistance Bot Chat to a Case
// Request Param: caseId
// Request Body: { messages }
// Returns: Created ChatHistory object or { error: string }
export const addAssistanceChatHistory = async (caseId: string, chatData: Partial<ChatHistory>): Promise<ChatHistory | { error: string }> =>
  handleAPI(fetchAPI(`/chat-history/assistance/${caseId}`, {
    method: 'POST',
    body: JSON.stringify(chatData),
  }));

// Get Compliance Bot Chats for a User
// Returns: Array of ChatHistory objects or { error: string }
export const getComplianceChatHistory = async (): Promise<ChatHistory[] | { error: string }> =>
  handleAPI(fetchAPI('/chat-history/compliance', { method: 'GET' }));

// Add Compliance Bot Chat for a User
// Request Body: { messages }
// Returns: Created ChatHistory object or { error: string }
export const addComplianceChatHistory = async (chatData: Partial<ChatHistory>): Promise<ChatHistory | { error: string }> =>
  handleAPI(fetchAPI('/chat-history/compliance', {
    method: 'POST',
    body: JSON.stringify(chatData),
  }));
