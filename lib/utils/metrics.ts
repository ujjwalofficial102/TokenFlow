import { SystemMetrics } from '@/types';
import { getMemoryKnowledgeCount } from '../pinecone/client';

let currentMetrics: SystemMetrics = {
  cacheHits: 0,
  cacheMisses: 0,
  totalLLMCallsSaved: 0,
  totalRequestsProcessed: 0,
  totalTokensSaved: 0,
  totalKnowledgeBaseItems: 0,
};

export function getSystemMetrics(): SystemMetrics {
  return {
    ...currentMetrics,
    totalKnowledgeBaseItems: Math.max(currentMetrics.totalKnowledgeBaseItems, getMemoryKnowledgeCount()),
  };
}

export function recordMetricHit(type: 'Redis Cache' | 'Vector Database', tokensSaved: number) {
  currentMetrics.totalRequestsProcessed += 1;
  currentMetrics.cacheHits += 1;
  currentMetrics.totalLLMCallsSaved += 1;
  currentMetrics.totalTokensSaved += tokensSaved;
}

export function recordMetricMiss(tokensSavedFromCompression: number) {
  currentMetrics.totalRequestsProcessed += 1;
  currentMetrics.cacheMisses += 1;
  currentMetrics.totalTokensSaved += tokensSavedFromCompression;
}

export function incrementKnowledgeBaseCount() {
  currentMetrics.totalKnowledgeBaseItems += 1;
}
