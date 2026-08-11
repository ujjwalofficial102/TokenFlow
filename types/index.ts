export type MessageSource = 'LLM' | 'Redis Cache' | 'Vector Database';

export interface MessageMetrics {
  source: MessageSource;
  originalPromptTokens: number;
  optimizedPromptTokens: number;
  tokensSaved: number;
  similarityScore?: number; // percentage (0 - 100) or decimal (0 - 1)
  llmCalled: boolean;
  responseTimeMs: number;
  responseTokens: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  originalPrompt?: string;
  optimizedPrompt?: string;
  normalizedPrompt?: string;
  metrics?: MessageMetrics;
  createdAt: string;
}

export interface SystemMetrics {
  cacheHits: number;
  cacheMisses: number;
  totalLLMCallsSaved: number;
  totalRequestsProcessed: number;
  totalTokensSaved: number;
  totalKnowledgeBaseItems: number;
}

export interface KnowledgeRecord {
  id: string;
  originalPrompt: string;
  optimizedPrompt: string;
  normalizedPrompt: string;
  response: string;
  responseTokens: number;
  timesRetrieved: number;
  createdAt: string;
  lastAccessed: string;
}

export interface CompressionResult {
  originalPrompt: string;
  optimizedPrompt: string;
  normalizedPrompt: string;
  originalTokens: number;
  optimizedTokens: number;
  tokensSaved: number;
}

export interface ChatApiResponse {
  id: string;
  response: string;
  metrics: MessageMetrics;
  systemMetrics: SystemMetrics;
}
