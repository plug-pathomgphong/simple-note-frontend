<template>
  <h1>Note List</h1>
  <ul>
    <li v-for="note in notes" :key="note.id" class="note-item">
      <div class="note-content">
        <img
          :src="note.image || defaultSvg"
          alt="Note Image"
          class="note-image"
        />
        <div>
          <h3>{{ note.title }}</h3>
          <p>{{ note.content }}</p>
        </div>
      </div>
      <button @click="editNote(note.id)">Edit</button>
      <button @click="deleteNote(note.id)">Delete</button>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const defaultSvg = 'data:image/svg+xml;utf8,<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" fill="%23e0e0e0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="12" fill="%23777">No Image</text></svg>';

const notes = ref([
  { id: 1, title: 'First Note', content: 'This is the first note.', image: 'https://via.placeholder.com/60' },
  { id: 2, title: 'Second Note', content: 'This is the second note.' }, // No image
  { id: 3, title: 'Third Note', content: 'This is the third note.', image: 'https://via.placeholder.com/60' }
]);

function editNote(noteId: number) {
  alert(`Edit note with id: ${noteId}`);
}

function deleteNote(noteId: number) {
  notes.value = notes.value.filter(note => note.id !== noteId);
}
</script>

<style scoped>
.note-item {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 10px;
  background: #fafafa;
}
.note-content {
  display: flex;
  align-items: flex-start;
}
.note-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  margin-right: 16px;
}
button {
  margin-right: 8px;
  padding: 6px 12px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #f0f0f0;
}
</style>
