// types/Feed.ts
export interface NormalizedFeedItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

export interface RawCFPFeedItem {
  title: string;
  link: string;
  pubDate?: string;
  source?: string;
}
