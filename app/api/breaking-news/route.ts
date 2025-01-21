/**
 * @file Breaking News Detection API Route
 * @description Handles breaking news detection requests with caching and real-time updates
 */

import { NextResponse } from 'next/server';
import { detectBreakingNews } from '@/utils/breakingNewsDetector';
import { Redis } from '@upstash/redis';
import { env } from '@/lib/env';

/**
 * Redis client instance for caching and pub/sub
 */
const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL!,
  token: env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * POST handler for breaking news detection
 * @param {Request} request - The incoming HTTP request
 * @returns {Promise<NextResponse>} JSON response with breaking news analysis
 * 
 * @throws {Error} When title/content validation fails or processing errors occur
 * 
 * @example
 * POST /api/breaking-news
 * {
 *   "title": "Breaking news title",
 *   "content": "News content..."
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Cache key based on title hash
    const cacheKey = `breaking:${Buffer.from(title).toString('base64')}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return NextResponse.json(cached);
    }

    const analysis = await detectBreakingNews(title, content);

    // Cache results for 5 minutes (breaking news changes frequently)
    await redis.set(cacheKey, analysis, { ex: 300 });

    // If breaking news, publish to Redis channel for real-time updates
    if (analysis.isBreaking) {
      await redis.publish('breaking-news', JSON.stringify({
        title,
        analysis,
        timestamp: new Date().toISOString()
      }));
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Breaking news detection error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze breaking news' },
      { status: 500 }
    );
  }
}
