import { Redis } from '@upstash/redis';
import { env } from '@/lib/env';

/**
 * Redis client singleton instance
 * @private
 */
let redis: Redis | null = null;

/**
 * Gets or initializes the Redis client using Upstash
 * @returns {Redis} Configured Redis client instance
 */
export function getRedisClient() {
  if (!redis) {
    redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

/**
 * Type-safe schema for news articles in Redis
 * @interface NewsSchema
 */
export interface NewsSchema {
  id: string;
  title: string;
  content: string;
  isBreaking: boolean;
  urgencyScore: number;
  timestamp: string;
  source: string;
  [key: string]: string | number | boolean;
}

/**
 * Database operations for news management
 */
export const db = {
  /**
   * Adds a new news article to Redis
   * @param {Omit<NewsSchema, 'id'>} news - News article data without ID
   * @returns {Promise<string>} Generated news article ID
   */
  async addNews(news: Omit<NewsSchema, 'id'>) {
    const id = `news:${Date.now()}`;
    const client = getRedisClient();
    
    await client.hset(id, {
      ...news,
      timestamp: new Date().toISOString(),
    });
    
    if (news.isBreaking) {
      await client.zadd('breaking_news', {
        score: Date.now(),
        member: id
      });
    }
    
    return id;
  },

  /**
   * Retrieves the most recent breaking news articles
   * @param {number} limit - Maximum number of articles to retrieve
   * @returns {Promise<NewsSchema[]>} Array of breaking news articles
   */
  async getBreakingNews(limit = 10) {
    const client = getRedisClient();
    const ids = (await client.zrange('breaking_news', -limit, -1)) as string[];
    
    if (!ids.length) return [];
    
    const news = await Promise.all(
      ids.map(id => client.hgetall<NewsSchema>(id))
    );
    
    return news.filter(Boolean);
  },

  /**
   * Removes old breaking news articles from the sorted set
   * @param {number} maxAge - Maximum age in milliseconds before removal (default 24 hours)
   * @returns {Promise<void>}
   */
  async cleanOldNews(maxAge = 1000 * 60 * 60 * 24) {
    const client = getRedisClient();
    const minScore = Date.now() - maxAge;
    
    await client.zremrangebyscore('breaking_news', 0, minScore);
  }
};
