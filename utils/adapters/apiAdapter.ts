import { Article } from '@/types/article';
import { BaseFeedAdapter } from './baseFeedAdapter';

export class APIFeedAdapter extends BaseFeedAdapter {
  constructor(feedUrl: string) {
    super(feedUrl);
  }

  async fetchArticles(): Promise<Article[]> {
    try {
      const response = await fetch(this.feedUrl, {
        headers: {
          // Add any required API headers here
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer your-api-key'
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform the API response to match the Article interface
      // Modify this according to your API's response structure
      return data.articles.map((item: any) => ({
        title: item.title,
        link: item.url,
        pubDate: item.publishedAt,
        source: item.source,
      }));
    } catch (error) {
      console.error(`Error fetching API feed ${this.feedUrl}:`, error);
      return [];
    }
  }
}
