import { NextRequest, NextResponse } from 'next/server';
import { fetchAnalyticsFromPostgres } from '@/lib/postgres/db';
import { getMemoryKnowledgeCount } from '@/lib/pinecone/client';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      {
        cacheHits: 0,
        cacheMisses: 0,
        totalLLMCallsSaved: 0,
        totalRequestsProcessed: 0,
        totalTokensSaved: 0,
        totalKnowledgeBaseItems: getMemoryKnowledgeCount(),
      },
      { status: 200 }
    );
  }

  // Fetch analytics strictly filtered for the requesting authenticated user
  const userMetrics = await fetchAnalyticsFromPostgres(userId);
  return NextResponse.json(userMetrics);
}
