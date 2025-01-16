import { HfInference } from '@huggingface/inference';
import { z } from 'zod';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export const NewsClassificationSchema = z.object({
  isBreakingNews: z.boolean(),
  urgencyScore: z.number().min(0).max(1),
  categories: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  timestamp: z.string().datetime(),
});

export type NewsClassification = z.infer<typeof NewsClassificationSchema>;

export async function classifyNews(
  title: string,
  content: string
): Promise<NewsClassification> {
  try {
    const prompt = `Analyze this news:
    Title: ${title}
Content: ${content.substring(0, 500)}

Respond in JSON format:
{
  "isBreakingNews": boolean,
  "categories": ["category1", "category2"],
  "urgencyScore": number between 0 and 1
}`;
    const result = await hf.textGeneration({
      model: "google/flan-t5-base",
      inputs: prompt,
      parameters: {
        max_new_tokens: 200,
        temperature: 0.3
      }
    });

    let parsedResult;
    try {
      parsedResult = JSON.parse(result.generated_text);
  } catch {
      parsedResult = {
        isBreakingNews: false,
        categories: ["general"],
        urgencyScore: 0.1
      };
  }

    return NewsClassificationSchema.parse({
      isBreakingNews: parsedResult.isBreakingNews,
      urgencyScore: parsedResult.urgencyScore,
      categories: parsedResult.categories,
      confidence: 0.8,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('News classification error:', error);
    throw new Error('Failed to classify news');
}
}