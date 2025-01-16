import Parser from 'rss-parser';
import { Article } from '@/types/article';
import { BaseFeedAdapter } from './baseFeedAdapter';
import { scrapeOriginalURL } from '../scrapeOriginalURL';

export class RSSFeedAdapter extends BaseFeedAdapter {
  private parser: Parser;

  constructor(feedUrl: string) {
    super(feedUrl);
    this.parser = new Parser();
  }

  async fetchArticles(): Promise<Article[]> {
    try {
      const feed = await this.parser.parseURL(this.feedUrl);
      return await Promise.all(
        feed.items.map(async (item) => {
          const originalUrl = await scrapeOriginalURL(item.link || '');
          const isExternalLink = originalUrl !== item.link;
          
          return {
            title: item.title || '',
            link: originalUrl,
            pubDate: item.pubDate || new Date().toISOString(),
            source: isExternalLink 
              ? new URL(originalUrl).hostname.replace('www.', '')
              : "RSS Feed",
          };
        })
      );
    } catch (error) {
      console.error(`Error fetching RSS feed ${this.feedUrl}:`, error);
      return [];
    }
  }
}
