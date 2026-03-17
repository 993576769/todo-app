import { defineStore } from 'pinia'
import { ref } from 'vue'
import { pb } from '@/lib/pocketbase'
import { useAuthStore } from './auth'
import type { Todo } from '@/types/pocketbase'

export const useTodosStore = defineStore('todos', () => {
  const todos = ref<Todo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const auth = useAuthStore()
  
  // 获取当前用户的 todos
  const fetchTodos = async () => {
    if (!auth.user) return
    
    loading.value = true
    error.value = null
    
    try {
      const result = await pb.collection('todos').getList<Todo>(1, 100, {
        sort: '-created'
      })
      todos.value = result.items
    } catch (e) {
      error.value = '获取任务列表失败'
      console.error(e)
    } finally {
      loading.value = false
    }
  }
  
  // 添加 todo
  const addTodo = async (title: string) => {
    if (!auth.user) return
    
    try {
      const todo = await pb.collection('todos').create<Todo>({
        title,
        completed: false,
        user: auth.user.id
      })
      todos.value.unshift(todo)
      return todo
    } catch (e) {
      error.value = '添加任务失败'
      throw e
    }
  }
  
  // 切换完成状态
  const toggleTodo = async (id: string) => {
    const todo = todos.value.find(t => t.id === id)
    if (!todo) return
    
    try {
      const updated = await pb.collection('todos').update<Todo>(id, {
        completed: !todo.completed
      })
      const idx = todos.value.findIndex(t => t.id === id)
      if (idx !== -1) {
        todos.value[idx] = updated
      }
    } catch (e) {
      error.value = '更新状态失败'
      throw e
    }
  }
  
  // 更新标题
  const updateTodo = async (id: string, title: string) => {
    try {
      const updated = await pb.collection('todos').update<Todo>(id, { title })
      const idx = todos.value.findIndex(t => t.id === id)
      if (idx !== -1) {
        todos.value[idx] = updated
      }
    } catch (e) {
      error.value = '更新任务失败'
      throw e
    }
  }
  
  // 删除 todo
  const deleteTodo = async (id: string) => {
    try {
      await pb.collection('todos').delete(id)
      todos.value = todos.value.filter(t => t.id !== id)
    } catch (e) {
      error.value = '删除任务失败'
      throw e
    }
  }
  
  // 实时订阅
  const subscribe = () => {
    pb.collection('todos').subscribe('*', (e) => {
      // 确保是当前用户的 todo
      const record = e.record as unknown as Todo
      if (record.user !== auth.user?.id) return
      
      if (e.action === 'create') {
        if (!todos.value.find(t => t.id === record.id)) {
          todos.value.unshift(record)
        }
      }
      if (e.action === 'update') {
        const idx = todos.value.findIndex(t => t.id === record.id)
        if (idx !== -1) {
          todos.value[idx] = record
        }
      }
      if (e.action === 'delete') {
        todos.value = todos.value.filter(t => t.id !== record.id)
      }
    })
  }
  
  // 取消订阅
  const unsubscribe = () => {
    pb.collection('todos').unsubscribe()
  }
  
  return {
    todos,
    loading,
    error,
    fetchTodos,
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    subscribe,
    unsubscribe
  }
})
