import { scrapeOriginalURL } from '@/utils/scrapeOriginalURL';
import axios from 'axios';

const testUrl = 'https://example.com/article';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

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
    mockedAxios.get.mockRejectedValueOnce(new Error('Failed to fetch'));

    const result = await scrapeOriginalURL(testUrl);
    expect(result).toBe(testUrl);
  });

  it('extracts external link when present', async () => {
    const externalUrl = 'https://external-site.com/article';
    mockedAxios.get.mockResolvedValueOnce({
      status: 200,
      data: `<html><body><a href="${externalUrl}">Link</a></body></html>`,
    });

    const result = await scrapeOriginalURL(testUrl);
    expect(result).toBe(externalUrl);
  });
});
