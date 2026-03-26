<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { CheckSquare, Mail, Lock, User, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const name = ref('')
const error = ref('')
const loading = ref(false)

// 切换登录/注册
const toggleMode = () => {
  isLogin.value = !isLogin.value
  error.value = ''
}

// 提交
const handleSubmit = async () => {
  error.value = ''

  if (!email.value || !password.value) {
    error.value = '请填写邮箱和密码'
    return
  }

  loading.value = true

  try {
    if (isLogin.value) {
      await auth.login(email.value, password.value)
    } else {
      await auth.register(email.value, password.value, name.value || undefined)
    }

    // 跳转到原页面或首页
    const redirect = route.query.redirect as string
    router.push(redirect || { name: 'home' })
  } catch (e: any) {
    error.value = e?.message || (isLogin.value ? '登录失败' : '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-[400px] bg-white rounded-xl shadow-sm p-8">
      <h1 class="text-2xl font-bold text-center text-primary flex items-center justify-center gap-2 mb-2">
        <CheckSquare class="w-7 h-7" />
        Todo
      </h1>
      <p class="text-center text-gray-500 mb-6">{{ isLogin ? '登录你的账户' : '创建新账户' }}</p>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
        <div v-if="!isLogin" class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-900">姓名（可选）</label>
          <div class="relative">
            <User class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              v-model="name"
              type="text"
              class="w-full pl-10 pr-4 py-3 text-base bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
              placeholder="你的名字"
            />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-900">邮箱</label>
          <div class="relative">
            <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              v-model="email"
              type="email"
              class="w-full pl-10 pr-4 py-3 text-base bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
              placeholder="your@email.com"
              required
            />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-900">密码</label>
          <div class="relative">
            <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              v-model="password"
              type="password"
              class="w-full pl-10 pr-4 py-3 text-base bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
              placeholder="至少8位"
              required
              minlength="8"
            />
          </div>
        </div>

        <div v-if="error" class="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
          {{ error }}
        </div>

        <button
          type="submit"
          class="w-full py-3.5 text-base font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          :disabled="loading"
        >
          <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
          {{ loading ? '处理中...' : (isLogin ? '登录' : '注册') }}
        </button>
      </form>

      <div class="mt-6 text-center text-sm text-gray-500">
        <span>{{ isLogin ? '没有账户？' : '已有账户？' }}</span>
        <button
          class="text-primary font-medium hover:underline ml-1"
          @click="toggleMode"
        >
          {{ isLogin ? '立即注册' : '立即登录' }}
        </button>
      </div>
    </div>
  </div>
</template>
