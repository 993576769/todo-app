<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTodosStore } from '@/stores/todos'
import TodoItem from '@/components/TodoItem.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import PrioritySelect from '@/components/PrioritySelect.vue'
import DueDatePicker from '@/components/DueDatePicker.vue'
import { CheckSquare, LogOut, Plus, Loader2, Sparkles } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()
const todosStore = useTodosStore()

const newTitle = ref('')
const newPriority = ref(0)
const newDueDate = ref<string | null>(null)

// 初始化
onMounted(async () => {
  await todosStore.fetchTodos()
  todosStore.subscribe()
})

// 清理
onUnmounted(() => {
  todosStore.unsubscribe()
})

// 添加 todo
const handleAdd = async () => {
  if (!newTitle.value.trim()) return

  try {
    await todosStore.addTodo(newTitle.value.trim(), newPriority.value, newDueDate.value)
    newTitle.value = ''
    newPriority.value = 0
    newDueDate.value = null
  } catch (e) {
    console.error(e)
  }
}

// 登出
const handleLogout = () => {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen">
    <!-- Header -->
    <header class="bg-[var(--color-surface)]/80 backdrop-blur-xl border-b border-[var(--color-border)]/50 py-3 sm:py-4 sticky top-0 z-10">
      <div class="max-w-[680px] mx-auto px-3 sm:px-4 flex justify-between items-center gap-2">
        <h1 class="text-lg sm:text-xl font-bold flex items-center gap-2 sm:gap-2.5 shrink-0">
          <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/20">
            <CheckSquare class="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span class="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Todo</span>
        </h1>
        <div class="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <!-- User info - hidden on very small screens -->
          <div class="hidden min-[400px]:flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-[var(--color-surface-elevated)]/50 rounded-full border border-[var(--color-border)]/50">
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span class="text-[var(--color-text-muted)] text-xs sm:text-sm font-medium truncate max-w-[100px] sm:max-w-none">{{ auth.user?.name || auth.user?.email }}</span>
          </div>
          <button
            class="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-medium text-[var(--color-text-muted)] rounded-lg sm:rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 cursor-pointer"
            @click="handleLogout"
          >
            <LogOut class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span class="hidden sm:inline">登出</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main -->
    <main class="max-w-[680px] mx-auto px-3 sm:px-4 pt-6 sm:pt-10 pb-8">
      <!-- Input - Mobile: stacked, Desktop: inline -->
      <div class="flex flex-col sm:flex-row gap-3 mb-6 sm:mb-8">
        <input
          v-model="newTitle"
          @keyup.enter="handleAdd"
          placeholder="添加新任务..."
          class="w-full sm:flex-1 px-4 sm:px-5 py-3.5 sm:py-4 text-base bg-[var(--color-surface-card)]/80 border-2 border-[var(--color-border)] rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 text-[var(--color-text)] placeholder-[var(--color-text-placeholder)] transition-all duration-200 card-shadow"
          autofocus
        />
        <!-- Mobile: options row -->
        <div class="flex gap-2 sm:gap-3 items-center justify-between sm:justify-start">
          <div class="flex gap-2">
            <DueDatePicker v-model="newDueDate" />
            <PrioritySelect v-model="newPriority" />
          </div>
          <button
            class="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 text-sm font-semibold text-white btn-gradient rounded-2xl cursor-pointer min-h-[48px]"
            @click="handleAdd"
          >
            <Plus class="w-5 h-5" />
            <span>添加</span>
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="todosStore.loading" class="text-center py-12">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-4">
          <Loader2 class="w-6 h-6 text-primary animate-spin" />
        </div>
        <p class="text-[var(--color-text-muted)] font-medium">加载中...</p>
      </div>

      <!-- Error -->
      <div v-if="todosStore.error" class="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-6 text-sm flex items-center gap-2">
        <span class="w-2 h-2 bg-red-500 rounded-full"></span>
        {{ todosStore.error }}
      </div>

      <!-- Todo List -->
      <div v-if="!todosStore.loading" class="bg-[var(--color-surface-card)]/60 backdrop-blur rounded-2xl card-shadow overflow-hidden border border-[var(--color-border)]/30">
        <TodoItem
          v-for="todo in todosStore.todos"
          :key="todo.id"
          :todo="todo"
          @toggle="todosStore.toggleTodo"
          @update="todosStore.updateTodo"
          @updateDueDate="todosStore.updateDueDate"
          @delete="todosStore.deleteTodo"
        />

        <div v-if="todosStore.todos.length === 0" class="text-center py-16">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-4">
            <Sparkles class="w-8 h-8 text-primary/80" />
          </div>
          <p class="text-[var(--color-text)] font-medium">暂无任务</p>
          <p class="text-[var(--color-text-muted)] text-sm mt-1">添加一个新任务开始吧！</p>
        </div>
      </div>

      <!-- Stats -->
      <div v-if="todosStore.todos.length > 0" class="mt-6 flex items-center justify-center gap-3">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-card)]/60 backdrop-blur rounded-full card-shadow text-sm text-[var(--color-text-muted)] border border-[var(--color-border)]/30">
          <div class="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>{{ todosStore.todos.filter(t => t.completed).length }} / {{ todosStore.todos.length }} 已完成</span>
        </div>
        <div v-if="todosStore.todos.filter(t => t.completed).length === todosStore.todos.length" class="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full text-sm text-green-400 font-medium border border-green-500/20">
          <Sparkles class="w-4 h-4" />
          全部完成！
        </div>
      </div>
    </main>
  </div>
</template>
