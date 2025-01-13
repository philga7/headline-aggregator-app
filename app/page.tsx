import { ArticleFeed } from "@/components/article-feed";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 data-tid="feed_header" className="text-3xl font-bold mb-8">Today&apos;s Headlines</h1>
      <ArticleFeed />
    </div>
  );
}