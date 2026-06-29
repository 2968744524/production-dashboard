import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', name: 'Login', component: () => import('../views/LoginView.vue') },
  { path: '/dashboard', name: 'Dashboard', component: () => import('../views/DashboardView.vue') },
  { path: '/work-orders', name: 'WorkOrders', component: () => import('../views/WorkOrdersView.vue') },
  { path: '/quality', name: 'Quality', component: () => import('../views/QualityView.vue') },
  { path: '/equipment', name: 'Equipment', component: () => import('../views/EquipmentView.vue') },
  { path: '/inventory', name: 'Inventory', component: () => import('../views/InventoryView.vue') },
  { path: '/traceability', name: 'Traceability', component: () => import('../views/TraceabilityView.vue') },
  { path: '/workforce', name: 'Workforce', component: () => import('../views/WorkforceView.vue') },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
