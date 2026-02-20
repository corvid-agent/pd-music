import { test, expect } from '@playwright/test';
import { mockMusicAPIs } from './helpers';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await mockMusicAPIs(page);
  });

  test('should navigate to search', async ({ page }) => {
    await page.goto('/search');
    await expect(page.locator('.search-page')).toBeVisible();
    await expect(page.locator('.search-form')).toBeVisible();
  });

  test('should navigate to listen', async ({ page }) => {
    await page.goto('/listen');
    await expect(page.locator('.listen-page')).toBeVisible();
  });

  test('should navigate to favorites', async ({ page }) => {
    await page.goto('/favorites');
    await expect(page.locator('.favorites-page')).toBeVisible();
  });

  test('should navigate home via brand link', async ({ page }) => {
    await page.goto('/search');
    await page.locator('a.nav-brand').click();
    await expect(page).toHaveURL('/');
  });

  test('should navigate via nav links', async ({ page }) => {
    await page.goto('/');
    await page.locator('.nav-links a', { hasText: 'Search' }).click();
    await expect(page).toHaveURL('/search');
    await expect(page.locator('.search-page')).toBeVisible();
  });
});
