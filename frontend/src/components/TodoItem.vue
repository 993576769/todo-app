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
    class="group flex items-center gap-4 px-5 py-4 border-b border-[var(--color-border)]/30 last:border-b-0 hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10 transition-all duration-200"
    :class="{ 'bg-green-500/10': todo.completed }"
  >
    <button
      class="w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 shrink-0 cursor-pointer"
      :class="todo.completed
        ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-transparent text-white shadow-md shadow-green-500/20'
        : 'border-[var(--color-border)] hover:border-primary hover:bg-primary/10'"
      @click="emit('toggle', todo.id)"
    >
      <Check v-if="todo.completed" class="w-3.5 h-3.5" />
    </button>

    <template v-if="isEditing">
      <input
        v-model="editTitle"
        @keyup.enter="saveEdit"
        @keyup.escape="cancelEdit"
        class="flex-1 px-3 py-2 text-base border-2 border-primary rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/20 bg-[var(--color-surface-elevated)] text-[var(--color-text)] transition-all duration-200"
        v-focus
      />
      <button
        class="px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary to-secondary rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 cursor-pointer"
        @click="saveEdit"
      >
        <Check class="w-4 h-4" />
      </button>
      <button
        class="px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] bg-[var(--color-surface-elevated)] hover:bg-[var(--color-border)] rounded-xl transition-all duration-200 cursor-pointer"
        @click="cancelEdit"
      >
        <X class="w-4 h-4" />
      </button>
    </template>

    <template v-else>
      <span
        class="flex-1 text-base cursor-pointer transition-all duration-200"
        :class="todo.completed ? 'line-through text-[var(--color-text-muted)]' : 'text-[var(--color-text)]'"
        @dblclick="startEdit"
      >
        {{ todo.title }}
      </span>
      <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          class="p-2 text-[var(--color-text-muted)] hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-200 cursor-pointer"
          @click="startEdit"
        >
          <Pencil class="w-4 h-4" />
        </button>
        <button
          class="p-2 text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 cursor-pointer"
          @click="emit('delete', todo.id)"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </template>
  </div>
</template>
