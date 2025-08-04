<template>
  <div class="modal-overlay" data-testid="modal-overlay">
    <div class="modal" data-testid="modal">
      <h2 data-testid="modal-title">{{ isEdit ? 'Edit Note' : 'Add Note' }}</h2>
      <form data-testid="modal-form" @submit.prevent="onSubmit">
        <div class="form-group">
          <label for="title" class="left-label" data-testid="title-label" >Title</label>
          <Field name="title" type="text" :validate-on-input="true" placeholder="Enter title"/>
          <ErrorMessage name="title" class="error-message"/>
        </div>
        <div class="form-group">
          <label for="content" class="left-label" data-testid="content-label">Content</label>
          <Field name="content" as="textarea" :validate-on-input="true" placeholder="Enter content"/>
          <ErrorMessage name="content" class="error-message"/>
        </div>
        <div class="form-group">
          <label for="image" class="left-label" data-testid="image-label">Image (optional)</label>

          <label class="custom-file-label" for="image" data-testid="image-label-text">
            <span>Choose Image</span>
          </label>
          <input id="image" type="file" accept="image/*"  @change="onFileChange" />
          <ErrorMessage name="image" class="error-message" />
          <div v-if="previewUrl">
            <p>Preview:</p>
            <img :src="previewUrl" alt="Preview" style="max-width: 200px; max-height: 200px;" />
          </div>
        </div>
        
        <div v-if="loading" class="modal-loading">
          <span class="loader"></span> Processing...
        </div>
        <div class="modal-actions">
          <button type="submit" class="add-note-btn" data-testid="submit-note-btn" :disabled="loading || !meta.valid">{{ isEdit ?
            'Save' : 'Add' }}</button>
          <button type="button" class="cancel-btn" data-testid="cancel-note-btn" @click="() => onClose()"
            :disabled="loading">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineEmits } from 'vue';
import { getBaseUrl } from '@/services/api';
import { useForm, Field, ErrorMessage  } from 'vee-validate';
import * as yup from 'yup';
import { toTypedSchema } from '@vee-validate/yup';
const BASE_API = getBaseUrl();
const props = defineProps<{
  show: boolean,
  form: { id?: string | number; title: string; content: string; image: File | string },
  isEdit?: boolean
}>();
const emit = defineEmits(['close', 'submit']);

const previewUrl = ref<string | null>(null);
const localForm = ref<{ title: string; content: string; image: string | File }>({ title: '', content: '', image: '' });
const selectedFileName = ref('');
const loading = ref(false);
const validationErrors = ref<{ title?: string; content?: string }>({});

watch(() => props.form, (val) => {
  localForm.value = { ...val };
  selectedFileName.value = '';
  validationErrors.value = {}; // Clear errors on form update
}, { immediate: true });

function onClose(success = false) {
  if (!loading.value) {
    emit('close', success);
    localForm.value = { title: '', content: '', image: '' };
    selectedFileName.value = '';
    validationErrors.value = {}; // Clear errors on close
  }
}

const schema = toTypedSchema(
  yup.object({
    title: yup.string().required('Title is required').min(3, 'Title must be at least 3 character').max(100, 'Title must be less than 100 characters'),
    content: yup.string().required('Content is required')
      .min(10, 'Content must be at least 10 characters')
      .max(1000, 'Content must be less than 1000 characters'),
    image: yup
    .mixed()
    .notRequired()
    .test('fileType', 'Only image files are allowed', (value) => {
      if (!value) return true 
      return value instanceof File && value.type.startsWith('image/')
    })
    .test('fileSize', 'Image is too large (max 2MB)', (value) => {
      if (!value) return true 
      return value instanceof File ? value.size <= 2 * 1024 * 1024 : true
    })
  })
);

const { handleSubmit, setFieldValue, meta } = useForm({
  validationSchema: schema,
});


function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files && target.files[0];
  if (file) {
    setFieldValue('image', file)
    selectedFileName.value = file.name;
    localForm.value.image = file;
    // Check if the file is an image before generating preview
    if (!file.type.startsWith('image/')) {
      previewUrl.value = null;
      return;
    }
    previewUrl.value = URL.createObjectURL(file)
  } else {
    selectedFileName.value = '';
    localForm.value.image = '';
    previewUrl.value = null;
  }
}

const onSubmit = handleSubmit(async values => {
  alert(JSON.stringify(values, null, 2));
  const formData = new FormData();
  formData.append('title', values.title);
  formData.append('content', values.content);
  if (values.image instanceof File) {
    formData.append('file', values.image);
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
});
// function validateForm() {
//   const errors: { title?: string; content?: string } = {};
//   if (!localForm.value.title || localForm.value.title.trim().length === 0) {
//     errors.title = 'Title is required';
//   } else if (localForm.value.title.length > 100) {
//     errors.title = 'Title must be less than 100 characters';
//   }
//   if (!localForm.value.content || localForm.value.content.trim().length === 0) {
//     errors.content = 'Content is required';
//   } else if (localForm.value.content.length > 1000) {
//     errors.content = 'Content must be less than 1000 characters';
//   }
//   validationErrors.value = errors;
//   return Object.keys(errors).length === 0;
// }


// async function handleModalSubmit() {
//   if (!validateForm()) {
//     return;
//   }
//   const formData = new FormData();
//   formData.append('title', localForm.value.title);
//   formData.append('content', localForm.value.content);
//   if (localForm.value.image) {
//     formData.append('file', localForm.value.image);
//   }
//   try {
//     loading.value = true;
//     console.log('Submitting form:', localForm.value, props.form.id);
//     // ...your API call here...
//     if (props.isEdit && props.form.id) {
//       // PATCH
//       await fetch(`${BASE_API}/notes/${props.form.id}`, {
//         method: 'PATCH',
//         body: formData,
//       });
//     } else {
//       // POST
//       await fetch(`${BASE_API}/notes`, {
//         method: 'POST',
//         body: formData,
//       });
//     }

//     // await fetchNotes(); // Uncomment if you have a fetchNotes function
//     loading.value = false;
//     onClose(true); // Only close if successful
//   } catch (e) {
//     console.error(e);
//     // Handle error, e.g., show a notification
//   } finally {
//     loading.value = false;
//   }
// }
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

.form-group span.error-message {
  text-align: left;
  color: #e53e3e;
  font-size: 13px;
  margin-top: 4px;
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
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  color: #e53e3e;
  font-size: 13px;
  margin-top: 4px;
  display: block;
}
</style>