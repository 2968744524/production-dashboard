<template>
  <div class="layout-container">
    <aside class="sidebar">
      <div class="logo-area">
        <el-icon :size="24" color="#409eff"><Monitor /></el-icon>
        <span class="logo-text">MES System</span>
      </div>
      <el-menu
        :default-active="currentRoute"
        router
        class="side-menu"
        background-color="transparent"
        text-color="#8a9bb0"
        active-text-color="#409eff"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>Dashboard</span>
        </el-menu-item>
        <el-menu-item index="/tasks">
          <el-icon><List /></el-icon>
          <span>Task Management</span>
        </el-menu-item>
        <el-menu-item index="/equipment">
          <el-icon><Cpu /></el-icon>
          <span>Equipment Monitor</span>
        </el-menu-item>
        <el-menu-item index="/analytics">
          <el-icon><TrendCharts /></el-icon>
          <span>Data Analytics</span>
        </el-menu-item>
      </el-menu>
    </aside>

    <div class="main-area">
      <header class="top-header">
        <div class="breadcrumb">
          <h2>{{ route.meta?.title || 'Dashboard' }}</h2>
        </div>
        <div class="header-right">
          <el-badge :value="4" :max="99">
            <el-button circle :icon="Bell" />
          </el-badge>
          <el-dropdown trigger="click">
            <div class="user-info">
              <el-avatar :size="32" icon="UserFilled" />
              <span class="user-name">{{ userInfo?.role || 'Admin' }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">Sign Out</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>
      <main class="content-area">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Bell, UserFilled } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const currentRoute = computed(() => route.path)
const userInfo = computed(() => {
  const u = localStorage.getItem('user')
  return u ? JSON.parse(u) : null
})

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  background: var(--bg-primary);
}
.sidebar {
  width: var(--sidebar-width);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.logo-area {
  height: var(--header-height);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px;
  border-bottom: 1px solid var(--border-color);
}
.logo-text {
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
}
.side-menu {
  border: none !important;
  padding: 12px 0;
}
.side-menu .el-menu-item {
  margin: 2px 8px;
  border-radius: 8px;
  height: 44px;
  line-height: 44px;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.top-header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}
.breadcrumb h2 {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 500;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.user-name {
  color: var(--text-primary);
  font-size: 14px;
}
.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}
</style>
