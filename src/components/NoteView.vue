<template>
  <h1>Note List</h1>
  <div class="note-list-header">
    <button class="add-note-btn" @click="openAddModal">+ Add Note</button>
  </div>
  <ul>
    <li v-for="note in notes" :key="note.id" class="note-item">
      <div class="note-content">
        <img
          :src="note.image || defaultSvg"
          alt="Note Image"
          class="note-image"
        />
        <div class="note-text">
          <h3>{{ note.title }}</h3>
          <p>{{ note.content }}</p>
        </div>
      </div>
      <div class="note-actions">
        <button @click="openEditModal(note)">Edit</button>
        <button @click="deleteNote(note.id)">Delete</button>
      </div>
    </li>
  </ul>
  
  <!-- Note Modal for Add/Edit -->
  <NoteModal
    v-if="showModal"
    :show="showModal"
    :form="form"
    :isEdit="isEdit"
    @close="closeModal"
    @submit="handleModalSubmit"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import NoteModal from './NoteModal.vue';

const defaultSvg = 'data:image/svg+xml;utf8,<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" fill="%23e0e0e0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="12" fill="%23777">No Image</text></svg>';

const notes = ref([
  { id: 1, title: 'First Note', content: 'This is the first note.', image: 'https://via.placeholder.com/60' },
  { id: 2, title: 'Second Note', content: 'This is the second note.' }, // No image
  { id: 3, title: 'Third Note', content: 'This is the third note.', image: 'https://via.placeholder.com/60' },
]);

const showModal = ref(false);
const isEdit = ref(false);
const editId = ref<number|null>(null);

const form = ref({
  title: '',
  content: '',
  image: ''
});

function openAddModal() {
  isEdit.value = false;
  form.value = { title: '', content: '', image: '' };
  showModal.value = true;
  editId.value = null;
}

function openEditModal(note: { id: number; title: string; content: string; image?: string }) {
  isEdit.value = true;
  form.value = {
    title: note.title,
    content: note.content,
    image: note.image || ''
  };
  showModal.value = true;
  editId.value = note.id;
}

function closeModal() {
  showModal.value = false;
  form.value = { title: '', content: '', image: '' };
  editId.value = null;
}

function handleModalSubmit(newNote: { title: string; content: string; image: string }) {
  if (isEdit.value && editId.value !== null) {
    // Edit existing note
    const idx = notes.value.findIndex(n => n.id === editId.value);
    if (idx !== -1) {
      notes.value[idx] = {
        ...notes.value[idx],
        ...newNote,
        image: newNote.image || undefined
      };
    }
  } else {
    // Add new note
    notes.value.push({
      id: Date.now(),
      ...newNote,
      image: newNote.image || undefined
    });
  }
  closeModal();
}

function deleteNote(noteId: number) {
  notes.value = notes.value.filter(note => note.id !== noteId);
}
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
  box-shadow: 0 2px 8px rgba(60,60,60,0.06);
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
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.25);
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
  box-shadow: 0 4px 32px rgba(0,0,0,0.12);
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
