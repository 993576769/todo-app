// Auto-generated types from PocketBase schema

export type Priority = 'low' | 'medium' | 'high'
export type Theme = 'light' | 'dark' | 'system'

export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  theme?: Theme
  created: string
  updated: string
}

export interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  priority?: Priority
  due_date?: string
  tags?: string[]
  sort_order: number
  user: string
  created: string
  updated: string
  
  // 扩展字段（使用 expand 时）
  expand?: {
    user?: User
  }
}

// 前端使用的筛选状态
export type FilterStatus = 'all' | 'active' | 'completed'
export type FilterPriority = 'all' | Priority
