"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const loadingRef = useRef(false);

  const fetchArticles = useCallback(async (pageNum: number) => {
    if (loadingRef.current) return;
    try {
      loadingRef.current = true;
      const response = await fetch(`/api/feed?page=${pageNum}&limit=20`);
      if (!response.ok) throw new Error("Failed to fetch articles");
      const data = await response.json();
      
      if (data.length < 20) {
        setHasMore(false);
      }

      setArticles(prev => pageNum === 0 ? data : [...prev, ...data]);
      setError(null);
    } catch (err) {
      setError("Failed to load articles. Please try again later.");
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchArticles(0);
  }, [fetchArticles]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1000 &&
        hasMore &&
        !loadingRef.current
      ) {
        setPage(prev => prev + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore]);

  useEffect(() => {
    if (page > 0) {
      fetchArticles(page);
    }
  }, [page, fetchArticles]);

  if (loading && articles.length === 0) {
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

  if (error && articles.length === 0) {
    return (
      <div className="flex items-center space-x-2 text-red-500">
        <AlertCircle className="w-5 h-5" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {articles.map((article, index) => (
        <article
          key={`${article.link}-${index}`}
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
        </article>
      ))}
    </div>
  );
}