import { HfInference } from '@huggingface/inference';
import { z } from 'zod';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Interface for classification result
interface TextClassificationResult {
  labels: string[];
  scores: number[];
}

// [Previous constants remain unchanged]
const BREAKING_KEYWORDS = [
  'breaking',
  'urgent',
  'emergency',
  'just in',
  'developing',
  'alert',
];

const URGENT_CATEGORIES = [
  'disaster',
  'terrorism',
  'emergency',
  'crisis',
  'outbreak',
];

// [Previous schema and type definitions remain unchanged]
export const NewsAnalysisSchema = z.object({
  isBreakingNews: z.boolean(),
  urgencyScore: z.number().min(0).max(1),
  sentiment: z.object({
    score: z.number().min(-1).max(1),
    label: z.enum(['positive', 'negative', 'neutral']),
  }),
  categories: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  timestamp: z.string(),
});

export type NewsAnalysis = z.infer<typeof NewsAnalysisSchema>;

// [analyzeNews function remains unchanged]
async function classifyContent(title: string, content: string) {
  const result = await hf.textClassification({
    model: 'facebook/bart-large-mnli',
    inputs: `${title} ${content.substring(0, 500)}`,
  });

  return {
    categories: [(result as unknown as TextClassificationResult).labels[0]],
    confidence: (result as unknown as TextClassificationResult).scores[0],
  };
}

// [Rest of the code remains unchanged]
