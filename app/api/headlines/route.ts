import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { env } from '@/lib/env';
import { scrapeOriginalURL } from '@/utils/scrapeOriginalURL';

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

async function fetchHeadline(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/);
    return match ? match[1].trim() : null;
  } catch (error) {
    console.error(`Failed to fetch headline for ${url}:`, error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Cache key based on URL
    const cacheKey = `headline:${Buffer.from(url).toString('base64')}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return NextResponse.json({ headline: cached, cached: true });
    }

    // Get original URL in case of redirects
    const originalUrl = await scrapeOriginalURL(url);
    const headline = await fetchHeadline(originalUrl);

    if (!headline) {
      return NextResponse.json(
        { error: 'Failed to fetch headline' },
        { status: 404 }
      );
    }

    // Cache for 24 hours
    await redis.set(cacheKey, headline, { ex: 86400 });

    return NextResponse.json({ headline, cached: false });
  } catch (error) {
    console.error('Headline fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to process headline request' },
      { status: 500 }
    );
  }
}
