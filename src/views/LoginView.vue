<template>
  <div class="login-container">
    <div class="login-bg">
      <div class="grid-overlay"></div>
    </div>
    <div class="login-card">
      <div class="login-header">
        <div class="logo-icon">
          <el-icon :size="36"><Monitor /></el-icon>
        </div>
        <h1>Production Dashboard</h1>
        <p>Manufacturing Execution & Monitoring System</p>
      </div>
      <el-form :model="form" :rules="rules" ref="formRef" @keyup.enter="handleLogin">
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            prefix-icon="User"
            placeholder="Username"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            prefix-icon="Lock"
            type="password"
            placeholder="Password"
            size="large"
            show-password
          />
        </el-form-item>
        <el-button
          type="primary"
          size="large"
          :loading="loading"
          class="login-btn"
          @click="handleLogin"
        >
          Sign In
        </el-button>
      </el-form>
      <div class="login-hint">
        Demo: admin / admin123
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { users } from '../stores/data'

const router = useRouter()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: 'Please enter username', trigger: 'blur' }],
  password: [{ required: true, message: 'Please enter password', trigger: 'blur' }]
}

const handleLogin = () => {
  formRef.value.validate((valid) => {
    if (!valid) return
    loading.value = true
    setTimeout(() => {
      const user = users.find(u => u.username === form.username && u.password === form.password)
      if (user) {
        localStorage.setItem('token', 'jwt-simulated-token-' + Date.now())
        localStorage.setItem('user', JSON.stringify(user))
        ElMessage.success('Welcome back, ' + user.role)
        router.push('/')
      } else {
        ElMessage.error('Invalid credentials')
      }
      loading.value = false
    }, 800)
  })
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: var(--bg-primary);
}
.login-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(64, 158, 255, 0.08) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 30%, rgba(103, 194, 58, 0.05) 0%, transparent 50%);
}
.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(64, 158, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(64, 158, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}
.login-card {
  width: 400px;
  padding: 48px 40px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  position: relative;
  z-index: 1;
  box-shadow: 0 25px 50px rgba(0,0,0,0.3);
}
.login-header {
  text-align: center;
  margin-bottom: 32px;
}
.logo-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 16px;
  border-radius: 16px;
  background: linear-gradient(135deg, #409eff, #337ecc);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
.login-header h1 {
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}
.login-header p {
  color: var(--text-secondary);
  font-size: 14px;
}
.login-btn {
  width: 100%;
  font-size: 16px;
  letter-spacing: 2px;
  margin-top: 8px;
}
.login-hint {
  text-align: center;
  color: var(--text-secondary);
  font-size: 12px;
  margin-top: 16px;
  opacity: 0.6;
}
</style>
