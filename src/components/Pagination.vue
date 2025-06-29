<template>
  <div class="flex justify-center mt-4 space-x-1">
    <!-- Prev -->
    <button
      class="px-3 py-1 border rounded disabled:opacity-50"
      :disabled="modelValue === 1"
      @click="$emit('update:modelValue', modelValue - 1)"
    >
      Prev
    </button>

    <!-- Page buttons -->
    <template v-for="p in paginationRange" :key="p + '-'">
      <span
        v-if="p === '...'"
        class="px-3 py-1 text-gray-400 select-none"
      >...</span>

      <button
        v-else
        class="px-3 py-1 border rounded"
        :class="{
          ' !bg-blue-600 !text-white': modelValue === p,
          'hover:bg-gray-100': modelValue !== p
        }"
        @click="$emit('update:modelValue', p)"
      >
        {{ p }}
      </button>
    </template>

    <!-- Next -->
    <button
      class="px-3 py-1 border rounded disabled:opacity-50"
      :disabled="modelValue === totalPages"
      @click="$emit('update:modelValue', modelValue + 1)"
    >
      Next
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: number
  totalPages: number
}>()

const delta = 2 // number of pages before and after current

const paginationRange = computed(() => {
  const total = props.totalPages
  const current = props.modelValue
  const range: (number | '...')[] = []

  if (total <= 7) {
    // show all pages
    for (let i = 1; i <= total; i++) range.push(i)
    return range
  }

  const left = Math.max(current - delta, 2)
  const right = Math.min(current + delta, total - 1)

  range.push(1)

  if (left > 2) {
    range.push('...')
  }

  for (let i = left; i <= right; i++) {
    range.push(i)
  }

  if (right < total - 1) {
    range.push('...')
  }

  range.push(total)

  return range
})
</script>