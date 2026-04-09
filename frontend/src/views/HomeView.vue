<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useTodosStore } from '@/stores/todos'
import TodoItem from '@/components/TodoItem.vue'
import { useOffline } from '@/composables/useOffline'
import { filterStatusValues, type FilterStatus, type Priority, type Theme } from '@/types/pocketbase'

const { isOffline } = useOffline()

const router = useRouter()
const auth = useAuthStore()
const themeStore = useThemeStore()
const todosStore = useTodosStore()

const newTitle = ref('')
const newDescription = ref('')
const newPriority = ref<Priority>('medium')
const newDueDate = ref('')
const showAddForm = ref(false)
const filterStatuses = filterStatusValues satisfies readonly FilterStatus[]

// 切换主题
const toggleTheme = async () => {
  const currentTheme = themeStore.theme
  const next: Theme = currentTheme === 'system' ? 'light' : currentTheme === 'light' ? 'dark' : 'system'
  themeStore.setTheme(next)

  if (auth.isLoggedIn) {
    await auth.updateTheme(next)
  }
}

const theme = computed(() => themeStore.theme)

const themeIcon = computed(() => {
  if (theme.value === 'dark') return '🌙'
  if (theme.value === 'light') return '☀️'
  return '💻'
})

// 版本标识
const BUILD_VERSION = '2026.03.27-v2'

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
    await todosStore.addTodo(
      newTitle.value.trim(),
      newPriority.value,
      newDueDate.value || undefined,
      newDescription.value.trim() || undefined
    )
    newTitle.value = ''
    newDescription.value = ''
    newPriority.value = 'medium'
    newDueDate.value = ''
    showAddForm.value = false
  } catch (e) {
    console.error(e)
  }
}

// 登出
const handleLogout = () => {
  auth.logout()
  router.push({ name: 'login' })
}

// 拖拽排序
const draggedIndex = ref<number | null>(null)

const handleDragStart = (index: number) => {
  draggedIndex.value = index
}

const handleDragOver = (e: DragEvent, index: number) => {
  e.preventDefault()
  if (draggedIndex.value === null || draggedIndex.value === index) return
}

const handleDrop = async (e: DragEvent, index: number) => {
  e.preventDefault()
  if (draggedIndex.value === null || draggedIndex.value === index) return
  
  await todosStore.reorderTodos(draggedIndex.value, index)
  draggedIndex.value = null
}

const handleDragEnd = () => {
  draggedIndex.value = null
}
</script>

