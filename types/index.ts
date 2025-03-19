export interface User {
    _id: string;
    name: string;
    email: string;
    password: string; // Note: This should not be exposed in client-side code
    role: 'admin' | 'firm' | 'lawyer' | 'legal_researcher' | 'judge' | 'legal_professional';
    firmId?: string; // Reference to the firm for lawyers
    lawyers?: string[]; // Array of lawyer IDs for firms
    createdAt: string;
    updatedAt: string;
}

export interface Case {
    updatedAt: string;
    _id: string;
    caseTitle: string;
    caseNumber: string;
    description?: string;
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
    creator: string | User;
    caseOwner: string | User;
    assignedLawyer?: string | User; // Reference to assigned lawyer
    firm?: string | User; // Reference to firm
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