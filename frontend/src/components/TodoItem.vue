<script setup lang="ts">
import { ref } from 'vue'
import type { Todo } from '@/types/pocketbase'

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
</script>

<template>
  <div class="todo-item" :class="{ completed: todo.completed }">
    <input
      type="checkbox"
      :checked="todo.completed"
      @change="emit('toggle', todo.id)"
      class="checkbox"
    />

    <template v-if="isEditing">
      <input
        v-model="editTitle"
        @keyup.enter="saveEdit"
        @keyup.escape="cancelEdit"
        class="edit-input"
        v-focus
      />
      <button class="btn btn-sm btn-primary" @click="saveEdit">保存</button>
      <button class="btn btn-sm btn-ghost" @click="cancelEdit">取消</button>
    </template>

    <template v-else>
      <span class="title" @dblclick="startEdit">{{ todo.title }}</span>
      <div class="actions">
        <button class="btn btn-sm btn-ghost" @click="startEdit">编辑</button>
        <button class="btn btn-sm btn-danger" @click="emit('delete', todo.id)">删除</button>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
// v-focus 指令
export default {
  directives: {
    focus: {
      mounted(el: HTMLInputElement) {
        el.focus()
        el.select()
      }
    }
  }
}
</script>

<style scoped>
.todo-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  transition: background 0.15s ease;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-item:hover {
  background: var(--bg);
}

.todo-item.completed .title {
  text-decoration: line-through;
  color: var(--text-light);
}

.checkbox {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
  accent-color: var(--primary);
}

.title {
  flex: 1;
  font-size: 1rem;
  cursor: text;
}

.edit-input {
  flex: 1;
  padding: 0.375rem 0.5rem;
  font-size: 1rem;
  border: 1px solid var(--primary);
  border-radius: 0.375rem;
}

.actions {
  display: flex;
  gap: 0.375rem;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.todo-item:hover .actions {
  opacity: 1;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}
</style>
