import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the notes page
    await page.goto('/');
    // Assuming there's a navigation to notes, or the notes are on the home page
    // You might need to adjust this based on your routing
  });

  test('home page should render', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Home This Project');
  });

})
