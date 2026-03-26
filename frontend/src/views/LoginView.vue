<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { CheckSquare, Mail, Lock, User, Loader2 } from 'lucide-vue-next'
import ThemeToggle from '@/components/ThemeToggle.vue'

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
    <!-- Theme toggle in corner -->
    <div class="absolute top-4 right-4">
      <ThemeToggle />
    </div>

    <div class="w-full max-w-[420px] bg-[var(--color-surface-card)]/80 backdrop-blur-xl rounded-2xl card-shadow-lg p-8 transition-all duration-300 hover:shadow-xl border border-[var(--color-border)]/30">
      <!-- Logo & Title -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4 shadow-lg shadow-primary/25">
          <CheckSquare class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Todo
        </h1>
        <p class="text-[var(--color-text-muted)] mt-2">{{ isLogin ? '登录你的账户' : '创建新账户' }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-5">
        <div v-if="!isLogin" class="flex flex-col gap-2">
          <label class="text-sm font-medium text-[var(--color-text)]">姓名（可选）</label>
          <div class="relative group">
            <User class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)] group-focus-within:text-primary transition-colors" />
            <input
              v-model="name"
              type="text"
              class="w-full pl-12 pr-4 py-3.5 text-base bg-[var(--color-surface-elevated)]/50 border-2 border-[var(--color-border)] rounded-xl focus:outline-none focus:border-primary focus:bg-[var(--color-surface-elevated)] focus:ring-4 focus:ring-primary/20 text-[var(--color-text)] placeholder-[var(--color-text-placeholder)] transition-all duration-200"
              placeholder="你的名字"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-[var(--color-text)]">邮箱</label>
          <div class="relative group">
            <Mail class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)] group-focus-within:text-primary transition-colors" />
            <input
              v-model="email"
              type="email"
              class="w-full pl-12 pr-4 py-3.5 text-base bg-[var(--color-surface-elevated)]/50 border-2 border-[var(--color-border)] rounded-xl focus:outline-none focus:border-primary focus:bg-[var(--color-surface-elevated)] focus:ring-4 focus:ring-primary/20 text-[var(--color-text)] placeholder-[var(--color-text-placeholder)] transition-all duration-200"
              placeholder="your@email.com"
              required
            />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-[var(--color-text)]">密码</label>
          <div class="relative group">
            <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)] group-focus-within:text-primary transition-colors" />
            <input
              v-model="password"
              type="password"
              class="w-full pl-12 pr-4 py-3.5 text-base bg-[var(--color-surface-elevated)]/50 border-2 border-[var(--color-border)] rounded-xl focus:outline-none focus:border-primary focus:bg-[var(--color-surface-elevated)] focus:ring-4 focus:ring-primary/20 text-[var(--color-text)] placeholder-[var(--color-text-placeholder)] transition-all duration-200"
              placeholder="至少8位"
              required
              minlength="8"
            />
          </div>
        </div>

        <div v-if="error" class="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-sm text-center flex items-center justify-center gap-2">
          <span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          {{ error }}
        </div>

        <button
          type="submit"
          class="w-full py-4 text-base font-semibold text-white btn-gradient rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          :disabled="loading"
        >
          <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
          {{ loading ? '处理中...' : (isLogin ? '登录' : '注册') }}
        </button>
      </form>

      <div class="mt-8 text-center text-sm text-[var(--color-text-muted)]">
        <span>{{ isLogin ? '没有账户？' : '已有账户？' }}</span>
        <button
          class="text-primary font-semibold hover:text-primary-hover ml-1 cursor-pointer transition-colors hover:underline underline-offset-2"
          @click="toggleMode"
        >
          {{ isLogin ? '立即注册' : '立即登录' }}
        </button>
      </div>
    </div>
  </div>
</template>
