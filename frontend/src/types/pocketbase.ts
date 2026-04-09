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
export type TodoCreateInput = Omit<TodoCreate, 'priority'> & {
  priority?: Priority
}
export type TodoUpdateInput = Omit<TodoUpdate, 'priority'> & {
  priority?: Priority
}
export type UserUpdateInput = Omit<UserUpdate, 'theme'> & {
  theme?: Theme
}

export type User = UsersResponse
export type Todo = TodosResponse<string[], { user?: UsersResponse }>

export type { TypedPocketBase }
export type { TodoCreate, TodoUpdate, UserCreate, UserUpdate }

// 前端使用的筛选状态
export type FilterStatus = 'all' | 'active' | 'completed'
export type FilterPriority = 'all' | Priority

export const toTodoPriorityOption = (priority?: Priority): TodosPriorityOptions | undefined => {
  switch (priority) {
    case 'low':
      return TodosPriorityOptions.Low
    case 'medium':
      return TodosPriorityOptions.Medium
    case 'high':
      return TodosPriorityOptions.High
    default:
      return undefined
  }
}

export const toUserThemeOption = (theme?: Theme): UsersThemeOptions | undefined => {
  switch (theme) {
    case 'light':
      return UsersThemeOptions.Light
    case 'dark':
      return UsersThemeOptions.Dark
    case 'system':
      return UsersThemeOptions.System
    default:
      return undefined
  }
}
