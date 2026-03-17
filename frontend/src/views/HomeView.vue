<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTodosStore } from '@/stores/todos'
import TodoItem from '@/components/TodoItem.vue'

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
  <div class="home">
    <!-- Header -->
    <header class="header">
      <div class="container header-content">
        <h1 class="logo">📝 Todo</h1>
        <div class="user-info">
          <span class="user-name">{{ auth.user?.name || auth.user?.email }}</span>
          <button class="btn btn-ghost" @click="handleLogout">登出</button>
        </div>
      </div>
    </header>

    <!-- Main -->
    <main class="main container">
      <!-- Input -->
      <div class="input-group">
        <input
          v-model="newTitle"
          @keyup.enter="handleAdd"
          placeholder="添加新任务..."
          class="input"
          autofocus
        />
        <button class="btn btn-primary" @click="handleAdd">添加</button>
      </div>

      <!-- Loading -->
      <div v-if="todosStore.loading" class="loading">加载中...</div>

      <!-- Error -->
      <div v-if="todosStore.error" class="error">{{ todosStore.error }}</div>

      <!-- Todo List -->
      <div class="todo-list card">
        <TodoItem
          v-for="todo in todosStore.todos"
          :key="todo.id"
          :todo="todo"
          @toggle="todosStore.toggleTodo"
          @update="todosStore.updateTodo"
          @delete="todosStore.deleteTodo"
        />
        
        <div v-if="todosStore.todos.length === 0 && !todosStore.loading" class="empty">
          暂无任务，添加一个吧！
        </div>
      </div>

      <!-- Stats -->
      <div v-if="todosStore.todos.length > 0" class="stats">
        <span>{{ todosStore.todos.filter(t => t.completed).length }} / {{ todosStore.todos.length }} 已完成</span>
      </div>
    </main>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
}

.header {
  background: white;
  border-bottom: 1px solid var(--border);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-name {
  color: var(--text-light);
  font-size: 0.875rem;
}

.main {
  padding-top: 2rem;
}

.input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.input-group .input {
  flex: 1;
}

.loading,
.empty {
  text-align: center;
  padding: 2rem;
  color: var(--text-light);
}

.error {
  background: #fef2f2;
  color: var(--danger);
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.todo-list {
  overflow: hidden;
}

.stats {
  margin-top: 1rem;
  text-align: center;
  color: var(--text-light);
  font-size: 0.875rem;
}
</style>
