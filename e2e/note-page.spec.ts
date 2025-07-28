import { test, expect } from '@playwright/test';

test.describe('NoteView CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the notes page
    await page.goto('/note');
    // Assuming there's a navigation to notes, or the notes are on the home page
    // You might need to adjust this based on your routing
  });

  test('Note page should render', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Note List');
  });

})
