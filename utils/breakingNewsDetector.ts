import { HfInference } from '@huggingface/inference';
import { z } from 'zod';
import { db } from '@/lib/db';
import { env } from '@/lib/env';

const BreakingNewsSchema = z.object({
  isBreaking: z.boolean(),
  confidence: z.number().min(0).max(1),
  urgencyScore: z.number().min(0).max(1),
  timestamp: z.string().datetime(),
});

type BreakingNewsAnalysis = z.infer<typeof BreakingNewsSchema>;

const hf = new HfInference(env.HUGGINGFACE_API_KEY);

const BREAKING_INDICATORS = [
  'breaking',
  'urgent',
  'emergency',
  'just in',
  'developing',
  'alert',
  'live updates',
  'breaking news',
  'critical update',
  'flash'
];

export async function detectAndStoreBreakingNews(
  title: string,
  content: string,
  source: string
) {
  const analysis = await detectBreakingNews(title, content);
  
  await db.addNews({
    title,
    content,
    source,
    isBreaking: analysis.isBreaking,
    urgencyScore: analysis.urgencyScore,
    timestamp: analysis.timestamp
  });

  return analysis;
}

export async function detectBreakingNews(
  title: string,
  content: string
): Promise<BreakingNewsAnalysis> {
  try {
    const hasBreakingIndicators = BREAKING_INDICATORS.some(indicator => 
      title.toLowerCase().includes(indicator) || 
      content.toLowerCase().substring(0, 300).includes(indicator)
    );

    // Zero-shot classification using BART
    const classification = await hf.zeroShotClassification({
      model: 'facebook/bart-large-mnli',
      inputs: `${title} ${content.substring(0, 300)}`,
      parameters: {
        candidate_labels: ['breaking news', 'regular news']
      }
    });

    // Calculate urgency score based on both indicator presence and classification
    const breakingNewsScore = classification[0].scores[0]; // Score for 'breaking news'
    const urgencyScore = hasBreakingIndicators 
      ? Math.max(0.7, breakingNewsScore)
      : breakingNewsScore;

    return BreakingNewsSchema.parse({
      isBreaking: urgencyScore > 0.6,
      confidence: breakingNewsScore,
      urgencyScore,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Breaking news detection error:', error);
    throw new Error('Failed to analyze breaking news');
  }
}
