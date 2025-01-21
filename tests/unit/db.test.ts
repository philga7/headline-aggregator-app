import { db } from '@/lib/db';
import { Redis } from '@upstash/redis';

jest.mock('@upstash/redis');

describe('Database Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup mock implementations
    (Redis as jest.MockedClass<typeof Redis>).prototype.hset = jest.fn();
    (Redis as jest.MockedClass<typeof Redis>).prototype.zadd = jest.fn();
    (Redis as jest.MockedClass<typeof Redis>).prototype.zremrangebyscore = jest.fn();
  });

  test('addNews stores breaking news correctly', async () => {
    const mockNews = {
      title: 'Test Title',
      content: 'Test Content',
      source: 'Test Source',
      isBreaking: true,
      urgencyScore: 0.8,
      timestamp: new Date().toISOString()
    };

    await db.addNews(mockNews);

    expect(Redis.prototype.hset).toHaveBeenCalledWith(
      expect.stringMatching(/^news:\d+$/),
      expect.objectContaining({
        ...mockNews,
        timestamp: expect.any(String)
      })
    );

    expect(Redis.prototype.zadd).toHaveBeenCalledWith(
      'breaking_news',
      expect.objectContaining({
        score: expect.any(Number),
        member: expect.stringMatching(/^news:\d+$/)
      })
    );
  });

  test('cleanOldNews removes expired entries', async () => {
    await db.cleanOldNews();
    expect(Redis.prototype.zremrangebyscore).toHaveBeenCalled();
  });
});