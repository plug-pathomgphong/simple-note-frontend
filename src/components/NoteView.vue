<template>
  <h1>Note List</h1>
  <div class="note-list-header">
    <button class="add-note-btn" @click="addNote">+ Add Note</button>
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
        <button @click="editNote(note.id)">Edit</button>
        <button @click="deleteNote(note.id)">Delete</button>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const defaultSvg = 'data:image/svg+xml;utf8,<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" fill="%23e0e0e0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="12" fill="%23777">No Image</text></svg>';

const notes = ref([
  { id: 1, title: 'First Note', content: 'This is the first note.', image: 'https://via.placeholder.com/60' },
  { id: 2, title: 'Second Note', content: 'This is the second note.' }, // No image
  { id: 3, title: 'Third Note', content: 'This is the third note.', image: 'https://via.placeholder.com/60' },
]);

function editNote(noteId: number) {
  alert(`Edit note with id: ${noteId}`);
}

function deleteNote(noteId: number) {
  notes.value = notes.value.filter(note => note.id !== noteId);
}

function addNote() {
  alert('Add Note clicked!');
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
</style>
