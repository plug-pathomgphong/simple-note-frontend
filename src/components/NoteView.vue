<template>
  <header class="note-list-header-top">
    <h1>Note List</h1>
    <Pagination v-model="pagination.page" :totalPages="pagination.totalPages" />
  </header>

  <div class="note-list-header">
    <button class="add-note-btn" @click="openAddModal" data-testid="add-note-btn">+ Add Note</button>
  </div>
  
  <!-- Enhanced Error Message Display -->
  <div v-if="errorMessage" class="error-message-container" data-testid="error-message">
    <div class="error-message">
      
      <div class="error-content">
        <div class="error-text-container"><span class="error-icon">⚠️</span><p class="error-text">{{ errorMessage }}</p></div>
        <button @click="retryFetch" class="retry-btn" data-testid="retry-btn">
          Try Again
        </button>
      </div>
    </div>
  </div>
  
  <div class="note-list-wrapper" data-testid="note-list-wrapper">
    <div v-if="notes.length === 0 && !errorMessage" class="no-notes-message" data-testid="no-notes-message">
      No notes available. Click "Add Note" to create one.
    </div>
    <ul v-else-if="notes.length > 0" class="note-list" data-testid="note-list">
      <li v-for="note in notes" :key="note.id" class="note-item" data-testid="note-item">
        <div class="note-content" data-testid="note-content">
          <img :src="note.image || defaultSvg" alt="Note Image" class="note-image" data-testid="note-image" />
          <div class="note-text">
            <h3>{{ note.title }}</h3>
            <p>{{ note.content }}</p>
          </div>
        </div>
        <div class="note-actions">
          <button @click="openEditModal(note)" data-testid="edit-note-btn">Edit</button>
          <button @click="showDeleteConfirm(note)" data-testid="delete-note-btn">Delete</button>
        </div>
      </li>
    </ul>
  </div>

  <!-- Note Modal for Add/Edit -->
  <NoteModal v-if="showModal" :show="showModal" :form="form" :isEdit="isEdit" @close="closeModal"
    @submit="handleModalSubmit" />

  <!-- Confirm Delete Popup -->
  <div v-if="confirmDeleteNote" class="modal-overlay" style="z-index:2000" @click.self="cancelDelete" data-testid="confirm-delete-modal">
    <div class="modal" style="max-width:340px;text-align:center;" data-testid="confirm-delete-modal-content">
      <h3 data-testid="confirm-delete-modal-title">Confirm Delete</h3>
      <p data-testid="confirm-delete-modal-message">Are you sure you want to delete <b>{{ confirmDeleteNote.title }}</b>?</p>
      <div class="modal-actions" style="justify-content:center;">
        <button class="delete-btn" @click="deleteNoteConfirmed" data-testid="confirm-delete-btn">Yes, Delete</button>
        <button class="cancel-btn" @click="cancelDelete" data-testid="cancel-delete-btn">Cancel</button>
      </div>
    </div>
  </div>
  <!-- Pagination (bottom, always visible) -->
  <Pagination v-model="pagination.page" :totalPages="pagination.totalPages" />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import NoteModal from './NoteModal.vue';
import Pagination from './Pagination.vue';
import { getBaseUrl } from '@/services/api';

const defaultSvg = 'data:image/svg+xml;utf8,<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" fill="%23e0e0e0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="12" fill="%23777">No Image</text></svg>';

const notes = ref<Array<{ id: number; title: string; content: string; image?: string }>>([]);
const showModal = ref(false);
const isEdit = ref(false);
const editId = ref<number | null>(null);
const pagination = ref({ page: 1, limit: 3, totalItems: 0, totalPages: 0 });

const form = ref<{
  id?: number;
  title: string;
  content: string;
  image: string;
}>({
  id: undefined,
  title: '',
  content: '',
  image: ''
});

const errorMessage = ref('');
const confirmDeleteNote = ref<{ id: number; title: string } | null>(null);
const isLoading = ref(false);

// Base API URL
const BASE_API = getBaseUrl();

