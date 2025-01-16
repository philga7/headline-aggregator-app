import { Article, FeedAdapter } from '@/types/article';

export abstract class BaseFeedAdapter implements FeedAdapter {
  protected constructor(protected readonly feedUrl: string) {}
  abstract fetchArticles(): Promise<Article[]>;
}
