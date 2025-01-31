// utils/breakingNewsEvaluator.ts
import { detectBreakingNews } from './breakingNewsDetector';

export class BreakingNewsEvaluator {
  private static instance: BreakingNewsEvaluator;
  private evaluationInterval: NodeJS.Timeout | null = null;
  
  private constructor() {}

  static getInstance(): BreakingNewsEvaluator {
    if (!BreakingNewsEvaluator.instance) {
      BreakingNewsEvaluator.instance = new BreakingNewsEvaluator();
    }
    return BreakingNewsEvaluator.instance;
  }

  async evaluateArticle(title: string, content: string): Promise<boolean> {
    try {
      const analysis = await detectBreakingNews(title, content);
      return analysis.isBreaking;
    } catch (error) {
      console.error('Article evaluation error:', error);
      return false;
    }
  }

  startPeriodicEvaluation(callback: (articles: any[]) => void) {
    if (this.evaluationInterval) return;

    const evaluateAndSort = async () => {
      try {
        const response = await fetch('/api/feed');
        const articles = await response.json();
        
        const updatedArticles = await Promise.all(
          articles.map(async (article: any) => ({
            ...article,
            isBreaking: await this.evaluateArticle(article.title, article.content)
          }))
        );

        // Sort breaking news to top
        const sortedArticles = updatedArticles.sort((a, b) => {
          if (a.isBreaking && !b.isBreaking) return -1;
          if (!a.isBreaking && b.isBreaking) return 1;
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });

        callback(sortedArticles);
      } catch (error) {
        console.error('Periodic evaluation error:', error);
      }
    };

    // Initial evaluation
    evaluateAndSort();
    
    // Set up periodic evaluation
    this.evaluationInterval = setInterval(evaluateAndSort, 5 * 60 * 1000);
  }

  stopPeriodicEvaluation() {
    if (this.evaluationInterval) {
      clearInterval(this.evaluationInterval);
      this.evaluationInterval = null;
    }
  }
}
