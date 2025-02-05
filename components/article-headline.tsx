'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ArticleHeadlineProps {
  url: string;
  className?: string;
}

export function ArticleHeadline({ url, className }: ArticleHeadlineProps) {
  const [headline, setHeadline] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHeadline() {
      try {
        const response = await fetch('/api/headlines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch headline');
        }

        const data = await response.json();
        setHeadline(data.headline);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load headline');
        console.error('Error fetching headline:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (url) {
      fetchHeadline();
    }
  }, [url]);

  if (error || !headline) return null;

  return (
    <AnimatePresence>
      {!isLoading && headline && (
        <motion.div 
          className={className}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {headline}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
