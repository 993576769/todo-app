<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Todo } from '@/types/pocketbase'
import { Pencil, Trash2, Check, X, Calendar } from 'lucide-vue-next'

const props = defineProps<{ todo: Todo }>()
const emit = defineEmits<{
  toggle: [id: string]
  update: [id: string, title: string]
  updateDueDate: [id: string, dueDate: string | null]
  delete: [id: string]
}>()

const isEditing = ref(false)
const editTitle = ref('')
const showDatePicker = ref(false)
const dateInputRef = ref<HTMLInputElement>()

const priorityBorderClass = computed(() => {
  switch (props.todo.priority) {
    case 2: return 'border-l-4 border-l-red-500'
    case 1: return 'border-l-4 border-l-yellow-500'
    default: return ''
  }
})

const dueDateStatus = computed(() => {
  if (!props.todo.dueDate || props.todo.completed) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(props.todo.dueDate)
  due.setHours(0, 0, 0, 0)

  const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return { status: 'overdue', text: '已过期', class: 'text-red-500 bg-red-500/10' }
  } else if (diffDays === 0) {
    return { status: 'today', text: '今天', class: 'text-yellow-500 bg-yellow-500/10' }
  } else if (diffDays === 1) {
    return { status: 'tomorrow', text: '明天', class: 'text-orange-400 bg-orange-400/10' }
  } else {
    return {
      status: 'upcoming',
      text: due.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      class: 'text-blue-400 bg-blue-400/10'
    }
  }
})

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

const openDatePicker = () => {
  showDatePicker.value = true
  dateInputRef.value?.showPicker?.()
}

const handleDateChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('updateDueDate', props.todo.id, target.value || null)
  showDatePicker.value = false
}

const clearDueDate = () => {
  emit('updateDueDate', props.todo.id, null)
  showDatePicker.value = false
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
    class="group flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3.5 sm:py-4 border-b border-[var(--color-border)]/30 last:border-b-0 hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10 transition-all duration-200"
    :class="{ 'bg-green-500/10': todo.completed, [priorityBorderClass]: true }"
  >
    <button
      class="w-7 h-7 sm:w-6 sm:h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 shrink-0 cursor-pointer"
      :class="todo.completed
        ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-transparent text-white shadow-md shadow-green-500/20'
        : 'border-[var(--color-border)] hover:border-primary hover:bg-primary/10'"
      @click="emit('toggle', todo.id)"
    >
      <Check v-if="todo.completed" class="w-4 h-4 sm:w-3.5 sm:h-3.5" />
    </button>

    <template v-if="isEditing">
      <input
        v-model="editTitle"
        @keyup.enter="saveEdit"
        @keyup.escape="cancelEdit"
        class="flex-1 px-3 py-2.5 sm:py-2 text-base border-2 border-primary rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/20 bg-[var(--color-surface-elevated)] text-[var(--color-text)] transition-all duration-200 min-h-[44px]"
        v-focus
      />
      <button
        class="px-4 sm:px-3 py-2.5 sm:py-2 text-sm font-medium text-white bg-gradient-to-r from-primary to-secondary rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
        @click="saveEdit"
      >
        <Check class="w-4 h-4" />
      </button>
      <button
        class="px-4 sm:px-3 py-2.5 sm:py-2 text-sm font-medium text-[var(--color-text-muted)] bg-[var(--color-surface-elevated)] hover:bg-[var(--color-border)] rounded-xl transition-all duration-200 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
        @click="cancelEdit"
      >
        <X class="w-4 h-4" />
      </button>
    </template>

    <template v-else>
      <span
        class="flex-1 text-base cursor-pointer transition-all duration-200 min-w-0"
        :class="todo.completed ? 'line-through text-[var(--color-text-muted)]' : 'text-[var(--color-text)]'"
        @dblclick="startEdit"
      >
        {{ todo.title }}
      </span>

      <!-- Due Date Display -->
      <div v-if="dueDateStatus" class="relative flex items-center shrink-0">
        <input
          ref="dateInputRef"
          type="date"
          :value="todo.dueDate ?? ''"
          class="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          @change="handleDateChange"
        />
        <button
          class="inline-flex items-center gap-1 px-2 py-1.5 sm:py-1 text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer min-h-[36px] sm:min-h-0"
          :class="dueDateStatus.class"
          @click.stop="openDatePicker"
        >
          <Calendar class="w-3.5 h-3.5 sm:w-3 sm:h-3" />
          <span class="hidden xs:inline">{{ dueDateStatus.text }}</span>
        </button>
      </div>
      <div v-else-if="!todo.completed" class="relative flex items-center shrink-0">
        <input
          ref="dateInputRef"
          type="date"
          :value="todo.dueDate ?? ''"
          class="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          @change="handleDateChange"
        />
        <button
          class="p-2 sm:p-1.5 text-[var(--color-text-muted)] hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer min-h-[44px] sm:min-h-0 min-w-[44px] sm:min-w-0 flex items-center justify-center"
          title="设置截止日期"
          @click.stop="openDatePicker"
        >
          <Calendar class="w-4 h-4 sm:w-3.5 sm:h-3.5" />
        </button>
      </div>

      <!-- Action buttons - always visible on mobile, hover on desktop -->
      <div class="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 shrink-0">
        <button
          class="p-2.5 sm:p-2 text-[var(--color-text-muted)] hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-200 cursor-pointer min-h-[44px] sm:min-h-0 min-w-[44px] sm:min-w-0 flex items-center justify-center"
          @click="startEdit"
        >
          <Pencil class="w-4 h-4" />
        </button>
        <button
          class="p-2.5 sm:p-2 text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 cursor-pointer min-h-[44px] sm:min-h-0 min-w-[44px] sm:min-w-0 flex items-center justify-center"
          @click="emit('delete', todo.id)"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </template>
  </div>
</template>
