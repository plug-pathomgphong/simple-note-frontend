import { test, expect, Page } from '@playwright/test';

// Test data constants
const TEST_NOTE = {
  title: 'Test Note Title',
  content: 'This is a test note content.',
  updatedTitle: 'Updated Test Note Title',
  updatedContent: 'Updated content text.',
};

const VALIDATION_LIMITS = {
  title: 100,
  content: 1000,
  imageSize: 2 * 1024 * 1024, // 2MB in bytes
};

// Test file paths
const TEST_FILES = {
  validImage: 'tests/assets/sample.jpg',
  invalidFile: 'tests/assets/sample.pdf',
  largeImage: 'tests/assets/large-image.png',
};

test.beforeEach(async ({ page }) => {
  await page.goto('/note');
});

test.describe('NoteView CRUD Operations', () => {
  // Utility functions
  async function createNote(page: Page, title: string, content: string) {
    await page.getByTestId('add-note-btn').click();
    await page.getByPlaceholder('Enter title').fill(title);
    await page.getByPlaceholder('Enter content').fill(content);
    await page.getByTestId('submit-note-btn').click();
    await expect(page.locator('.note-item').first()).toContainText(title);
  }

  async function findNoteItemByTitle(page: Page, title: string) {
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

  async function openNoteModal(page: Page) {
    await page.getByTestId('add-note-btn').click();
    await expect(page.getByTestId('modal-title')).toBeVisible();
  }

  async function fillNoteForm(page: Page, title: string, content: string) {
    await page.getByPlaceholder('Enter title').fill(title);
    await page.getByPlaceholder('Enter content').fill(content);
  }

  async function uploadImage(page: Page, filePath: string) {
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByTestId('image-label-text').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
  }

  async function mockApiResponse(page: Page, url: string, status: number, body: any) {
    await page.route(url, route => {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    });
  }

  // Form validation tests
  test.describe('Form Validation', () => {
    test('should disable submit button when form is invalid', async ({ page }) => {
      await openNoteModal(page);
      const submitButton = page.getByTestId('submit-note-btn');

      // Submit button should be disabled initially
      await expect(submitButton).toBeDisabled();

      // Title too short
      await page.getByPlaceholder('Enter title').fill('Hi');
      await expect(submitButton).toBeDisabled();

      // Content too short
      await page.getByPlaceholder('Enter title').fill('Valid Title');
      await page.getByPlaceholder('Enter content').fill('short');
      await expect(submitButton).toBeDisabled();
    });

    test('should show error when title exceeds character limit', async ({ page }) => {
      const longTitle = 'a'.repeat(VALIDATION_LIMITS.title + 1);
      
      await openNoteModal(page);
      await page.getByPlaceholder('Enter title').fill(longTitle);
      await page.getByPlaceholder('Enter content').fill('Some content');
      
      await expect(page.getByTestId('submit-note-btn')).toBeDisabled();
      
      const titleError = page.locator('.form-group input[name="title"] + .error-message');
      await expect(titleError).toHaveText(`Title must be less than ${VALIDATION_LIMITS.title} characters`);
    });

    test('should show error when content exceeds character limit', async ({ page }) => {
      const longContent = 'b'.repeat(VALIDATION_LIMITS.content + 1);
      
      await openNoteModal(page);
      await page.getByPlaceholder('Enter title').fill('Valid Title');
      await page.getByPlaceholder('Enter content').fill(longContent);
      
      await expect(page.getByTestId('submit-note-btn')).toBeDisabled();
      
      const contentError = page.locator('.form-group textarea[name="content"] + .error-message');
      await expect(contentError).toHaveText(`Content must be less than ${VALIDATION_LIMITS.content} characters`);
    });

    test('should show errors when both title and content exceed limits', async ({ page }) => {
      const longTitle = 'a'.repeat(VALIDATION_LIMITS.title + 1);
      const longContent = 'b'.repeat(VALIDATION_LIMITS.content + 1);
      
      await openNoteModal(page);
      await page.getByPlaceholder('Enter title').fill(longTitle);
      await page.getByPlaceholder('Enter content').fill(longContent);
      
      await expect(page.getByTestId('submit-note-btn')).toBeDisabled();

      const titleError = page.locator('.form-group input[name="title"] + .error-message');
      const contentError = page.locator('.form-group textarea[name="content"] + .error-message');
      
      await expect(titleError).toHaveText(`Title must be less than ${VALIDATION_LIMITS.title} characters`);
      await expect(contentError).toHaveText(`Content must be less than ${VALIDATION_LIMITS.content} characters`);
    });
  });

  // File upload tests
  test.describe('File Upload', () => {
    test('should show error for invalid file type', async ({ page }) => {
      await openNoteModal(page);
      await uploadImage(page, TEST_FILES.invalidFile);
      
      await expect(page.getByText('Only image files are allowed')).toBeVisible();
    });

    test('should show error when image exceeds size limit', async ({ page }) => {
      await openNoteModal(page);
      await uploadImage(page, TEST_FILES.largeImage);
      
      await expect(page.getByText('Image is too large (max 2MB)')).toBeVisible();
    });

    test('should allow valid image upload', async ({ page }) => {
      await openNoteModal(page);
      await uploadImage(page, TEST_FILES.validImage);

      // No error should be shown and preview should be visible
      await expect(page.getByTestId('image-error')).not.toBeVisible();
      await expect(page.locator('.preview-image')).toBeVisible();
    });
  });

  // API interaction tests
  test.describe('API Interactions', () => {
    test('should display API error when note submission fails', async ({ page }) => {
      await mockApiResponse(page, '**/notes', 500, { message: 'Internal Server Error' });
      
      await openNoteModal(page);
      await page.getByTestId('title-input').fill('Test API Failure');
      await page.getByTestId('content-input').fill('This content will fail.');
      
      await page.getByTestId('submit-note-btn').click();
      
      // Check error is shown
      await expect(page.getByTestId('api-error')).toContainText('Internal Server Error');
      
      // Button should remain enabled
      await expect(page.getByTestId('submit-note-btn')).toBeEnabled();
    });

    test('should submit successfully and close modal', async ({ page }) => {
      await mockApiResponse(page, '**/notes', 200, {});
      
      await openNoteModal(page);
      await page.getByTestId('title-input').fill('My Note Title');
      await page.getByTestId('content-input').fill('This is valid content.');
      
      await uploadImage(page, TEST_FILES.validImage);
      await page.getByTestId('submit-note-btn').click();

      // Wait for modal to close
      await expect(page.getByTestId('modal-form')).toHaveCount(0);
    });
  });

  // Full CRUD workflow test
  test.describe('CRUD Workflow', () => {
    test.skip('should create, read, update, and delete a note', async ({ page }) => {
      await test.step('Create a new note', async () => {
        await createNote(page, TEST_NOTE.title, TEST_NOTE.content);
        const created = await findNoteItemByTitle(page, TEST_NOTE.title);
        expect(created).not.toBeNull();
      });

      await test.step('Read the created note', async () => {
        const created = await findNoteItemByTitle(page, TEST_NOTE.title);
        expect(created).not.toBeNull();
        if (created) {
          await expect(created).toContainText(TEST_NOTE.content);
        }
      });

      await test.step('Update the created note', async () => {
        const created = await findNoteItemByTitle(page, TEST_NOTE.title);
        expect(created).not.toBeNull();
        
        if (created) {
          await created.getByTestId('edit-note-btn').click();
          await page.locator('input[name="title"]').fill(TEST_NOTE.updatedTitle);
          await page.locator('textarea[name="content"]').fill(TEST_NOTE.updatedContent);
          await page.locator('button[type="submit"]').click();
          
          await page.waitForSelector('[data-testid="modal-overlay"]', { state: 'detached' });

          const updated = await findNoteItemByTitle(page, TEST_NOTE.updatedTitle);
          expect(updated).not.toBeNull();
          if (updated) {
            await expect(updated).toContainText(TEST_NOTE.updatedContent);
          }
        }
      });

      await test.step('Delete the updated note', async () => {
        const updated = await findNoteItemByTitle(page, TEST_NOTE.updatedTitle);
        expect(updated).not.toBeNull();
        
        if (updated) {
          await updated.getByTestId('delete-note-btn').click();
          await page.locator('.delete-btn').click();
          
          await page.waitForSelector('[data-testid="confirm-delete-modal"]', { state: 'detached' });

          const deleted = await findNoteItemByTitle(page, TEST_NOTE.updatedTitle);
          expect(deleted).toBeNull();
        }
      });
    });
  });
});
