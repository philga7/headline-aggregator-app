/**
 * Scrapes the actual third-party URL from Citizen Free Press article pages.
 * @param {string} pageURL - URL of the CFP article page.
 * @returns {Promise<string>} - Resolved original article URL.
 */
export async function scrapeOriginalURL(pageURL: string): Promise<string> {
    try {
      const response = await fetch(pageURL, {
        headers: { 'User-Agent': 'News Aggregator Bot' },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.text();
      
      // Use regex to find the first external link
      const linkMatch = data.match(/href="(https?:\/\/(?!citizenfreepress\.com)[^"]+)"/i);
      const externalLink = linkMatch ? linkMatch[1] : null;
  
      return externalLink || pageURL; // Fallback to original link if scraping fails
    } catch (error) {
      console.error(`Error while scraping ${pageURL}:`, error);
      return pageURL;
    }
}