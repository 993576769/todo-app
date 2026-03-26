<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTodosStore } from '@/stores/todos'
import TodoItem from '@/components/TodoItem.vue'
import { CheckSquare, LogOut, Plus, Loader2, Sparkles } from 'lucide-vue-next'

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
    <header class="bg-white/80 backdrop-blur-xl border-b border-gray-100 py-4 sticky top-0 z-10">
      <div class="max-w-[680px] mx-auto px-4 flex justify-between items-center">
        <h1 class="text-xl font-bold flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/20">
            <CheckSquare class="w-5 h-5 text-white" />
          </div>
          <span class="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Todo</span>
        </h1>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span class="text-gray-600 text-sm font-medium">{{ auth.user?.name || auth.user?.email }}</span>
          </div>
          <button
            class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-200 cursor-pointer"
            @click="handleLogout"
          >
            <LogOut class="w-4 h-4" />
            登出
          </button>
        </div>
      </div>
    </header>

    <!-- Main -->
    <main class="max-w-[680px] mx-auto px-4 pt-10 pb-8">
      <!-- Input -->
      <div class="flex gap-3 mb-8">
        <input
          v-model="newTitle"
          @keyup.enter="handleAdd"
          placeholder="添加新任务..."
          class="flex-1 px-5 py-4 text-base bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 card-shadow"
          autofocus
        />
        <button
          class="inline-flex items-center gap-2 px-6 py-4 text-sm font-semibold text-white btn-gradient rounded-2xl cursor-pointer"
          @click="handleAdd"
        >
          <Plus class="w-5 h-5" />
          添加
        </button>
      </div>

      <!-- Loading -->
      <div v-if="todosStore.loading" class="text-center py-12">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 mb-4">
          <Loader2 class="w-6 h-6 text-primary animate-spin" />
        </div>
        <p class="text-gray-500 font-medium">加载中...</p>
      </div>

      <!-- Error -->
      <div v-if="todosStore.error" class="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-6 text-sm flex items-center gap-2">
        <span class="w-2 h-2 bg-red-500 rounded-full"></span>
        {{ todosStore.error }}
      </div>

      <!-- Todo List -->
      <div v-if="!todosStore.loading" class="bg-white/80 backdrop-blur rounded-2xl card-shadow overflow-hidden">
        <TodoItem
          v-for="todo in todosStore.todos"
          :key="todo.id"
          :todo="todo"
          @toggle="todosStore.toggleTodo"
          @update="todosStore.updateTodo"
          @delete="todosStore.deleteTodo"
        />

        <div v-if="todosStore.todos.length === 0" class="text-center py-16">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 mb-4">
            <Sparkles class="w-8 h-8 text-primary/60" />
          </div>
          <p class="text-gray-500 font-medium">暂无任务</p>
          <p class="text-gray-400 text-sm mt-1">添加一个新任务开始吧！</p>
        </div>
      </div>

      <!-- Stats -->
      <div v-if="todosStore.todos.length > 0" class="mt-6 flex items-center justify-center gap-3">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur rounded-full card-shadow text-sm text-gray-600">
          <div class="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>{{ todosStore.todos.filter(t => t.completed).length }} / {{ todosStore.todos.length }} 已完成</span>
        </div>
        <div v-if="todosStore.todos.filter(t => t.completed).length === todosStore.todos.length" class="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full text-sm text-green-600 font-medium">
          <Sparkles class="w-4 h-4" />
          全部完成！
        </div>
      </div>
    </main>
  </div>
</template>
