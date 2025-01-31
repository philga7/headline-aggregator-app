"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { BreakingNewsEvaluator } from "@/utils/breakingNewsEvaluator";

interface Article {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  isBreaking?: boolean;
  showBreakingLabel?: boolean;
}

export function ArticleFeed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const evaluatorRef = useRef(BreakingNewsEvaluator.getInstance());

  const evaluateArticles = async (articlesToEvaluate: Article[]) => {
    const evaluatedArticles = await Promise.all(
      articlesToEvaluate.map(async (article) => ({
        ...article,
        isBreaking: await evaluatorRef.current.evaluateArticle(
          article.title,
          article.title // Using title as content since that's what we have
        ),
        showBreakingLabel: await evaluatorRef.current.evaluateArticle(
          article.title,
          article.title
        ) // Initialize showBreakingLabel same as isBreaking
      }))
    );

    return evaluatedArticles.sort((a, b) => {
      if (a.isBreaking && !b.isBreaking) return -1;
      if (!a.isBreaking && b.isBreaking) return 1;
      return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    });
  };

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

      // Evaluate new articles for breaking news
      const evaluatedArticles = await evaluateArticles(data);

      setArticles(prev => {
        const result = pageNum === 0 ? evaluatedArticles : [...prev, ...evaluatedArticles];
        
        // Sort breaking news to top immediately
        const sortedResult = result.sort((a, b) => {
          if (a.isBreaking && !b.isBreaking) return -1;
          if (!a.isBreaking && b.isBreaking) return 1;
          return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
        });
        
        // Handle breaking labels
        sortedResult.forEach(article => {
          if (article.isBreaking && article.showBreakingLabel) {
            setTimeout(() => {
              setArticles(current => 
                current.map(a => 
                  a.link === article.link ? { ...a, showBreakingLabel: false } : a
                ).sort((a, b) => { // Maintain sort order when updating labels
                  if (a.isBreaking && !b.isBreaking) return -1;
                  if (!a.isBreaking && b.isBreaking) return 1;
                  return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
                })
              );
            }, 3000);
          }
        });
      
      return sortedResult;
    });

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

  // Periodic re-evaluation of existing articles
  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (articles.length > 0) {
        const reevaluated = await evaluateArticles(articles);
        setArticles(prev => {
          const changed = reevaluated.find((article, i) => 
            !prev[i].isBreaking && article.isBreaking
          );
          
          if (changed) {
            setHighlightedId(`${changed.link}-${changed.pubDate}`);
            setTimeout(() => setHighlightedId(null), 3000);
            
            setTimeout(() => {
              setArticles(current => 
                current.map(a => 
                  a.link === changed.link ? { ...a, showBreakingLabel: false } : a
                ).sort((a, b) => { // Maintain sort order when updating labels
                  if (a.isBreaking && !b.isBreaking) return -1;
                  if (!a.isBreaking && b.isBreaking) return 1;
                  return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
                })
              );
            }, 3000);
          }
  
          // Sort immediately when returning reevaluated articles
          return reevaluated.sort((a, b) => {
            if (a.isBreaking && !b.isBreaking) return -1;
            if (!a.isBreaking && b.isBreaking) return 1;
            return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
          });
        });
      }
    }, 5 * 60 * 1000);
  
    return () => clearInterval(intervalId);
  }, [articles]);

  // Infinite scroll handling
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
      <AnimatePresence>
        {articles.map((article) => {
          const articleId = `${article.link}-${article.pubDate}`;
          return (
            <motion.article
              key={articleId}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`
                group
                ${article.isBreaking ? 'border-l-4 border-green-500 pl-4' : ''}
                ${highlightedId === articleId ? 
                  'outline outline-2 outline-green-500 transition-all duration-300' : 
                  ''
                }
              `}
            >
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <h2 className="text-xl font-medium group-hover:text-blue-400 transition-colors">
                  {article.isBreaking && article.showBreakingLabel && (
                    <motion.span
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="inline-block bg-green-500 text-white text-sm px-2 py-1 rounded mr-2"
                    >
                      Breaking
                    </motion.span>
                  )}
                  {article.title}
                </h2>
                <div className="mt-2 text-sm text-gray-400">
                  <span>{article.source}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(article.pubDate).toLocaleDateString()}</span>
                </div>
              </a>
            </motion.article>
          );
        })}
      </AnimatePresence>
    </div>
  );
}