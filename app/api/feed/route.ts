import { NextResponse } from "next/server";
import { RSSFeedAdapter } from "@/utils/adapters/rssFeedAdapter";
import { APIFeedAdapter } from "@/utils/adapters/apiAdapter";
import { Article } from "@/types/article";

const feeds = [
  new RSSFeedAdapter("https://citizenfreepress.com/feed/"),
  // new APIFeedAdapter("https://api.example.com/news"), // Your API endpoint
];

export async function GET() {
  try {
    const feedPromises = feeds.map(feed => feed.fetchArticles());
    const feedResults = await Promise.all(feedPromises);
    const articles = feedResults
      .flat()
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    return NextResponse.json(articles);
  } catch (error) {
    console.error("Error in feed route:", error);
    return NextResponse.json(
      { error: "Failed to fetch news feeds" },
      { status: 500 }
    );
  }
}