// Enhanced error handling function
function handleApiError(error: any, operation: string): string {
  console.error(`Error during ${operation}:`, error);
  
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'Network error. Please check your internet connection and try again.';
  }
  
  if (error.status === 404) {
    return 'The requested resource was not found.';
  }
  
  if (error.status === 500) {
    return 'Server error. Please try again later.';
  }
  
  if (error.status === 401) {
    return 'Authentication required. Please log in again.';
  }
  
  if (error.status === 403) {
    return 'You do not have permission to perform this action.';
  }
  
  if (error.message) {
    return error.message;
  }
  
  return `Failed to ${operation}. Please try again.`;
}

// Fetch notes from API with enhanced error handling
async function fetchNotes() {
  errorMessage.value = '';
  isLoading.value = true;
  
  try {
    const res = await fetch(`${BASE_API}/notes?page=${pagination.value.page}&limit=${pagination.value.limit}`);
    
    if (!res.ok) {
      let errorData;
      try {
        errorData = await res.json();
      } catch {
        errorData = { message: res.statusText || 'Failed to fetch notes' };
      }
      
      throw {
        status: res.status,
        message: errorData.message || errorData.error || 'Failed to fetch notes'
      };
    }
    
    const data = await res.json();
    notes.value = Array.isArray(data.items) && data.items.length > 0
      ? data.items.map((note: any) => ({
        id: note.id,
        title: note.title,
        content: note.content,
        image: note.attachmentUrl || ''
      }))
      : [];
    pagination.value = {
      page: data?.meta?.page || 1,
      limit: data?.meta?.limit || 10,
      totalItems: data?.meta?.totalItems || 0,
      totalPages: data?.meta?.totalPages || 0
    };
    
  } catch (error: any) {
    errorMessage.value = handleApiError(error, 'fetch notes');
  } finally {
    isLoading.value = false;
  }
}

// Retry function for failed operations
function retryFetch() {
  fetchNotes();
}

onMounted(fetchNotes);

function openAddModal() {
  isEdit.value = false;
  form.value = { title: '', content: '', image: '' };
  showModal.value = true;
  editId.value = null;
}

function openEditModal(note: { id: number; title: string; content: string; image?: string }) {
  isEdit.value = true;
  form.value = {
    id: note.id,
    title: note.title,
    content: note.content,
    image: note.image || ''
  };
  showModal.value = true;
  editId.value = note.id;
}

function closeModal(success = false) {
  console.log('Closing modal');
  showModal.value = false;
  form.value = { title: '', content: '', image: '' };
  editId.value = null;
  if (success) {
    fetchNotes(); // Refresh notes if modal was submitted successfully
  }
}

// Add or Edit note via API with enhanced error handling
async function handleModalSubmit(newNote: { title: string; content: string; image: File | null }) {
  // Simple validation
  if (!newNote.title.trim() || !newNote.content.trim()) {
    return; // Let the modal handle validation errors
  }

  const formData = new FormData();
  formData.append('title', newNote.title);
  formData.append('content', newNote.content);
  if (newNote.image) {
    formData.append('file', newNote.image);
  }

  try {
    if (isEdit.value && editId.value !== null) {
      // Edit existing note
      const res = await fetch(`${BASE_API}/notes/${editId.value}`, {
        method: 'PATCH',
        body: formData
      });
      
      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          errorData = { message: res.statusText || 'Failed to update note' };
        }
        
        throw {
          status: res.status,
          message: errorData.message || errorData.error || 'Failed to update note'
        };
      }
    } else {
      // Add new note
      const res = await fetch(`${BASE_API}/notes`, {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          errorData = { message: res.statusText || 'Failed to add note' };
        }
        
        throw {
          status: res.status,
          message: errorData.message || errorData.error || 'Failed to add note'
        };
      }
    }
    
    await fetchNotes();
    closeModal(true);
  } catch (error: any) {
    // The modal will handle displaying this error
    throw error;
  }
}

// Delete note via API with enhanced error handling
function showDeleteConfirm(note: { id: number; title: string }) {
  confirmDeleteNote.value = note;
}

function cancelDelete() {
  confirmDeleteNote.value = null;
}

async function deleteNoteConfirmed() {
  if (!confirmDeleteNote.value) return;
  
  try {
    const res = await fetch(`${BASE_API}/notes/${confirmDeleteNote.value.id}`, { 
      method: 'DELETE' 
    });
    
    if (!res.ok) {
      let errorData;
      try {
        errorData = await res.json();
      } catch {
        errorData = { message: res.statusText || 'Failed to delete note' };
      }
      
      throw {
        status: res.status,
        message: errorData.message || errorData.error || 'Failed to delete note'
      };
    }
    
    if (notes.value.length === 1 && pagination.value.page > 1) {
      pagination.value.page--; // Adjust page if last note is deleted
    }
    await fetchNotes();
  } catch (error: any) {
    errorMessage.value = handleApiError(error, 'delete note');
  } finally {
    confirmDeleteNote.value = null;
  }
}

