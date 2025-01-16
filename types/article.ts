export interface Article {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

export interface FeedAdapter {
  fetchArticles(): Promise<Article[]>;
}
