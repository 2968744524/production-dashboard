<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const toast = useToast()
const username = ref('')
const password = ref('')
const loading = ref(false)
const showPassword = ref(false)

function handleLogin() {
  if (!username.value || !password.value) {
    toast.add({ severity: 'warn', summary: 'Missing info', detail: 'Please enter username and password', life: 3000 })
    return
  }
  loading.value = true
  setTimeout(() => {
    loading.value = false
    if ((username.value === 'admin' && password.value === 'admin123') ||
        (username.value === 'operator' && password.value === 'operator123')) {
      toast.add({ severity: 'success', summary: 'Welcome back', detail: `Signed in as ${username.value}`, life: 2000 })
      router.push('/dashboard')
    } else {
      toast.add({ severity: 'error', summary: 'Login failed', detail: 'Invalid credentials. Try admin / admin123', life: 4000 })
    }
  }, 600)
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
    style="background: linear-gradient(135deg, #4338ca 0%, #6d28d9 50%, #7c3aed 100%);">

    <!-- Animated background -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl float"></div>
      <div class="absolute -bottom-32 -left-20 w-[500px] h-[500px] rounded-full bg-violet-300/15 blur-3xl float" style="animation-delay: -1.5s"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-indigo-300/10 blur-3xl"></div>
      <!-- Grid pattern -->
      <svg class="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)"/>
      </svg>
    </div>

    <div class="relative w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="relative w-20 h-20 mx-auto rounded-3xl bg-white/15 backdrop-blur-md flex items-center justify-center mb-5 ring-1 ring-white/20 shadow-2xl">
          <i class="pi pi-bolt text-white text-3xl"></i>
          <span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full ring-2 ring-violet-700 animate-pulse"></span>
        </div>
        <h1 class="text-3xl font-bold text-white tracking-tight">MES Pro</h1>
        <p class="text-white/60 text-sm mt-1.5 font-medium">Manufacturing Execution System · v2.0</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-slate-800">
        <div class="mb-7">
          <h2 class="text-xl font-bold text-slate-800 dark:text-white">Sign in</h2>
          <p class="text-slate-400 dark:text-slate-500 text-sm mt-1">Enter your credentials to access the system</p>
        </div>

        <form @submit.prevent="handleLogin" class="flex flex-col gap-5">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Username</label>
            <div class="relative">
              <i class="pi pi-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
              <input v-model="username" type="text" placeholder="admin"
                class="field-input pl-11" />
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
              <button type="button" class="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors">Forgot?</button>
            </div>
            <div class="relative">
              <i class="pi pi-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
              <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="admin123"
                class="field-input pl-11 pr-11" />
              <button type="button" @click="showPassword = !showPassword"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-sm"></i>
              </button>
            </div>
          </div>

          <button type="submit" :disabled="loading" class="btn-primary w-full flex items-center justify-center gap-2 py-3.5 mt-1">
            <i v-if="loading" class="pi pi-spinner pi-spin"></i>
            <span>{{ loading ? 'Signing in...' : 'Sign in' }}</span>
            <i v-if="!loading" class="pi pi-arrow-right text-sm"></i>
          </button>
        </form>

        <!-- SSO options -->
        <div class="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <p class="text-[10px] text-slate-400 text-center uppercase tracking-wider font-semibold mb-3">Quick sign in</p>
          <div class="grid grid-cols-2 gap-2">
            <button type="button" @click="username = 'admin'; password = 'admin123'"
              class="px-3 py-2.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 transition-all text-slate-600 dark:text-slate-300">
              <i class="pi pi-user mr-1.5 text-indigo-500"></i>Admin
            </button>
            <button type="button" @click="username = 'operator'; password = 'operator123'"
              class="px-3 py-2.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-500/50 hover:bg-violet-50/50 dark:hover:bg-violet-500/10 transition-all text-slate-600 dark:text-slate-300">
              <i class="pi pi-cog mr-1.5 text-violet-500"></i>Operator
            </button>
          </div>
        </div>

        <div class="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-center justify-center gap-2 text-xs text-slate-400">
            <i class="pi pi-info-circle text-[11px]"></i>
            <span>Click <span class="font-semibold text-slate-500">Admin</span> above to auto-fill demo credentials</span>
          </div>
        </div>
      </div>

      <p class="text-center text-white/40 text-xs mt-6 font-medium">© 2026 MES Pro · Built with Vue 3 + PrimeVue + Tailwind v4</p>
    </div>

    <Toast position="top-center" />
  </div>
</template>
