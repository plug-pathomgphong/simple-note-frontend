import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import NoteView from '../../src/components/NoteView.vue';

const mockNotes = [
  { id: 1, title: 'Note 1', content: 'Content 1', image: '' },
  { id: 2, title: 'Note 2', content: 'Content 2', image: '' }
];

function mockFetchSequence(responses: any[]) {
  let call = 0;
  (globalThis as any).fetch = vi.fn(() => {
    
    const response = responses[call] || responses[responses.length - 1];
    call++;

    return Promise.resolve({
      ok: response.ok,
      json: () => Promise.resolve(response.body)
    });
  });
}

describe('NoteView.vue CRUD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reads and displays notes', async () => {
    mockFetchSequence([
      { ok: true, body: { items: mockNotes, meta: { page: 1, limit: 3, totalItems: 2, totalPages: 1 } } }
    ]);
    const wrapper = mount(NoteView);
    await flushPromises();
    expect(wrapper.text()).toContain('Note 1');
    expect(wrapper.text()).toContain('Note 2');
  });

  it('creates a new note', async () => {
    // 1. Initial fetch, 2. POST, 3. Fetch after add
    mockFetchSequence([
      { ok: true, body: { items: mockNotes, meta: { page: 1, limit: 3, totalItems: 2, totalPages: 1 } } },
      { ok: true, body: {} },
      { ok: true, body: { items: [...mockNotes, { id: 3, title: 'New Note', content: 'New Content', image: '' }], meta: { page: 1, limit: 3, totalItems: 3, totalPages: 1 } } }
    ]);
    const wrapper = mount(NoteView);
    await flushPromises();

    // Open add modal
    await wrapper.find('.add-note-btn').trigger('click');
    // Fill form and submit (simulate modal submit event)
    (wrapper.vm as any).handleModalSubmit({ title: 'New Note', content: 'New Content', image: null });
    await flushPromises();

    expect(wrapper.text()).toContain('New Note');
    expect(wrapper.text()).toContain('New Content');
  });

  it('updates a note', async () => {
    // 1. Initial fetch, 2. PATCH, 3. Fetch after edit
    mockFetchSequence([
      { ok: true, body: { items: mockNotes, meta: { page: 1, limit: 3, totalItems: 2, totalPages: 1 } } },
      { ok: true, body: {} },
      { ok: true, body: { items: [{ id: 1, title: 'Updated', content: 'Updated Content', image: '' }, mockNotes[1]], meta: { page: 1, limit: 3, totalItems: 2, totalPages: 1 } } }
    ]);
    const wrapper = mount(NoteView);
    await flushPromises();

    // Open edit modal
    await wrapper.findAll('button').find(btn => btn.text() === 'Edit')?.trigger('click');
    // Simulate modal submit for edit
    (wrapper.vm as any).handleModalSubmit({ title: 'Updated', content: 'Updated Content', image: null });
    await flushPromises();

    expect(wrapper.text()).toContain('Updated');
    expect(wrapper.text()).toContain('Updated Content');
  });

  it('deletes a note', async () => {
    // 1. Initial fetch, 2. DELETE, 3. Fetch after delete
    mockFetchSequence([
      { ok: true, body: { items: mockNotes, meta: { page: 1, limit: 3, totalItems: 2, totalPages: 1 } } },
      { ok: true, body: {} },
      { ok: true, body: { items: [mockNotes[1]], meta: { page: 1, limit: 3, totalItems: 1, totalPages: 1 } } }
    ]);
    const wrapper = mount(NoteView);
    await flushPromises();

    // Open delete confirm
    await wrapper.findAll('button').find(btn => btn.text() === 'Delete')?.trigger('click');
    // Confirm delete
    await (wrapper.vm as any).deleteNoteConfirmed();
    await flushPromises();

    expect(wrapper.text()).not.toContain('Note 1');
    expect(wrapper.text()).toContain('Note 2');
  });
});