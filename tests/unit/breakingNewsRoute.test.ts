// breakingNewsRoute.test.ts
import { POST } from '@/app/api/breaking-news/route';

// Mock implementations must come before any imports or usage
jest.mock('@/utils/breakingNewsDetector');
jest.mock('@/lib/env', () => ({
  env: {
    UPSTASH_REDIS_REST_URL: 'fake-url',
    UPSTASH_REDIS_REST_TOKEN: 'fake-token',
  },
}));

jest.mock('@upstash/redis', () => {
  const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
    publish: jest.fn(),
  };
  return {
    Redis: jest.fn(() => mockRedis),
    __mockRedis: mockRedis, // Optional for accessing directly if needed
  };
});

describe('Breaking News API Route', () => {
  let mockRedis: any;

  beforeEach(() => {
    // Access the mockRedis instance from the mock module
    const redisModule = jest.requireMock('@upstash/redis');
    mockRedis = redisModule.__mockRedis;

    jest.clearAllMocks();
  });

  test('POST returns cached result if available', async () => {
    const mockCached = { isBreaking: true, confidence: 0.9 };
    mockRedis.get.mockResolvedValue(mockCached);

    const request = new Request('http://localhost:3000/api/breaking-news', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Title',
        content: 'Test Content',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data).toEqual(mockCached);
    expect(mockRedis.get).toHaveBeenCalled();
  });

  test('POST handles missing title/content', async () => {
    const request = new Request('http://localhost:3000/api/breaking-news', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
