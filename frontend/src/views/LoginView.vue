<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

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
  <div class="login-page">
    <div class="login-card card">
      <h1 class="title">📝 Todo</h1>
      <p class="subtitle">{{ isLogin ? '登录你的账户' : '创建新账户' }}</p>

      <form @submit.prevent="handleSubmit" class="form">
        <div v-if="!isLogin" class="form-group">
          <label class="label">姓名（可选）</label>
          <input
            v-model="name"
            type="text"
            class="input"
            placeholder="你的名字"
          />
        </div>

        <div class="form-group">
          <label class="label">邮箱</label>
          <input
            v-model="email"
            type="email"
            class="input"
            placeholder="your@email.com"
            required
          />
        </div>

        <div class="form-group">
          <label class="label">密码</label>
          <input
            v-model="password"
            type="password"
            class="input"
            placeholder="至少8位"
            required
            minlength="8"
          />
        </div>

        <div v-if="error" class="error">{{ error }}</div>

        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? '处理中...' : (isLogin ? '登录' : '注册') }}
        </button>
      </form>

      <div class="footer">
        <span>{{ isLogin ? '没有账户？' : '已有账户？' }}</span>
        <button class="btn-link" @click="toggleMode">
          {{ isLogin ? '立即注册' : '立即登录' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  color: var(--primary);
  margin-bottom: 0.5rem;
}

.subtitle {
  text-align: center;
  color: var(--text-light);
  margin-bottom: 1.5rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text);
}

.error {
  background: #fef2f2;
  color: var(--danger);
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  text-align: center;
}

.btn-block {
  width: 100%;
  padding: 0.875rem;
  font-size: 1rem;
  margin-top: 0.5rem;
}

.btn-link {
  background: none;
  border: none;
  color: var(--primary);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
}

.btn-link:hover {
  text-decoration: underline;
}

.footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-light);
}
</style>
