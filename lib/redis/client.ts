import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

let redisClient: Redis | null = null;
if (url && token && !url.includes('your_upstash')) {
  try {
    redisClient = new Redis({ url, token });
  } catch (err) {
    console.warn('Upstash Redis connection warning:', err);
  }
}

// In-Memory Fallback Map for seamless local demo without credentials
const memoryCache = new Map<string, string>();

/**
 * Checks Redis cache for an exact match using normalized prompt.
 */
export async function getCachedResponse(normalizedPrompt: string): Promise<string | null> {
  if (!normalizedPrompt) return null;

  const cacheKey = `tokenflow:exact:${normalizedPrompt}`;

  if (redisClient) {
    try {
      const cached = await redisClient.get<string>(cacheKey);
      if (cached) return cached;
    } catch (err) {
      console.warn('Redis GET Error:', err);
    }
  }

  // Fallback memory cache
  return memoryCache.get(cacheKey) || null;
}

/**
 * Stores exact prompt -> response mapping in Redis.
 */
export async function setCachedResponse(normalizedPrompt: string, response: string, ttlSeconds = 86400 * 7): Promise<void> {
  if (!normalizedPrompt || !response) return;

  const cacheKey = `tokenflow:exact:${normalizedPrompt}`;

  if (redisClient) {
    try {
      await redisClient.set(cacheKey, response, { ex: ttlSeconds });
    } catch (err) {
      console.warn('Redis SET Error:', err);
    }
  }

  // Store in fallback memory cache
  memoryCache.set(cacheKey, response);
}
