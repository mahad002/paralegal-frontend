export interface User {
    _id: string;
    name: string;
    email: string;
    password: string; // Note: This should not be exposed in client-side code
    role: 'admin' | 'legal_researcher' | 'lawyer' | 'judge' | 'legal_professional';
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Case {
    _id: string;
    caseTitle: string;
    caseNumber: string;
    description?: string;
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
    creator: string | User;
    caseOwner: string | User;
    parties: {
      plaintiff?: {
        name?: string;
        identification?: string;
      };
      defendant?: {
        name?: string;
        identification?: string;
      };
    };
    documents: Array<{
      documentType: string;
      documentNumber: string;
      executionDate: string;
    }>;
    commits: string[] | CaseCommit[];
    chatHistory: {
      assistanceBot: string[] | ChatHistory[];
    };
    createdAt: string;
  }
  
  export interface CaseCommit {
    _id: string;
    case: string | Case;
    user: string | User;
    commitTitle: string;
    commitDescription?: string;
    snapshot: unknown;
    timestamp: string;
  }
  
  export interface CaseNote {
    _id: string;
    case: string | Case;
    createdBy: string | User;
    citations: string[];
    facts: string[];
    statutes: {
      acts: string[];
      sections: string[];
      articles: string[];
    };
    precedents: string[];
    ratio: string[];
    rulings: string[];
    context?: string;
    createdAt: string;
  }
  
  export interface ChatHistory {
    _id: string;
    caseId?: string;
    botType: 'Assistance' | 'Compliance';
    userId: string;
    messages: Array<{
      sender: 'user' | 'bot';
      message: string;
      timestamp: string;
    }>;
    createdAt: string;
  }
  
  export interface LoginResponse {
    token: string;
    user: User;
  }
  
  export interface ApiError {
    message: string;
    status?: number;
  }
  
  