// Watch for page changes and fetch notes
watch(() => pagination.value.page, (newPage, oldPage) => {
  if (newPage !== oldPage) {
    fetchNotes();
  }
});
</script>

<style scoped>
.note-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 14px;
  background: #fafafa;
  gap: 16px;
  transition: box-shadow 0.2s;
}

.note-item:hover {
  box-shadow: 0 2px 8px rgba(60, 60, 60, 0.06);
}

.note-content {
  display: flex;
  align-items: flex-start;
  flex: 1 1 0;
  gap: 16px;
  text-align: left;
}

.note-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  background: #e0e0e0;
  flex-shrink: 0;
}

.note-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.note-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 16px;
}

.note-actions button {
  margin-right: 0;
  margin-bottom: 0;
  padding: 6px 14px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #f0f0f0;
  color: #333;
  transition: background 0.2s;
}

.note-actions button:hover {
  background: #e0e0e0;
}

.note-list-wrapper {
  min-height: 400px;
  max-height: 60vh;
  overflow-y: auto;
  margin-bottom: 2rem;
}

.no-notes-message {
  text-align: center;
  color: #777;
  font-size: 16px;
  margin-top: 20px;
  background-color: #f9f9f9;
  padding: 20px;
}

.error-message-container {
  margin-bottom: 1rem;
}

.error-message {
  background: #fed7d7;
  border: 1px solid #feb2b2;
  border-radius: 8px;
  padding: 16px;
  color: #c53030;
  font-size: 14px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.error-text-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.error-icon {
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 2px;
}

.error-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.error-text {
  margin: 0;
  line-height: 1.4;
}

.retry-btn {
  align-self: center;
  padding: 6px 12px;
  font-size: 13px;
  border: 1px solid #c53030;
  border-radius: 4px;
  background: transparent;
  color: #c53030;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: #c53030;
  color: white;
}

@media (max-width: 600px) {
  .note-item {
    flex-direction: column;
    align-items: stretch;
    padding: 12px;
    gap: 10px;
  }

  .note-content {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .note-image {
    width: 100%;
    height: 180px;
    margin-bottom: 8px;
  }

  .note-actions {
    flex-direction: row;
    gap: 10px;
    margin-left: 0;
    margin-top: 8px;
    justify-content: flex-end;
  }
  
  .error-message {
    flex-direction: column;
    gap: 8px;
  }
  
  .error-content {
    gap: 8px;
  }
}

.note-list-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.add-note-btn {
  padding: 8px 18px;
  font-size: 15px;
  border: none;
  border-radius: 4px;
  background: #42b883;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}

.add-note-btn:hover {
  background: #369870;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  border-radius: 10px;
  padding: 2rem;
  min-width: 320px;
  max-width: 90vw;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.12);
}

.form-group {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 15px;
}

.form-group textarea {
  min-height: 60px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.cancel-btn {
  padding: 8px 18px;
  font-size: 15px;
  border: none;
  border-radius: 4px;
  background: #eee;
  color: #333;
  cursor: pointer;
  transition: background 0.2s;
}

.cancel-btn:hover {
  background: #ddd;
}

.form-group label.left-label {
  text-align: left;
  margin-bottom: 0.5rem;
  font-weight: 500;
  display: block;
}

.form-group input[type="file"] {
  display: none;
}

.custom-file-label {
  display: inline-block;
  padding: 8px 16px;
  background: #f0f0f0;
  color: #333;
  border-radius: 4px;
  border: 1px solid #ccc;
  cursor: pointer;
  font-size: 15px;
  transition: background 0.2s, border 0.2s;
  margin-top: 4px;
  margin-bottom: 0;
}

.custom-file-label:hover {
  background: #e0e0e0;
  border-color: #42b883;
}

.selected-file-name {
  display: block;
  margin-top: 6px;
  color: #666;
  font-size: 13px;
  word-break: break-all;
}
</style>
