import Parser from "rss-parser";
import { NextRequest, NextResponse } from "next/server";
import { scrapeOriginalURL } from "@/utils/scrapeOriginalURL";

const parser = new Parser();

const RSS_FEEDS = [
  "https://citizenfreepress.com/feed/",
];

export const dynamic = 'force-dynamic'; // This tells Next.js to never cache this route
export const revalidate = 0; // This ensures we don't revalidate this route

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = page * limit;

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

    // Apply pagination
    const paginatedArticles = articles.slice(offset, offset + limit);

    return NextResponse.json(paginatedArticles, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error("Error in feed route:", error);
    return NextResponse.json(
      { error: "Failed to fetch news feeds" },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'Expires': '0',
        },
      }
    );
  }
}