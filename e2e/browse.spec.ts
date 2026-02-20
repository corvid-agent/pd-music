import { test, expect } from '@playwright/test';
import { mockMusicAPIs } from './helpers';

test.describe('Browse & Search', () => {
  test.beforeEach(async ({ page }) => {
    await mockMusicAPIs(page);
  });

  test('should show search form', async ({ page }) => {
    await page.goto('/search');
    await expect(page.locator('.search-input')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should search for artists', async ({ page }) => {
    await page.goto('/search');
    await page.locator('.search-input').fill('Bach');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('.result-item').first()).toBeVisible({ timeout: 10_000 });
  });

  test('should show artist name in results', async ({ page }) => {
    await page.goto('/search');
    await page.locator('.search-input').fill('Bach');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('.result-name').first()).toContainText('Bach', { timeout: 10_000 });
  });

  test('should show featured sections on home', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.featured-section').first()).toBeVisible();
    await expect(page.locator('.section-title').first()).toBeVisible();
  });

  test('should show featured cards on home', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.featured-card').first()).toBeVisible();
  });
});
