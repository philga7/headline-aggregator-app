import { test, expect } from '@playwright/test';

test('homepage shows news feed', async ({ page }) => {
  await page.goto('/');
  
  // Check page title
  await expect(page.locator('h1')).toContainText('Today\'s Headlines');
  
  // Wait for articles to load
  await page.waitForSelector('article', { timeout: 5000 });
  
  // Verify articles are present
  const articles = await page.locator('article').count();
  expect(articles).toBeGreaterThan(0);
});

test('sidebar is visible on desktop and hidden on mobile', async ({ page }) => {
  await page.goto('/');
  
  // Desktop view
  await page.setViewportSize({ width: 1280, height: 800 });
  const sidebarDesktop = await page.locator('nav').isVisible();
  expect(sidebarDesktop).toBeTruthy();
  
  // Mobile view
  await page.setViewportSize({ width: 375, height: 667 });
  const sidebarMobile = await page.locator('nav').isVisible();
  expect(sidebarMobile).toBeFalsy();
});