<template>
  <div class="home">
    <!-- Header -->
    <header class="header">
      <div class="container header-content">
        <h1 class="logo">📝 Todo</h1>
        <div class="header-actions">
          <button class="btn btn-ghost theme-toggle" @click="toggleTheme" :title="`主题: ${theme}`">
            {{ themeIcon }}
          </button>
          <div class="user-info">
            <span class="user-name">{{ auth.user?.name || auth.user?.email }}</span>
            <button class="btn btn-ghost btn-logout" @click="handleLogout" title="登出">
              🚪
            </button>
          </div>
        </div>
      </div>
      <span class="version-badge">v{{ BUILD_VERSION }}</span>
    </header>

    <!-- Main -->
    <main class="main container">
      <!-- 离线提示 -->
      <div v-if="isOffline" class="offline-banner">
        ⚠️ 你当前处于离线状态，部分功能可能不可用
      </div>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <input
          v-model="todosStore.searchQuery"
          placeholder="🔍 搜索任务..."
          class="input search-input"
        />
      </div>

      <!-- 筛选和操作栏 -->
      <div class="toolbar">
        <!-- 状态筛选 -->
        <div class="filter-group">
          <button 
            v-for="status in filterStatuses" 
            :key="status"
            class="btn btn-sm"
            :class="todosStore.filterStatus === status ? 'btn-primary' : 'btn-ghost'"
            @click="todosStore.filterStatus = status"
          >
            {{ status === 'all' ? '全部' : status === 'active' ? '进行中' : '已完成' }}
          </button>
        </div>

        <!-- 优先级筛选 -->
        <select 
          v-model="todosStore.filterPriority" 
          class="filter-select"
        >
          <option value="all">全部优先级</option>
          <option value="high">高优先级</option>
          <option value="medium">中优先级</option>
          <option value="low">低优先级</option>
        </select>
      </div>

      <!-- 添加任务 -->
      <div class="add-section">
        <button 
          v-if="!showAddForm" 
          class="btn btn-primary add-btn"
          @click="showAddForm = true"
        >
          ➕ 添加任务
        </button>
        
        <div v-else class="add-form card">
          <input
            v-model="newTitle"
            @keyup.enter="handleAdd"
            placeholder="任务标题..."
            class="input"
            autofocus
          />
          <textarea
            v-model="newDescription"
            placeholder="描述（可选）..."
            class="input textarea"
            rows="2"
          />
          <div class="add-options">
            <select v-model="newPriority" class="input select">
              <option value="low">低优先级</option>
              <option value="medium">中优先级</option>
              <option value="high">高优先级</option>
            </select>
            <input
              type="date"
              v-model="newDueDate"
              class="input date-input"
            />
          </div>
          <div class="add-actions">
            <button class="btn btn-primary" @click="handleAdd" :disabled="!newTitle.trim()">
              添加
            </button>
            <button class="btn btn-ghost" @click="showAddForm = false">取消</button>
          </div>
        </div>
      </div>

      <!-- 批量操作 -->
      <div v-if="todosStore.todos.length > 0" class="batch-actions">
        <button 
          class="btn btn-sm btn-ghost"
          @click="todosStore.markAllCompleted"
          :disabled="todosStore.stats.active === 0"
        >
          ✅ 全部完成
        </button>
        <button 
          class="btn btn-sm btn-danger"
          @click="todosStore.clearCompleted"
          :disabled="todosStore.stats.completed === 0"
        >
          🗑️ 清除已完成
        </button>
      </div>

      <!-- Loading -->
      <div v-if="todosStore.loading" class="loading">加载中...</div>

      <!-- Error -->
      <div v-if="todosStore.error" class="error">{{ todosStore.error }}</div>

      <!-- Todo List -->
      <div class="todo-list card">
        <TodoItem
          v-for="(todo, index) in todosStore.filteredTodos"
          :key="todo.id"
          :todo="todo"
          draggable="true"
          @dragstart="handleDragStart(index)"
          @dragover="handleDragOver($event, index)"
          @drop="handleDrop($event, index)"
          @dragend="handleDragEnd"
          @toggle="todosStore.toggleTodo"
          @update="(id, data) => todosStore.updateTodo(id, data)"
          @delete="todosStore.deleteTodo"
        />
        
        <div v-if="todosStore.filteredTodos.length === 0 && !todosStore.loading" class="empty">
          <p v-if="todosStore.searchQuery">没有找到匹配的任务</p>
          <p v-else-if="todosStore.filterStatus === 'completed'">还没有已完成的任务</p>
          <p v-else-if="todosStore.filterStatus === 'active'">没有进行中的任务</p>
          <p v-else>暂无任务，添加一个吧！</p>
        </div>
      </div>

      <!-- Stats -->
      <div v-if="todosStore.todos.length > 0" class="stats">
        <span class="stat-item">
          总计: <strong>{{ todosStore.stats.total }}</strong>
        </span>
        <span class="stat-item">
          进行中: <strong>{{ todosStore.stats.active }}</strong>
        </span>
        <span class="stat-item">
          已完成: <strong>{{ todosStore.stats.completed }}</strong>
        </span>
        <span v-if="todosStore.stats.overdue > 0" class="stat-item overdue">
          过期: <strong>{{ todosStore.stats.overdue }}</strong>
        </span>
        <span class="stat-item version">
          v{{ BUILD_VERSION }}
        </span>
      </div>
    </main>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
}

.header {
  background: var(--card-bg);
  border-bottom: 1px solid var(--border);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 10;
  position: relative;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.version-badge {
  position: absolute;
  bottom: 0.25rem;
  right: 1rem;
  font-size: 0.625rem;
  color: var(--text-light);
  opacity: 0.5;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.theme-toggle {
  font-size: 1.25rem;
  padding: 0.375rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-name {
  color: var(--text-light);
  font-size: 0.875rem;
}

@media (max-width: 400px) {
  .user-name {
    display: none;
  }
}

.btn-logout {
  padding: 0.375rem;
}

.main {
  padding-top: 2rem;
}

/* 离线提示 */
.offline-banner {
  background: var(--warning);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 0.875rem;
}

/* 搜索栏 */
.search-bar {
  margin-bottom: 1rem;
}

.search-input {
  padding-left: 1rem;
}

/* 工具栏 */
.toolbar {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.filter-group {
  display: flex;
  gap: 0.25rem;
}

.filter-select {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--card-bg);
  color: var(--text);
}

/* 添加任务 */
.add-section {
  margin-bottom: 1.5rem;
}

.add-btn {
  width: 100%;
}

.add-form {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.textarea {
  resize: vertical;
  min-height: 60px;
}

.add-options {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.select {
  flex: 1;
  min-width: 120px;
}

.date-input {
  flex: 1;
  min-width: 140px;
}

.add-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* 批量操作 */
.batch-actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

/* 列表 */
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

[data-theme="dark"] .error {
  background: rgba(239, 68, 68, 0.1);
}

.todo-list {
  overflow: hidden;
}

/* 拖拽样式 */
.todo-list .todo-item[draggable="true"] {
  cursor: grab;
}

.todo-list .todo-item[draggable="true"]:active {
  cursor: grabbing;
}

/* 统计 */
.stats {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.875rem;
  color: var(--text-light);
}

.stat-item {
  white-space: nowrap;
}

.stat-item.overdue {
  color: var(--danger);
}

.stat-item.version {
  font-size: 0.75rem;
  opacity: 0.5;
}

.stat-item strong {
  color: var(--text);
}
</style>
