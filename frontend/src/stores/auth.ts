import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { pb } from '@/lib/pocketbase'
import type { User } from '@/types/pocketbase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  
  // 初始化时从 PocketBase 恢复登录状态
  if (pb.authStore.isValid && pb.authStore.record) {
    user.value = pb.authStore.record as unknown as User
  }
  
  // 登录状态
  const isLoggedIn = computed(() => !!user.value && pb.authStore.isValid)
  
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
    return pb.files.getURL(user.value, user.value.avatar)
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
