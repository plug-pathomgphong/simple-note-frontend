<template>
  <div class="modal-overlay" data-testid="modal-overlay">
    <div class="modal" data-testid="modal">
      <h2 data-testid="modal-title">{{ isEdit ? 'Edit Note' : 'Add Note' }}</h2>
      
      <!-- API Error Message -->
      <div v-if="apiError" class="api-error-message" data-testid="api-error" aria-live="polite">
        <span class="error-icon">⚠️</span>
        {{ apiError }}
      </div>
      
      <form data-testid="modal-form" @submit.prevent="onSubmit">
        <div class="form-group">
          <label for="title" class="left-label" data-testid="title-label">Title</label>
          <Field 
            name="title" 
            type="text" 
            :validate-on-input="true" 
            placeholder="Enter title"
            class="form-input"
            data-testid="title-input"
          />
          <ErrorMessage name="title" class="error-message"/>
        </div>
        
        <div class="form-group">
          <label for="content" class="left-label" data-testid="content-label">Content</label>
          <Field 
            name="content" 
            as="textarea" 
            :validate-on-input="true" 
            placeholder="Enter content"
            class="form-textarea"
            data-testid="content-input"
          />
          <ErrorMessage name="content" class="error-message"/>
        </div>
        
        <div class="form-group">
          <label for="image" class="left-label" data-testid="image-label">Image (optional)</label>
          <label class="custom-file-label" for="image" data-testid="image-label-text">
            <span>Choose Image</span>
          </label>
          <input 
            id="image" 
            type="file" 
            accept="image/*"  
            @change="onFileChange" 
            data-testid="image-input"
          />
          <ErrorMessage name="image" class="error-message" data-testid="image-error" />
          
          <div v-if="previewUrl" class="image-preview">
            <p>Preview:</p>
            <img :src="previewUrl" alt="Preview" class="preview-image" />
          </div>
        </div>
        
        <div v-if="loading" class="modal-loading">
          <span class="loader"></span> Processing...
        </div>
        
        <div class="modal-actions">
          <button 
            type="submit" 
            class="add-note-btn" 
            data-testid="submit-note-btn" 
            :disabled="loading || !meta.valid"
          >
            {{ isEdit ? 'Save' : 'Add' }}
          </button>
          <button 
            type="button" 
            class="cancel-btn" 
            data-testid="cancel-note-btn" 
            @click="() => onClose()"
            :disabled="loading"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineEmits } from 'vue';
import { useForm, Field, ErrorMessage } from 'vee-validate';
import * as yup from 'yup';
import { toTypedSchema } from '@vee-validate/yup';
import { getBaseUrl } from '@/services/api';

// Types
interface NoteForm {
  id?: string | number;
  title: string;
  content: string;
  image: File | string;
}

interface Props {
  show: boolean;
  form: NoteForm;
  isEdit?: boolean;
}

// Constants
const BASE_API = getBaseUrl();
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

// Props and emits
const props = defineProps<Props>();
const emit = defineEmits<{
  close: [success: boolean];
  submit: [data: any];
}>();

// Reactive state
const previewUrl = ref<string | null>(null);
const loading = ref(false);
const apiError = ref<string | null>(null);

// Validation schema
const validationSchema = toTypedSchema(
  yup.object({
    title: yup
      .string()
      .required('Title is required')
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title must be less than 100 characters'),
    content: yup
      .string()
      .required('Content is required')
      .min(10, 'Content must be at least 10 characters')
      .max(1000, 'Content must be less than 1000 characters'),
    image: yup
      .mixed()
      .notRequired()
      .test('fileType', 'Only image files are allowed', (value) => {
        if (!value) return true;
        return value instanceof File && value.type.startsWith('image/');
      })
      .test('fileSize', 'Image is too large (max 2MB)', (value) => {
        if (!value) return true;
        return value instanceof File ? value.size <= MAX_FILE_SIZE : true;
      })
  })
);

// Form setup
const { handleSubmit, setFieldValue, meta, resetForm } = useForm({
  validationSchema,
  initialValues: {
    title: '',
    content: '',
    image: undefined
  }
});

// Watchers
watch(() => props.form, (newForm) => {
  setFieldValue('title', newForm.title);
  setFieldValue('content', newForm.content);
  setFieldValue('image', newForm.image);
  previewUrl.value = null;
  apiError.value = null; // Clear API errors when form changes
}, { immediate: true });

// Methods
function onClose(success = false) {
  emit('close', success);
  resetForm();
  previewUrl.value = null;
  apiError.value = null; // Clear errors on close
  
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    setFieldValue('image', file);
    
    if (file.type.startsWith('image/')) {
      previewUrl.value = URL.createObjectURL(file);
    } else {
      previewUrl.value = null;
    }
  } else {
    setFieldValue('image', undefined);
    previewUrl.value = null;
  }
}

async function submitForm(values: any) {
  const formData = new FormData();
  formData.append('title', values.title);
  formData.append('content', values.content);
  
  if (values.image instanceof File) {
    formData.append('file', values.image);
  }


  try {
    loading.value = true;
    apiError.value = null; // Clear previous errors
    
    const url = props.isEdit && props.form.id 
      ? `${BASE_API}/notes/${props.form.id}`
      : `${BASE_API}/notes`;
    
    const method = props.isEdit ? 'PATCH' : 'POST';
    
    const response = await fetch(url, {
      method,
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `Failed to ${props.isEdit ? 'update' : 'create'} note.`;
      
      // Try to get error details from response
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    onClose(true);
  } catch (error) {
    console.error('Error submitting form:', error);
    apiError.value = error instanceof Error ? error.message : 'An unexpected error occurred.';
  } finally {
    loading.value = false;
  }
}

const onSubmit = handleSubmit(submitForm);
</script>

<style scoped>
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

.api-error-message {
  background: #fed7d7;
  border: 1px solid #feb2b2;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 1rem;
  color: #c53030;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-icon {
  font-size: 16px;
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

.form-input,
.form-textarea {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 15px;
}

.form-textarea {
  min-height: 60px;
  resize: vertical;
}

.form-group input[type="file"] {
  display: none;
}

.error-message {
  color: #e53e3e;
  font-size: 13px;
  margin-top: 4px;
  display: block;
  text-align: left;
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

.image-preview {
  margin-top: 8px;
}

.preview-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 4px;
  border: 1px solid #ccc;
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

.add-note-btn:hover:not(:disabled) {
  background: #369870;
}

.add-note-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.cancel-btn:hover:not(:disabled) {
  background: #ddd;
}

.cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  to {
    transform: rotate(360deg);
  }
}
</style>