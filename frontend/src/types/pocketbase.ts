import type {
  TodoCreate,
  TodoUpdate,
  TodosResponse,
  TypedPocketBase,
  UserCreate,
  UserUpdate,
  UsersResponse,
} from './pocketbase.generated'
import {
  TodosPriorityOptions,
  UsersThemeOptions,
} from './pocketbase.generated'

export type Priority = `${TodosPriorityOptions}`
export type Theme = `${UsersThemeOptions}`

export type User = UsersResponse
export type Todo = TodosResponse<string[], { user?: UsersResponse }>

export type { TypedPocketBase }
export type { TodoCreate, TodoUpdate, UserCreate, UserUpdate }

// 前端使用的筛选状态
export type FilterStatus = 'all' | 'active' | 'completed'
export type FilterPriority = 'all' | Priority
