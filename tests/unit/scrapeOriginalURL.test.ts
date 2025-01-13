import { scrapeOriginalURL } from '@/utils/scrapeOriginalURL';

describe('scrapeOriginalURL', () => {
  it('returns original URL when scraping fails', async () => {
    const testUrl = 'https://example.com/article';
    const result = await scrapeOriginalURL(testUrl);
    expect(result).toBe(testUrl);
  });

  it('handles invalid URLs gracefully', async () => {
    const invalidUrl = 'not-a-url';
    const result = await scrapeOriginalURL(invalidUrl);
    expect(result).toBe(invalidUrl);
  });
});