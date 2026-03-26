// Auto-generated types from PocketBase schema

export type Theme = 'system' | 'light' | 'dark'

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
  completed: boolean
  priority: number
  dueDate: string | null
  user: string
  created: string
  updated: string

  // 扩展字段（使用 expand 时）
  expand?: {
    user?: User
  }
}
