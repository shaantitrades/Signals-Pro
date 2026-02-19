import Redis from 'ioredis';

let redis: Redis | null = null;

export async function initializeRedis(): Promise<void> {
  try {
    const instance = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) {
          // Stop retrying after 3 attempts
          return null;
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      lazyConnect: true,
      enableOfflineQueue: false,
    });

    // Attach error listener BEFORE connecting to prevent unhandled error events
    instance.on('error', (err) => {
      if (redis) {
        console.error('❌ Redis error:', err.message);
      }
      // Silently ignore errors when redis is null (already disconnected)
    });

    instance.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });

    await instance.connect();

    redis = instance;
    console.log('✅ Redis connected');
  } catch (error) {
    console.warn('⚠️ Redis connection failed, running without cache:', (error as Error).message);
    redis = null;
  }
}

export function getRedis(): Redis | null {
  return redis;
}

// ============================================================================
// Cache helpers
// ============================================================================

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

export async function cacheSet(key: string, value: any, ttlSeconds: number = 60): Promise<void> {
  if (!redis) return;
  await redis.setex(key, ttlSeconds, JSON.stringify(value));
}

export async function cacheDel(key: string): Promise<void> {
  if (!redis) return;
  await redis.del(key);
}

export async function cacheInvalidatePattern(pattern: string): Promise<void> {
  if (!redis) return;
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
