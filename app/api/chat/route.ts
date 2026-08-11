import { NextRequest, NextResponse } from 'next/server';
import { optimizePrompt } from '@/lib/compression/optimizer';
import { getCachedResponse, setCachedResponse } from '@/lib/redis/client';
import { searchSemanticKnowledge, storeKnowledgeIfEligible } from '@/lib/pinecone/client';
import { generateGeminiResponse } from '@/lib/gemini/client';
import { countTokens } from '@/lib/tokenizer/counter';
import {
  getSystemMetrics,
  recordMetricHit,
  recordMetricMiss,
  incrementKnowledgeBaseCount,
} from '@/lib/utils/metrics';
import { MessageMetrics, ChatApiResponse } from '@/types';

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const originalPrompt = body?.prompt;

    if (!originalPrompt || typeof originalPrompt !== 'string' || !originalPrompt.trim()) {
      return NextResponse.json({ error: 'Prompt string is required' }, { status: 400 });
    }

    // Step 1: Prompt Compression & Normalization
    const compression = await optimizePrompt(originalPrompt);
    const { originalTokens, optimizedTokens, tokensSaved: compressionTokensSaved, normalizedPrompt, optimizedPrompt } = compression;

    // Step 2: Upstash Redis Exact Cache Match
    const exactCacheMatch = await getCachedResponse(normalizedPrompt);
    if (exactCacheMatch) {
      const responseTimeMs = Date.now() - startTime;
      const responseTokens = countTokens(exactCacheMatch);
      
      // Total tokens saved = prompt tokens saved by not sending raw prompt + LLM output tokens saved
      const totalTokensSaved = compressionTokensSaved + responseTokens;
      recordMetricHit('Redis Cache', totalTokensSaved);

      const metrics: MessageMetrics = {
        source: 'Redis Cache',
        originalPromptTokens: originalTokens,
        optimizedPromptTokens: optimizedTokens,
        tokensSaved: totalTokensSaved,
        similarityScore: 100,
        llmCalled: false,
        responseTimeMs,
        responseTokens,
      };

      const responsePayload: ChatApiResponse = {
        id: 'msg-' + Date.now(),
        response: exactCacheMatch,
        metrics,
        systemMetrics: getSystemMetrics(),
      };

      return NextResponse.json(responsePayload);
    }

    // Step 3: Pinecone Vector Database Semantic Retrieval
    const semanticMatch = await searchSemanticKnowledge(optimizedPrompt, 0.70);
    if (semanticMatch.match) {
      const responseTimeMs = Date.now() - startTime;
      const storedResponse = semanticMatch.match.response;
      const responseTokens = countTokens(storedResponse);
      const similarityPercent = Math.round(semanticMatch.similarity * 100);

      const totalTokensSaved = compressionTokensSaved + responseTokens;
      recordMetricHit('Vector Database', totalTokensSaved);

      // Also prime Redis exact cache with this match for ultra fast subsequent queries
      await setCachedResponse(normalizedPrompt, storedResponse);

      const metrics: MessageMetrics = {
        source: 'Vector Database',
        originalPromptTokens: originalTokens,
        optimizedPromptTokens: optimizedTokens,
        tokensSaved: totalTokensSaved,
        similarityScore: similarityPercent,
        llmCalled: false,
        responseTimeMs,
        responseTokens,
      };

      const responsePayload: ChatApiResponse = {
        id: 'msg-' + Date.now(),
        response: storedResponse,
        metrics,
        systemMetrics: getSystemMetrics(),
      };

      return NextResponse.json(responsePayload);
    }

    // Step 4: Gemini LLM Generation (Fallback when Redis & Vector DB Miss)
    const llmResponseText = await generateGeminiResponse(optimizedPrompt);
    const responseTimeMs = Date.now() - startTime;
    const responseTokens = countTokens(llmResponseText);

    recordMetricMiss(compressionTokensSaved);

    // Step 5: Intelligent Storage Rules
    // Store in exact cache (Redis)
    await setCachedResponse(normalizedPrompt, llmResponseText);

    // Store in semantic vector store (Pinecone) if response passes quality rules
    const storageResult = await storeKnowledgeIfEligible(
      originalPrompt,
      optimizedPrompt,
      normalizedPrompt,
      llmResponseText,
      responseTokens
    );

    if (storageResult.stored) {
      incrementKnowledgeBaseCount();
    }

    const metrics: MessageMetrics = {
      source: 'LLM',
      originalPromptTokens: originalTokens,
      optimizedPromptTokens: optimizedTokens,
      tokensSaved: compressionTokensSaved,
      similarityScore: undefined,
      llmCalled: true,
      responseTimeMs,
      responseTokens,
    };

    const responsePayload: ChatApiResponse = {
      id: 'msg-' + Date.now(),
      response: llmResponseText,
      metrics,
      systemMetrics: getSystemMetrics(),
    };

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error('Chat API Handler Error:', error);
    return NextResponse.json(
      { error: error?.message || 'An internal error occurred processing your request.' },
      { status: 500 }
    );
  }
}
