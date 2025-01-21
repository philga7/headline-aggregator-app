import { db } from '@/lib/db';
import { env } from '@/lib/env';

export async function cleanupOldNews() {
  try {
    await db.cleanOldNews();
    console.log('Successfully cleaned old news entries');
  } catch (error) {
    console.error('Failed to clean old news:', error);
  }
}

// Run cleanup every 6 hours if in production
if (env.NODE_ENV === 'production') {
  setInterval(cleanupOldNews, 1000 * 60 * 60 * 6);
}
