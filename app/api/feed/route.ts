import Parser from "rss-parser";
import { NextResponse } from "next/server";
import { scrapeOriginalURL } from "@/utils/scrapeOriginalURL";

const parser = new Parser();

const RSS_FEEDS = [
  "https://citizenfreepress.com/feed/",
];

export async function GET() {
  try {
    const feedPromises = RSS_FEEDS.map(async (feedUrl) => {
      try {
        const feed = await parser.parseURL(feedUrl);
        const articlesWithOriginalUrls = await Promise.all(
          feed.items.map(async (item) => {
            const originalUrl = await scrapeOriginalURL(item.link || "");
            const isExternalLink = originalUrl !== item.link;
            
            return {
              title: item.title,
              link: originalUrl, // Use the scraped URL instead of CFP URL
              pubDate: item.pubDate,
              // If we found an external link, try to extract the domain as the source
              source: isExternalLink 
                ? new URL(originalUrl).hostname.replace('www.', '')
                : "Citizen Free Press",
            };
          })
        );

        return articlesWithOriginalUrls;
      } catch (error) {
        console.error(`Error fetching feed ${feedUrl}:`, error);
        return [];
      }
    });

    const feedResults = await Promise.all(feedPromises);
    const articles = feedResults.flat().sort((a, b) => {
      return new Date(b.pubDate!).getTime() - new Date(a.pubDate!).getTime();
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error("Error in feed route:", error);
    return NextResponse.json(
      { error: "Failed to fetch news feeds" },
      { status: 500 }
    );
  }
}