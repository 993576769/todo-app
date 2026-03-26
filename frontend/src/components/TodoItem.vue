<script setup lang="ts">
import { ref } from 'vue'
import type { Todo } from '@/types/pocketbase'
import { Pencil, Trash2, Check, X } from 'lucide-vue-next'

const props = defineProps<{ todo: Todo }>()
const emit = defineEmits<{
  toggle: [id: string]
  update: [id: string, title: string]
  delete: [id: string]
}>()

const isEditing = ref(false)
const editTitle = ref('')

const startEdit = () => {
  editTitle.value = props.todo.title
  isEditing.value = true
}

const saveEdit = () => {
  if (editTitle.value.trim() && editTitle.value !== props.todo.title) {
    emit('update', props.todo.id, editTitle.value.trim())
  }
  isEditing.value = false
}

const cancelEdit = () => {
  isEditing.value = false
  editTitle.value = ''
}

// v-focus directive
const vFocus = {
  mounted(el: HTMLInputElement) {
    el.focus()
    el.select()
  }
}
</script>

<template>
  <div
    class="group flex items-center gap-3 px-4 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
    :class="{ 'opacity-60': todo.completed }"
  >
    <button
      class="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0"
      :class="todo.completed
        ? 'bg-primary border-primary text-white'
        : 'border-gray-300 hover:border-primary'"
      @click="emit('toggle', todo.id)"
    >
      <Check v-if="todo.completed" class="w-3 h-3" />
    </button>

    <template v-if="isEditing">
      <input
        v-model="editTitle"
        @keyup.enter="saveEdit"
        @keyup.escape="cancelEdit"
        class="flex-1 px-2 py-1.5 text-base border border-primary rounded"
        v-focus
      />
      <button
        class="px-2 py-1 text-xs font-medium text-white bg-primary rounded hover:bg-primary-hover transition-colors"
        @click="saveEdit"
      >
        <Check class="w-4 h-4" />
      </button>
      <button
        class="px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded transition-colors"
        @click="cancelEdit"
      >
        <X class="w-4 h-4" />
      </button>
    </template>

    <template v-else>
      <span
        class="flex-1 text-base cursor-text"
        :class="todo.completed ? 'line-through text-gray-400' : 'text-gray-900'"
        @dblclick="startEdit"
      >
        {{ todo.title }}
      </span>
      <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          class="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded transition-colors"
          @click="startEdit"
        >
          <Pencil class="w-4 h-4" />
        </button>
        <button
          class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          @click="emit('delete', todo.id)"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </template>
  </div>
</template>
