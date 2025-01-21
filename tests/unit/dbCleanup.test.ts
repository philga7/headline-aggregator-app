import { cleanupOldNews } from '@/utils/dbCleanup';
import { db } from '@/lib/db';

jest.mock('@/lib/db');

// Set up environment variables before tests
beforeAll(() => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://valid-mock-instance.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'mock_token';
    process.env.HUGGINGFACE_API_KEY = 'mock_key';
});

// Clean up after tests
afterAll(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.HUGGINGFACE_API_KEY;
  });

describe('Database Cleanup', () => {
  test('cleanupOldNews calls db.cleanOldNews', async () => {
    await cleanupOldNews();
    expect(db.cleanOldNews).toHaveBeenCalled();
  });

  test('cleanupOldNews handles errors gracefully', async () => {
    (db.cleanOldNews as jest.Mock).mockRejectedValue(new Error('Test error'));
    
    const consoleSpy = jest.spyOn(console, 'error');
    await cleanupOldNews();
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
