"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

interface Article {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

export function ArticleFeed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    try {
      const response = await fetch("/api/feed");
      if (!response.ok) throw new Error("Failed to fetch articles");
      const data = await response.json();
      setArticles(data);
      setError(null);
    } catch (err) {
      setError("Failed to load articles. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-800 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-500">
        <AlertCircle className="w-5 h-5" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {articles.map((article, index) => (
        <motion.article
          key={`${article.link}-${index}`} // Add index to make key unique
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="group"
        >
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <h2 className="text-xl font-medium group-hover:text-blue-400 transition-colors">
              {article.title}
            </h2>
            <div className="mt-2 text-sm text-gray-400">
              <span>{article.source}</span>
              <span className="mx-2">•</span>
              <span>{new Date(article.pubDate).toLocaleDateString()}</span>
            </div>
          </a>
        </motion.article>
      ))}
    </motion.div>
  );
}