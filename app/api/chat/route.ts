import { NextRequest, NextResponse } from 'next/server';
import { optimizePrompt } from '@/lib/compression/optimizer';
import { getCachedResponse, setCachedResponse } from '@/lib/redis/client';
import { searchSemanticKnowledge, storeKnowledgeIfEligible } from '@/lib/pinecone/client';
import { generateGeminiResponse } from '@/lib/gemini/client';
import { countTokens } from '@/lib/tokenizer/counter';
import { saveMessageDirect, fetchAnalyticsFromPostgres } from '@/lib/postgres/db';
import { MessageMetrics, ChatApiResponse } from '@/types';

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const originalPrompt = body?.prompt;
    const userId = body?.userId;
    const conversationId = body?.conversationId || 'conv-' + (userId ? userId.slice(0, 8) : 'default');

    if (!userId || typeof userId !== 'string' || !userId.trim()) {
      return NextResponse.json(
        { error: 'Unauthorized: Valid user ID is required to process requests.' },
        { status: 401 }
      );
    }

    if (!originalPrompt || typeof originalPrompt !== 'string' || !originalPrompt.trim()) {
      return NextResponse.json({ error: 'Prompt string is required' }, { status: 400 });
    }

    // Step 1: Prompt Compression & Normalization
    const compression = await optimizePrompt(originalPrompt);
    const { originalTokens, optimizedTokens, tokensSaved: compressionTokensSaved, normalizedPrompt, optimizedPrompt } = compression;

    // Helper to get updated user-isolated metrics directly from PostgreSQL
    const getUserMetrics = async () => {
      return await fetchAnalyticsFromPostgres(userId);
    };

    // Step 2: Upstash Redis Exact Cache Match
    const exactCacheMatch = await getCachedResponse(normalizedPrompt);
    if (exactCacheMatch) {
      const responseTimeMs = Date.now() - startTime;
      const responseTokens = countTokens(exactCacheMatch);
      const totalTokensSaved = compressionTokensSaved + responseTokens;

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

      // Persist to Neon Postgres (Message, Conversation, User, SystemAnalytics per userId)
      await saveMessageDirect(originalPrompt, exactCacheMatch, metrics, conversationId, userId);

      const userMetrics = await getUserMetrics();

      const responsePayload: ChatApiResponse = {
        id: 'msg-' + Date.now(),
        response: exactCacheMatch,
        metrics,
        systemMetrics: userMetrics,
      };

      return NextResponse.json(responsePayload);
    }

    // Step 3: Pinecone Vector Database Semantic Retrieval (> 90% Similarity Threshold)
    const semanticMatch = await searchSemanticKnowledge(optimizedPrompt, 0.90);
    if (semanticMatch.match) {
      const responseTimeMs = Date.now() - startTime;
      const storedResponse = semanticMatch.match.response;
      const responseTokens = countTokens(storedResponse);
      const similarityPercent = Math.round(semanticMatch.similarity * 100);
      const totalTokensSaved = compressionTokensSaved + responseTokens;

      // Prime Redis exact cache with this match
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

      // Persist to Neon Postgres (Message, Conversation, User, SystemAnalytics per userId)
      await saveMessageDirect(originalPrompt, storedResponse, metrics, conversationId, userId);

      const userMetrics = await getUserMetrics();

      const responsePayload: ChatApiResponse = {
        id: 'msg-' + Date.now(),
        response: storedResponse,
        metrics,
        systemMetrics: userMetrics,
      };

      return NextResponse.json(responsePayload);
    }

    // Step 4: Gemini LLM Generation (Fallback when Redis & Vector DB Miss)
    const llmResponseText = await generateGeminiResponse(optimizedPrompt);
    const responseTimeMs = Date.now() - startTime;
    const responseTokens = countTokens(llmResponseText);

    // Step 5: Intelligent Storage Rules
    await setCachedResponse(normalizedPrompt, llmResponseText);

    await storeKnowledgeIfEligible(
      originalPrompt,
      optimizedPrompt,
      normalizedPrompt,
      llmResponseText,
      responseTokens
    );

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

    // Persist to Neon Postgres (Message, Conversation, User, SystemAnalytics per userId)
    await saveMessageDirect(originalPrompt, llmResponseText, metrics, conversationId, userId);

    const userMetrics = await getUserMetrics();

    const responsePayload: ChatApiResponse = {
      id: 'msg-' + Date.now(),
      response: llmResponseText,
      metrics,
      systemMetrics: userMetrics,
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
