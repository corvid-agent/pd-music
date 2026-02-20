import { test, expect } from '@playwright/test';
import { mockMusicAPIs } from './helpers';

test.describe('App', () => {
  test.beforeEach(async ({ page }) => {
    await mockMusicAPIs(page);
  });

  test('should load home page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.hero')).toBeVisible();
    await expect(page.locator('.hero h1')).toBeVisible();
  });

  test('should show navigation bar', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav.nav-bar')).toBeVisible();
  });

  test('should show nav brand', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a.nav-brand')).toBeVisible();
    await expect(page.locator('a.nav-brand')).toContainText('pd-music');
  });

  test('should show nav links', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.nav-links')).toBeVisible();
    await expect(page.locator('.nav-links a')).toHaveCount(3);
  });
});
