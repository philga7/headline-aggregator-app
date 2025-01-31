import { detectBreakingNews } from '@/utils/breakingNewsDetector';

describe('Breaking News Detection', () => {
  test('detects breaking news from title keywords', async () => {
    const title = 'BREAKING: Major Event Happens';
    const content = 'Regular content here';
    
    const result = await detectBreakingNews(title, content);
    
    expect(result.isBreaking).toBe(true);
    expect(result.timestamp).toBeDefined();
  });

  test('detects breaking news from content keywords', async () => {
    const title = 'Regular Title';
    const content = 'URGENT: Something important has happened';
    
    const result = await detectBreakingNews(title, content);
    
    expect(result.isBreaking).toBe(true);
    expect(result.timestamp).toBeDefined();
  });

  test('identifies non-breaking news', async () => {
    const title = 'Regular News Title';
    const content = 'Regular news content';
    
    const result = await detectBreakingNews(title, content);
    
    expect(result.isBreaking).toBe(false);
    expect(result.timestamp).toBeDefined();
  });

  test('handles empty strings', async () => {
    const result = await detectBreakingNews('', '');
    
    expect(result.isBreaking).toBe(false);
    expect(result.timestamp).toBeDefined();
  });

  test('handles error cases', async () => {
    // Test with invalid inputs that might cause errors
    await expect(detectBreakingNews(null as any, null as any))
      .rejects
      .toThrow('Failed to analyze breaking news');
  });
});
