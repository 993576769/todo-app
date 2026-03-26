<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTodosStore } from '@/stores/todos'
import TodoItem from '@/components/TodoItem.vue'
import { CheckSquare, LogOut, Plus, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()
const todosStore = useTodosStore()

const newTitle = ref('')

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
    await todosStore.addTodo(newTitle.value.trim())
    newTitle.value = ''
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
    <header class="bg-white border-b border-gray-200 py-4 sticky top-0 z-10">
      <div class="max-w-[640px] mx-auto px-4 flex justify-between items-center">
        <h1 class="text-xl font-bold text-primary flex items-center gap-2">
          <CheckSquare class="w-6 h-6" />
          Todo
        </h1>
        <div class="flex items-center gap-3">
          <span class="text-gray-500 text-sm">{{ auth.user?.name || auth.user?.email }}</span>
          <button
            class="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
            @click="handleLogout"
          >
            <LogOut class="w-4 h-4" />
            登出
          </button>
        </div>
      </div>
    </header>

    <!-- Main -->
    <main class="max-w-[640px] mx-auto px-4 pt-8">
      <!-- Input -->
      <div class="flex gap-2 mb-6">
        <input
          v-model="newTitle"
          @keyup.enter="handleAdd"
          placeholder="添加新任务..."
          class="flex-1 px-4 py-3 text-base bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
          autofocus
        />
        <button
          class="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
          @click="handleAdd"
        >
          <Plus class="w-4 h-4" />
          添加
        </button>
      </div>

      <!-- Loading -->
      <div v-if="todosStore.loading" class="text-center py-8 text-gray-500">
        <Loader2 class="w-6 h-6 animate-spin mx-auto mb-2" />
        加载中...
      </div>

      <!-- Error -->
      <div v-if="todosStore.error" class="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
        {{ todosStore.error }}
      </div>

      <!-- Todo List -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <TodoItem
          v-for="todo in todosStore.todos"
          :key="todo.id"
          :todo="todo"
          @toggle="todosStore.toggleTodo"
          @update="todosStore.updateTodo"
          @delete="todosStore.deleteTodo"
        />

        <div v-if="todosStore.todos.length === 0 && !todosStore.loading" class="text-center py-8 text-gray-500">
          暂无任务，添加一个吧！
        </div>
      </div>

      <!-- Stats -->
      <div v-if="todosStore.todos.length > 0" class="mt-4 text-center text-gray-500 text-sm">
        {{ todosStore.todos.filter(t => t.completed).length }} / {{ todosStore.todos.length }} 已完成
      </div>
    </main>
  </div>
</template>
