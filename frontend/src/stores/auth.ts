import { defineStore } from 'pinia'
import { computed } from 'vue'
import { pb } from '@/lib/pocketbase'
import { useLocalStorage } from '@vueuse/core'
import type { User } from '@/types/pocketbase'

export const useAuthStore = defineStore('auth', () => {
  // 使用 VueUse 持久化用户信息
  const user = useLocalStorage<User | null>('todo-user', pb.authStore.model as unknown as User | null)
  
  // 登录状态
  const isLoggedIn = computed(() => pb.authStore.isValid)
  
  // 监听 authStore 变化
  pb.authStore.onChange((_token, model) => {
    user.value = model as unknown as User | null
  })
  
  // 登录
  const login = async (email: string, password: string) => {
    const auth = await pb.collection('users').authWithPassword(email, password)
    user.value = auth.record as unknown as User
    return auth
  }
  
  // 注册
  const register = async (email: string, password: string, name?: string) => {
    const newUser = await pb.collection('users').create({
      email,
      password,
      passwordConfirm: password,
      name
    })
    // 注册后自动登录
    await login(email, password)
    return newUser
  }
  
  // 登出
  const logout = () => {
    pb.authStore.clear()
    user.value = null
  }
  
  // 刷新用户信息
  const refresh = async () => {
    if (!pb.authStore.isValid) return
    const fresh = await pb.collection('users').authRefresh()
    user.value = fresh.record as unknown as User
  }
  
  // 获取用户头像 URL
  const getAvatarUrl = () => {
    if (!user.value?.avatar) return null
    return pb.getFileUrl(user.value, user.value.avatar)
  }
  
  return {
    user,
    isLoggedIn,
    login,
    register,
    logout,
    refresh,
    getAvatarUrl
  }
})
