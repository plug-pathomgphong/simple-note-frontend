<template>
  <div class="modal-overlay" >
    <div class="modal">
      <h2>{{ isEdit ? 'Edit Note' : 'Add Note' }}</h2>
      <form @submit.prevent="handleModalSubmit">
        <div class="form-group">
          <label for="title" class="left-label">Title</label>
          <input id="title" v-model="localForm.title" required />
        </div>
        <div class="form-group">
          <label for="content" class="left-label">Content</label>
          <textarea id="content" v-model="localForm.content" required></textarea>
        </div>
        <div class="form-group">
          <label for="image" class="left-label">Image (optional)</label>
          <label class="custom-file-label" for="image">
            <span>Choose Image</span>
          </label>
          <input
            id="image"
            type="file"
            accept="image/*"
            @change="onFileChange"
          />
          <span v-if="selectedFileName" class="selected-file-name">{{ selectedFileName }}</span>
        </div>
        <div v-if="loading" class="modal-loading">
          <span class="loader"></span> Processing...
        </div>
        <div class="modal-actions">
          <button type="submit" class="add-note-btn" :disabled="loading">{{ isEdit ? 'Save' : 'Add' }}</button>
          <button type="button" class="cancel-btn" @click="() => onClose()" :disabled="loading">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineEmits } from 'vue';
import { getBaseUrl } from '@/services/api';

const BASE_API = getBaseUrl();
const props = defineProps<{
  show: boolean,
  form: { id?: string | number; title: string; content: string; image: File | string },
  isEdit?: boolean
}>();
const emit = defineEmits(['close', 'submit']);

const localForm = ref<{ title: string; content: string; image: string | File }>({ title: '', content: '', image: '' });
const selectedFileName = ref('');
const loading = ref(false);

watch(() => props.form, (val) => {
  localForm.value = { ...val };
  selectedFileName.value = '';
}, { immediate: true });

function onClose(success = false) {
  if (!loading.value) {
    emit('close', success);
    localForm.value = { title: '', content: '', image: '' };
    selectedFileName.value = '';
  }
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files && target.files[0];
  if (file) {
    selectedFileName.value = file.name;
    localForm.value.image = file;
  } else {
    selectedFileName.value = '';
    localForm.value.image = '';
  }
}


async function handleModalSubmit() {
  const formData = new FormData();
  formData.append('title', localForm.value.title);
  formData.append('content', localForm.value.content);
  if (localForm.value.image) {
    formData.append('file', localForm.value.image);
  }
  try {
    loading.value = true;
    console.log('Submitting form:', localForm.value, props.form.id);
    // ...your API call here...
    if (props.isEdit && props.form.id) {
      // PATCH
      await fetch(`${BASE_API}/notes/${props.form.id}`, {
        method: 'PATCH',
        body: formData,
      });
    } else {
      // POST
      await fetch(`${BASE_API}/notes`, {
        method: 'POST',
        body: formData,
      });
    }

    // await fetchNotes(); // Uncomment if you have a fetchNotes function
    loading.value = false;
    onClose(true); // Only close if successful
  } catch (e) {
    console.error(e);
    // Handle error, e.g., show a notification
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
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
.form-group label.left-label {
  text-align: left;
  margin-bottom: 0.5rem;
  font-weight: 500;
  display: block;
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
.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
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
.modal-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #42b883;
  font-size: 15px;
  margin-bottom: 1rem;
}
.loader {
  width: 18px;
  height: 18px;
  border: 3px solid #42b883;
  border-top: 3px solid #e0e0e0;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>