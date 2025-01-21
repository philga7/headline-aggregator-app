import { z } from 'zod';

const envSchema = z.object({
  UPSTASH_REDIS_REST_URL: process.env.NODE_ENV === 'test' 
    ? z.string()
    : z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  HUGGINGFACE_API_KEY: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = envSchema.parse({
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,
  NODE_ENV: process.env.NODE_ENV,
});
