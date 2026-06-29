<script setup>
import { useRoute } from 'vue-router'
import { ref, computed, watch, onMounted } from 'vue'
import { useDataStore } from './stores/data'

const route = useRoute()
const store = useDataStore()
const mobileMenuOpen = ref(false)
const userMenuOpen = ref(false)
const darkMode = ref(false)
const currentUser = store.getEmployee('EMP-1001')

const navGroups = [
  {
    label: 'Operations',
    items: [
      { label: 'Dashboard',    icon: 'pi pi-chart-bar',  to: '/dashboard' },
      { label: 'Work Orders',  icon: 'pi pi-file-edit',  to: '/work-orders', badge: '6' },
      { label: 'Inventory',    icon: 'pi pi-box',        to: '/inventory' },
      { label: 'Traceability', icon: 'pi pi-sitemap',    to: '/traceability' },
    ]
  },
  {
    label: 'Quality & Assets',
    items: [
      { label: 'Quality (SPC)', icon: 'pi pi-shield', to: '/quality' },
      { label: 'Equipment',     icon: 'pi pi-cog',    to: '/equipment' },
      { label: 'Workforce',     icon: 'pi pi-users',  to: '/workforce' },
    ]
  }
]

const currentPageTitle = computed(() => {
  for (const g of navGroups) {
    const found = g.items.find(i => route.path.includes(i.to))
    if (found) return found.label
  }
  return 'Dashboard'
})

function toggleDarkMode() {
  darkMode.value = !darkMode.value
  document.documentElement.classList.toggle('dark', darkMode.value)
  localStorage.setItem('mesDarkMode', darkMode.value)
}

function logout() {
  window.location.href = '/login'
}

onMounted(() => {
  const saved = localStorage.getItem('mesDarkMode')
  if (saved === 'true') {
    darkMode.value = true
    document.documentElement.classList.add('dark')
  }
})

watch(() => route.path, () => {
  mobileMenuOpen.value = false
  userMenuOpen.value = false
})
</script>

