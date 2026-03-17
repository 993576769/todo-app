// Auto-generated types from PocketBase schema

export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  created: string
  updated: string
}

export interface Todo {
  id: string
  title: string
  completed: boolean
  user: string
  created: string
  updated: string
  
  // 扩展字段（使用 expand 时）
  expand?: {
    user?: User
  }
}
