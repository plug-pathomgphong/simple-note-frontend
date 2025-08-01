import { test, expect } from '@playwright/test';

test.describe('NoteView CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the notes page
    await page.goto('/');
    // Assuming there's a navigation to notes, or the notes are on the home page
    // You might need to adjust this based on your routing
  });

  test('should display notes list', async ({ page }) => {
    // Check if the page title is visible
    await expect(page.getByRole('heading', { name: 'Note List' })).toBeVisible();
    
    // Check if the add note button is present
    await expect(page.getByRole('button', { name: '+ Add Note' })).toBeVisible();
  });

  test('should create a new note', async ({ page }) => {
    // Click the add note button
    await page.getByRole('button', { name: '+ Add Note' }).click();
    
    // Fill the form
    await page.getByLabel('Title').fill('Test Note');
    await page.getByLabel('Content').fill('This is a test note content');
    
    // Submit the form
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify the note was created
    await expect(page.getByText('Test Note')).toBeVisible();
    await expect(page.getByText('This is a test note content')).toBeVisible();
  });

  test('should edit an existing note', async ({ page }) => {
    // First create a note to edit
    await page.getByRole('button', { name: '+ Add Note' }).click();
    await page.getByLabel('Title').fill('Note to Edit');
    await page.getByLabel('Content').fill('Original content');
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Wait for the note to appear
    await expect(page.getByText('Note to Edit')).toBeVisible();
    
    // Click edit button on the first note
    await page.locator('.note-item').first().getByRole('button', { name: 'Edit' }).click();
    
    // Update the form
    await page.getByLabel('Title').fill('Updated Note Title');
    await page.getByLabel('Content').fill('Updated content');
    
    // Submit the form
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify the note was updated
    await expect(page.getByText('Updated Note Title')).toBeVisible();
    await expect(page.getByText('Updated content')).toBeVisible();
  });

  test('should delete a note', async ({ page }) => {
    // First create a note to delete
    await page.getByRole('button', { name: '+ Add Note' }).click();
    await page.getByLabel('Title').fill('Note to Delete');
    await page.getByLabel('Content').fill('This note will be deleted');
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Wait for the note to appear
    await expect(page.getByText('Note to Delete')).toBeVisible();
    
    // Click delete button
    await page.locator('.note-item').first().getByRole('button', { name: 'Delete' }).click();
    
    // Confirm deletion
    await page.getByRole('button', { name: 'Yes, Delete' }).click();
    
    // Verify the note was deleted
    await expect(page.getByText('Note to Delete')).not.toBeVisible();
  });

  test('should handle form validation', async ({ page }) => {
    // Click the add note button
    await page.getByRole('button', { name: '+ Add Note' }).click();
    
    // Try to submit without filling required fields
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Check for validation error message
    await expect(page.getByText('Title and content are required.')).toBeVisible();
  });

  test('should upload image with note', async ({ page }) => {
    // Click the add note button
    await page.getByRole('button', { name: '+ Add Note' }).click();
    
    // Fill the form
    await page.getByLabel('Title').fill('Note with Image');
    await page.getByLabel('Content').fill('This note has an image');
    
    // Upload an image file
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByLabel('Image').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('tests/fixtures/test-image.jpg');
    
    // Submit the form
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify the note was created with image
    await expect(page.getByText('Note with Image')).toBeVisible();
    await expect(page.locator('.note-image')).toBeVisible();
  });

  test('should handle pagination', async ({ page }) => {
    // Create multiple notes to test pagination
    for (let i = 1; i <= 5; i++) {
      await page.getByRole('button', { name: '+ Add Note' }).click();
      await page.getByLabel('Title').fill(`Note ${i}`);
      await page.getByLabel('Content').fill(`Content for note ${i}`);
      await page.getByRole('button', { name: 'Save' }).click();
    }
    
    // Check if pagination controls are visible
    await expect(page.locator('.pagination')).toBeVisible();
    
    // Navigate to next page if available
    const nextButton = page.getByRole('button', { name: 'Next' });
    if (await nextButton.isVisible()) {
      await nextButton.click();
      // Verify we're on a different page
      await expect(page.getByText('Note 4')).toBeVisible();
    }
  });
}); 