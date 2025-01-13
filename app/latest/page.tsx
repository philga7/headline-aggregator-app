import { ArticleFeed } from "@/components/article-feed";

export default function LatestNews() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Latest News</h1>
      <ArticleFeed />
    </div>
  );
}