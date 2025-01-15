import { scrapeOriginalURL } from '@/utils/scrapeOriginalURL';
import fetch from 'node-fetch';

const testUrl = 'https://example.com/article';

jest.mock('node-fetch');

describe('scrapeOriginalURL', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });
  
  it('handles invalid URLs gracefully', async () => {
    const invalidUrl = 'not-a-url';
    const result = await scrapeOriginalURL(invalidUrl);
    expect(result).toBe(invalidUrl);
  });

  it('returns original URL when scraping fails', async () => {
    global.fetch = jest.fn(() => 
      Promise.reject(new Error('Failed to fetch'))
    ) as jest.Mock;

    const result = await scrapeOriginalURL(testUrl);
    expect(result).toBe(testUrl);
  });
});
