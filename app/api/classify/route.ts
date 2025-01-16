import { NextResponse } from 'next/server';
import { classifyNews } from '@/utils/newsClassification';
import { Redis } from '@upstash/redis';

// Initialize Redis for caching
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

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

    // Check cache first
    const cacheKey = `classify:${Buffer.from(title).toString('base64')}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Perform classification
    const classification = await classifyNews(title, content);

    // Cache results for 30 minutes
    await redis.set(cacheKey, JSON.stringify(classification), {
      ex: 1800 // 30 minutes
    });

    return NextResponse.json(classification);
  } catch (error) {
    console.error('Classification error:', error);
    return NextResponse.json(
      { error: 'Failed to classify news' },
      { status: 500 }
    );
  }
}