<template>
  <div class="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
    <!-- ===== Sidebar (Desktop) ===== -->
    <aside class="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 z-40 border-r border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
      <!-- Logo -->
      <div class="h-16 flex items-center gap-3 px-5 border-b border-slate-200/60 dark:border-slate-800/60">
        <div class="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <i class="pi pi-bolt text-white text-sm"></i>
          <span class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
        </div>
        <div>
          <p class="font-bold text-base gradient-text leading-tight">MES Pro</p>
          <p class="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wider uppercase">v2.0 · Plant Edition</p>
        </div>
      </div>

      <!-- Nav groups -->
      <nav class="flex-1 overflow-y-auto py-5 px-3 custom-scrollbar">
        <div v-for="group in navGroups" :key="group.label" class="mb-6">
          <p class="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">{{ group.label }}</p>
          <div class="flex flex-col gap-0.5">
            <router-link v-for="item in group.items" :key="item.to" :to="item.to"
              class="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              :class="route.path.includes(item.to)
                ? 'bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-500/15 dark:to-violet-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'">
              <i :class="item.icon" class="text-base transition-transform group-hover:scale-110"></i>
              <span class="flex-1">{{ item.label }}</span>
              <span v-if="item.badge" class="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">{{ item.badge }}</span>
              <span v-if="route.path.includes(item.to)" class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-gradient-to-b from-indigo-500 to-violet-500"></span>
            </router-link>
          </div>
        </div>

        <!-- System status card -->
        <div class="mt-4 mx-2 p-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-500/10 dark:to-violet-500/5 border border-indigo-100/50 dark:border-indigo-500/20">
          <div class="flex items-center gap-2 mb-2">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <p class="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">System Online</p>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">All 4 production lines operational. Backup completed 2h ago.</p>
        </div>
      </nav>

      <!-- User card at bottom -->
      <div class="p-3 border-t border-slate-200/60 dark:border-slate-800/60">
        <div class="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group">
          <div class="relative">
            <img :src="currentUser.avatar" :alt="currentUser.name"
              class="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-100 dark:ring-indigo-500/30" />
            <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{{ currentUser.name }}</p>
            <p class="text-[11px] text-slate-400 dark:text-slate-500 truncate">{{ currentUser.role }}</p>
          </div>
          <button @click="logout" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/15 transition-colors" title="Sign out">
            <i class="pi pi-sign-out text-sm"></i>
          </button>
        </div>
      </div>
    </aside>

    <!-- ===== Mobile sidebar overlay ===== -->
    <Transition name="slide">
      <div v-if="mobileMenuOpen" class="lg:hidden fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="mobileMenuOpen = false"></div>
        <aside class="absolute left-0 inset-y-0 w-72 bg-white dark:bg-slate-900 shadow-2xl flex flex-col">
          <div class="h-16 flex items-center gap-2.5 px-5 border-b border-slate-200 dark:border-slate-800">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <i class="pi pi-bolt text-white"></i>
            </div>
            <span class="font-bold text-lg gradient-text">MES Pro</span>
          </div>
          <nav class="flex-1 overflow-y-auto py-4 px-3">
            <div v-for="group in navGroups" :key="group.label" class="mb-6">
              <p class="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{{ group.label }}</p>
              <div class="flex flex-col gap-1">
                <router-link v-for="item in group.items" :key="item.to" :to="item.to"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  :class="route.path.includes(item.to)
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'">
                  <i :class="item.icon" class="text-base"></i>
                  {{ item.label }}
                </router-link>
              </div>
            </div>
          </nav>
        </aside>
      </div>
    </Transition>

    <!-- ===== Main column ===== -->
    <div class="flex-1 lg:ml-64 flex flex-col min-h-screen">
      <!-- Desktop top bar -->
      <header class="hidden lg:flex sticky top-0 z-30 glass-nav h-16 items-center justify-between px-8">
        <div class="flex items-center gap-2.5">
          <span class="text-xs text-slate-400 dark:text-slate-500 font-medium">MES Pro</span>
          <i class="pi pi-angle-right text-[10px] text-slate-300 dark:text-slate-600"></i>
          <span class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ currentPageTitle }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <button class="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-ring" title="Search">
            <i class="pi pi-search text-sm"></i>
          </button>
          <button class="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-ring relative" title="Notifications">
            <i class="pi pi-bell text-sm"></i>
            <span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
          </button>
          <button @click="toggleDarkMode" class="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-ring" :title="darkMode ? 'Light mode' : 'Dark mode'">
            <i :class="darkMode ? 'pi pi-sun text-amber-400' : 'pi pi-moon'" class="text-sm"></i>
          </button>
          <div class="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>
          <img :src="currentUser.avatar" :alt="currentUser.name"
            class="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-100 dark:ring-indigo-500/30 hover:ring-indigo-300 dark:hover:ring-indigo-500/50 transition-all cursor-pointer" />
        </div>
      </header>

      <!-- Mobile top bar -->
      <header class="lg:hidden sticky top-0 z-30 glass-nav h-16 border-b border-slate-200/60 dark:border-slate-800/60">
        <div class="flex items-center justify-between px-4 h-full">
          <button @click="mobileMenuOpen = true" class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-ring">
            <i class="pi pi-bars text-lg text-slate-600 dark:text-slate-300"></i>
          </button>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <i class="pi pi-bolt text-white text-sm"></i>
            </div>
            <span class="font-bold text-sm gradient-text">MES Pro</span>
          </div>
          <button @click="toggleDarkMode" class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-ring">
            <i :class="darkMode ? 'pi pi-sun text-amber-400' : 'pi pi-moon text-slate-500'"></i>
          </button>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8 fade-in">
        <div class="max-w-[1400px] mx-auto">
          <router-view v-slot="{ Component, route: r }">
            <Transition name="fade" mode="out-in">
              <component :is="Component" :key="r.fullPath" />
            </Transition>
          </router-view>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateX(-100%); }
</style>
