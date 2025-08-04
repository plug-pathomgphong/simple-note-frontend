import { test, expect } from '@playwright/test';


test.describe('NoteView CRUD Operations ivalte', () => {

})
test.describe('NoteView CRUD Operations', () => {
  const testNote = {
    title: 'Test Note Title',
    content: 'This is a test note content.',
    updatedTitle: 'Updated Test Note Title',
    updatedContent: 'Updated content text.',
  };
  
  async function createNote(page, title: string, content: string) {
    await page.getByTestId('add-note-btn').click();
    await page.getByPlaceholder('Enter title').fill(title);
    await page.getByPlaceholder('Enter content').fill(content);
    await page.getByTestId('submit-note-btn').click();
    await expect(page.locator('.note-item').first()).toContainText(title);
  }

  async function findNoteItemByTitle(page, title: string) {
    const items = page.locator('.note-item');
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      if ((await item.innerText()).includes(title)) {
        return item;
      }
    }
    return null;
  }

  test.beforeEach(async ({ page }) => {
    // Navigate to the notes page
    await page.goto('/note');
    // Assuming there's a navigation to notes, or the notes are on the home page
    // You might need to adjust this based on your routing
  });

  test('Note page should render', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Note List');
  });

  test('should show error when creating a note with empty title and content', async ({ page }) => {
    
    await page.getByTestId('add-note-btn').click();
    await page.getByTestId('submit-note-btn').click();
    
    // Check for error messages
    const titleError = page.locator('.form-group input[name="title"] + .error-message');
    const contentError = page.locator('.form-group textarea[name="content"] + .error-message');
    
    await expect(titleError).toHaveText('Title is required');
    await expect(contentError).toHaveText('Content is required');

  });

  test('should show error when creating a note with title longer than 100 characters', async ({ page }) => {
    const longTitle = 'a'.repeat(101);
    await page.getByTestId('add-note-btn').click();
    await page.getByPlaceholder('Enter title').fill(longTitle);
    await page.getByPlaceholder('Enter content').fill('Some content');
    await page.getByTestId('submit-note-btn').click();

    const titleError = page.locator('.form-group input[name="title"] + .error-message');
    await expect(titleError).toHaveText('Title must be less than 100 characters');
  });

  test('should show error when creating a note with content longer than 1000 characters', async ({ page }) => {
    const longContent = 'b'.repeat(1001);
    await page.getByTestId('add-note-btn').click();
    await page.getByPlaceholder('Enter title').fill('Valid Title');
    await page.getByPlaceholder('Enter content').fill(longContent);
    await page.getByTestId('submit-note-btn').click();

    const contentError = page.locator('.form-group textarea[name="content"] + .error-message');
    await expect(contentError).toHaveText('Content must be less than 1000 characters');
  });

  test('should create, read, update, and delete a note', async ({ page }) => {
    await test.step('Create a new note', async () => {
      await createNote(page, testNote.title, testNote.content);
      const created = await findNoteItemByTitle(page, testNote.title);
      expect(created).not.toBeNull();
    });

    await test.step('Read the created note', async () => {
      const created = await findNoteItemByTitle(page, testNote.title);
      expect(created).not.toBeNull();
      await expect(created).toContainText(testNote.content);
    });

    await test.step('Update the created note', async () => {
      const created = await findNoteItemByTitle(page, testNote.title);
      expect(created).not.toBeNull();
      await created.getByTestId('edit-note-btn').click();
      await page.locator('input[name="title"]').fill(testNote.updatedTitle);
      await page.locator('textarea[name="content"]').fill(testNote.updatedContent);
      await page.locator('button[type="submit"]').click();
      await page.waitForSelector('[data-testid="modal-overlay"]', { state: 'detached' });

      const updated = await findNoteItemByTitle(page, testNote.updatedTitle);
      expect(updated).not.toBeNull();
      await expect(updated).toContainText(testNote.updatedContent);
    });

    await test.step('Delete the updated note', async () => {
      const updated = await findNoteItemByTitle(page, testNote.updatedTitle);
      expect(updated).not.toBeNull();
      await updated.getByTestId('delete-note-btn').click();
      await page.locator('.delete-btn').click();
      await page.waitForSelector('[data-testid="confirm-delete-modal"]', { state: 'detached' });

      const deleted = await findNoteItemByTitle(page, testNote.updatedTitle);
      expect(deleted).toBeNull();
    });

  });


})
