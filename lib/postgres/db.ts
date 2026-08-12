import { Pool } from 'pg';
import { MessageMetrics, SystemMetrics } from '@/types';
import { getMemoryKnowledgeCount } from '../pinecone/client';

const connectionString = process.env.DATABASE_URL;

let pool: Pool | null = null;

if (connectionString && !connectionString.includes('sample.us-east-1')) {
  try {
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  } catch (err) {
    console.warn('[PostgreSQL Pool Init Warning]:', err);
  }
}

/**
 * Direct PostgreSQL Query Helper
 */
export async function query(text: string, params?: any[]) {
  if (!pool) return null;
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

/**
 * Upserts user profile in "User" table upon login
 */
export async function upsertUserDirect(
  id: string,
  email: string | null,
  displayName: string | null,
  photoUrl: string | null
) {
  if (!pool || !id) return;

  const sql = `
    INSERT INTO "User" ("id", "email", "displayName", "photoUrl", "createdAt")
    VALUES ($1, $2, $3, $4, NOW())
    ON CONFLICT ("id") DO UPDATE SET
      "email" = EXCLUDED."email",
      "displayName" = EXCLUDED."displayName",
      "photoUrl" = EXCLUDED."photoUrl";
  `;

  try {
    await query(sql, [id, email || null, displayName || null, photoUrl || null]);
    console.log(`[Neon Postgres] Upserted User record "${id}" (${displayName || email})`);
  } catch (err) {
    console.warn('[Neon Postgres User Upsert Warning]:', err);
  }
}

/**
 * Ensures a Conversation record exists for the given user
 */
export async function ensureConversationDirect(
  conversationId: string,
  userId: string,
  title = 'New Chat'
) {
  if (!pool || !conversationId || !userId) return;

  const sql = `
    INSERT INTO "Conversation" ("id", "userId", "title", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, NOW(), NOW())
    ON CONFLICT ("id") DO UPDATE SET "updatedAt" = NOW();
  `;

  try {
    // Ensure user exists first
    await query(
      `INSERT INTO "User" ("id", "email", "displayName", "createdAt") VALUES ($1, $2, $3, NOW()) ON CONFLICT ("id") DO NOTHING;`,
      [userId, null, 'User']
    );

    await query(sql, [conversationId, userId, title]);
    console.log(`[Neon Postgres] Ensured Conversation record "${conversationId}" for User "${userId}"`);
  } catch (err) {
    console.warn('[Neon Postgres Conversation Warning]:', err);
  }
}

/**
 * Saves a message record directly to PostgreSQL "Message" table linked strictly to user's conversation
 */
export async function saveMessageDirect(
  originalPrompt: string,
  response: string,
  metrics: MessageMetrics,
  conversationId: string,
  userId: string
) {
  if (!pool || !userId) return;

  const id = 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const targetConvId = conversationId || 'conv-' + userId.slice(0, 8);

  // Ensure conversation exists for this specific user
  await ensureConversationDirect(targetConvId, userId, originalPrompt.slice(0, 40));

  const insertQuery = `
    INSERT INTO "Message" (
      "id",
      "conversationId",
      "role",
      "content",
      "originalPrompt",
      "optimizedPrompt",
      "source",
      "originalPromptTokens",
      "optimizedPromptTokens",
      "tokensSaved",
      "similarityScore",
      "llmCalled",
      "responseTimeMs",
      "responseTokens",
      "createdAt"
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
  `;

  const values = [
    id,
    targetConvId,
    'assistant',
    response,
    originalPrompt,
    originalPrompt,
    metrics.source,
    metrics.originalPromptTokens,
    metrics.optimizedPromptTokens,
    metrics.tokensSaved,
    metrics.similarityScore ?? null,
    metrics.llmCalled,
    metrics.responseTimeMs,
    metrics.responseTokens,
  ];

  try {
    await query(insertQuery, values);
    console.log(`[Neon Postgres] Inserted Message "${id}" in Conversation "${targetConvId}" for User "${userId}"`);
    
    // Update user-level analytics record (keyed by userId, NOT 'global')
    await updateUserAnalyticsDirect(userId, metrics);
  } catch (err) {
    console.warn('[Neon Postgres Message Insert Warning]:', err);
  }
}

/**
 * Updates "SystemAnalytics" table in PostgreSQL strictly keyed by userId (NO GLOBAL RECORD)
 */
export async function updateUserAnalyticsDirect(userId: string, metrics: MessageMetrics) {
  if (!pool || !userId) return;

  const isHit = metrics.source === 'Redis Cache' || metrics.source === 'Vector Database';
  const isMiss = metrics.source === 'LLM';
  const llmSaved = metrics.llmCalled ? 0 : 1;
  const kbSize = getMemoryKnowledgeCount();

  const sql = `
    INSERT INTO "SystemAnalytics" (
      "id",
      "cacheHits",
      "cacheMisses",
      "totalLLMCallsSaved",
      "totalRequestsProcessed",
      "totalTokensSaved",
      "totalKnowledgeBaseItems",
      "updatedAt"
    ) VALUES (
      $1,
      $2, $3, $4, 1, $5, $6, NOW()
    )
    ON CONFLICT ("id") DO UPDATE SET
      "cacheHits" = "SystemAnalytics"."cacheHits" + EXCLUDED."cacheHits",
      "cacheMisses" = "SystemAnalytics"."cacheMisses" + EXCLUDED."cacheMisses",
      "totalLLMCallsSaved" = "SystemAnalytics"."totalLLMCallsSaved" + EXCLUDED."totalLLMCallsSaved",
      "totalRequestsProcessed" = "SystemAnalytics"."totalRequestsProcessed" + 1,
      "totalTokensSaved" = "SystemAnalytics"."totalTokensSaved" + EXCLUDED."totalTokensSaved",
      "totalKnowledgeBaseItems" = GREATEST("SystemAnalytics"."totalKnowledgeBaseItems", EXCLUDED."totalKnowledgeBaseItems"),
      "updatedAt" = NOW();
  `;

  try {
    await query(sql, [
      userId,
      isHit ? 1 : 0,
      isMiss ? 1 : 0,
      llmSaved,
      metrics.tokensSaved || 0,
      kbSize,
    ]);
    console.log(`[Neon Postgres] Updated User Analytics record for userId="${userId}"`);
  } catch (err) {
    console.warn('[Neon Postgres User Analytics Warning]:', err);
  }
}

/**
 * Fetches isolated analytics calculated STRICTLY for the given user ID (NO GLOBAL FALLBACK)
 */
export async function fetchAnalyticsFromPostgres(userId: string): Promise<SystemMetrics> {
  const defaultMetrics: SystemMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    totalLLMCallsSaved: 0,
    totalRequestsProcessed: 0,
    totalTokensSaved: 0,
    totalKnowledgeBaseItems: getMemoryKnowledgeCount(),
  };

  if (!pool || !userId) return defaultMetrics;

  try {
    const sql = `
      SELECT
        COUNT(*) FILTER (WHERE "source" IN ('Redis Cache', 'Vector Database'))::int AS "cacheHits",
        COUNT(*) FILTER (WHERE "source" = 'LLM')::int AS "cacheMisses",
        COUNT(*) FILTER (WHERE "llmCalled" = false)::int AS "totalLLMCallsSaved",
        COUNT(*)::int AS "totalRequestsProcessed",
        COALESCE(SUM("tokensSaved"), 0)::int AS "totalTokensSaved"
      FROM "Message"
      WHERE "conversationId" IN (SELECT "id" FROM "Conversation" WHERE "userId" = $1)
    `;

    const res = await query(sql, [userId]);

    if (res && res.rows.length > 0) {
      const row = res.rows[0];
      return {
        cacheHits: Number(row.cacheHits || 0),
        cacheMisses: Number(row.cacheMisses || 0),
        totalLLMCallsSaved: Number(row.totalLLMCallsSaved || 0),
        totalRequestsProcessed: Number(row.totalRequestsProcessed || 0),
        totalTokensSaved: Number(row.totalTokensSaved || 0),
        totalKnowledgeBaseItems: getMemoryKnowledgeCount(),
      };
    }
  } catch (err) {
    console.warn('[Neon Postgres Analytics Query Warning]:', err);
  }

  return defaultMetrics;
}
