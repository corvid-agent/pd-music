import { test, expect } from '@playwright/test';
import { mockMusicAPIs } from './helpers';

test.describe('Player', () => {
  test.beforeEach(async ({ page }) => {
    await mockMusicAPIs(page);
  });

  test('should show listen page with search', async ({ page }) => {
    await page.goto('/listen');
    await expect(page.locator('.search-input')).toBeVisible();
    await expect(page.locator('.search-form')).toBeVisible();
  });

  test('should show favorites page', async ({ page }) => {
    await page.goto('/favorites');
    await expect(page.locator('.favorites-page')).toBeVisible();
  });

  test('should show empty state when no favorites', async ({ page }) => {
    await page.goto('/favorites');
    await expect(page.locator('.empty')).toBeVisible();
    await expect(page.locator('.empty')).toContainText('No favorites yet');
  });

  test('should show listen page heading', async ({ page }) => {
    await page.goto('/listen');
    await expect(page.locator('.listen-page h2')).toContainText('Browse Internet Archive');
  });
});
