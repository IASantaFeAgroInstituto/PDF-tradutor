export interface User {
  id: string;
  email: string;
  name: string;
}

export interface TranslationJob {
  id: string;
  fileName: string;
  sourceLanguage: string;
  targetLanguage: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  createdAt: Date;
  translatedUrl?: string; // URL to download the translated file
  originalSize?: number;
  translatedSize?: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface GlossaryEntry {
  id: string;
  sourceText: string;
  targetText: string;
  context?: string;
  category?: string;
  createdAt: Date;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  sourceLanguage: string;
  targetLanguage: string;
  entries: GlossaryEntry[];
  createdAt: Date;
  updatedAt: Date;
}