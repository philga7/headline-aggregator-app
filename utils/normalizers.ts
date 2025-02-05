import { NormalizedFeedItem, RawCFPFeedItem } from '../types/Feed';
import { scrapeOriginalURL } from './scrapeOriginalURL';

export async function normalizeCFPFeed(rawItems: RawCFPFeedItem[]): Promise<NormalizedFeedItem[]> {
    return Promise.all(
      rawItems.map(async (item) => {
        const originalUrl = await scrapeOriginalURL(item.link);
        const isExternalLink = originalUrl !== item.link;
        
        return {
          title: item.title,
          link: originalUrl,
          pubDate: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          source: isExternalLink 
            ? new URL(originalUrl).hostname.replace('www.', '')
            : "Citizen Free Press"
        };
      })
    );
  }

async function extractSourceFromUrl(url: string): Promise<string> {
  try {
    // Fetch the URL and extract the actual source
    // This is a basic implementation - you might want to enhance it
    const response = await fetch(url);
    const html = await response.text();
    
    // Extract domain from URL as fallback
    const domain = new URL(url).hostname.replace('www.', '');
    
    return domain;
  } catch (error) {
    console.error('Error extracting source:', error);
    return 'Unknown Source';
  }
}