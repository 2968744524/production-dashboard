<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '../stores/data'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import Drawer from 'primevue/drawer'
import Dialog from 'primevue/dialog'

const store = useDataStore()
const toast = useToast()

const view = ref('gantt')
const search = ref('')
const filterStatus = ref('')
const filterPriority = ref('')

const statuses = ['Created', 'Released', 'In Progress', 'Completed', 'Closed']
const priorities = ['Low', 'Medium', 'High', 'Urgent']
const lines = ['Line A', 'Line B', 'Line C', 'Line D']

const statusConfig = {
  'Created':     { label: 'Created',     color: 'slate',   dot: 'bg-slate-400',   hex: '#94a3b8', badge: 'badge-todo' },
  'Released':    { label: 'Released',    color: 'blue',    dot: 'bg-blue-500',    hex: '#3b82f6', badge: 'badge-low' },
  'In Progress': { label: 'In Progress', color: 'indigo',  dot: 'bg-indigo-500',  hex: '#6366f1', badge: 'badge-progress' },
  'Completed':   { label: 'Completed',   color: 'emerald', dot: 'bg-emerald-500', hex: '#10b981', badge: 'badge-done' },
  'Closed':      { label: 'Closed',      color: 'gray',    dot: 'bg-gray-500',    hex: '#6b7280', badge: 'badge-todo' },
}

const priorityConfig = {
  'Urgent': { badge: 'badge-high' },
  'High':   { badge: 'badge-high' },
  'Medium': { badge: 'badge-medium' },
  'Low':    { badge: 'badge-low' },
}

const today = new Date('2026-06-29')
const ganttDays = computed(() => {
  const days = []
  for (let i = -10; i <= 14; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    days.push({
      date: d.toISOString().split('T')[0],
      day: d.getDate(),
      weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
      isToday: i === 0,
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
      offset: i + 10,
    })
  }
  return days
})

const filteredWorkOrders = computed(() => {
  return store.workOrders.filter(wo => {
    const m = search.value.toLowerCase()
    const matchSearch = !m || wo.id.toLowerCase().includes(m) || wo.product.toLowerCase().includes(m)
    const matchS = !filterStatus.value || wo.status === filterStatus.value
    const matchP = !filterPriority.value || wo.priority === filterPriority.value
    return matchSearch && matchS && matchP
  })
})

const woStats = computed(() => ({
  total: store.workOrders.length,
  inProgress: store.workOrders.filter(w => w.status === 'In Progress').length,
  completed: store.workOrders.filter(w => w.status === 'Completed' || w.status === 'Closed').length,
  onTime: 96.2,
}))

function getGanttBar(wo) {
  const startOffset = wo.ganttStart + 10
  return {
    left: `${(startOffset / 25) * 100}%`,
    width: `${(wo.ganttDuration / 25) * 100}%`,
  }
}

function getGanttGradient(wo) {
  const c = statusConfig[wo.status]
  return `linear-gradient(90deg, ${c.hex}, ${c.hex}dd)`
}

function clearFilters() {
  search.value = ''; filterStatus.value = ''; filterPriority.value = ''
}

/* ---------- 抽屉：工单详情 ---------- */
const drawerVisible = ref(false)
const selectedWo = ref(null)

function openDetail(wo) {
  selectedWo.value = wo
  drawerVisible.value = true
}

function closeDetail() {
  drawerVisible.value = false
  selectedWo.value = null
}

const nextAction = computed(() => {
  if (!selectedWo.value) return null
  return store.statusFlow[selectedWo.value.status] || null
})

function advanceStatus() {
  if (!selectedWo.value) return
  const updated = store.advanceWorkOrderStatus(selectedWo.value.id)
  if (updated) {
    // selectedWo 是 store 中的响应式对象引用，状态已变化
    toast.add({
      severity: 'success',
      summary: 'Status Updated',
      detail: `${selectedWo.value.id} → ${updated.status}`,
      life: 2500,
    })
    // 如果已是终态，延迟关闭抽屉让用户看到结果
    if (updated.status === 'Closed') {
      setTimeout(() => { drawerVisible.value = false }, 1200)
    }
  }
}

/* ---------- Dialog：新增工单 ---------- */
const dialogVisible = ref(false)
const submitting = ref(false)
const form = ref({
  product: '',
  qty: '',
  line: 'Line A',
  priority: 'Medium',
  startDate: '',
  dueDate: '',
  lead: '',
})
const formErrors = ref({})

function openCreate() {
  // 重置表单
  form.value = {
    product: '',
    qty: '',
    line: 'Line A',
    priority: 'Medium',
    startDate: '',
    dueDate: '',
    lead: '',
  }
  formErrors.value = {}
  dialogVisible.value = true
}

function validateForm() {
  const e = {}
  if (!form.value.product) e.product = 'Product is required'
  if (!form.value.qty || Number(form.value.qty) <= 0) e.qty = 'Quantity must be greater than 0'
  if (!form.value.startDate) e.startDate = 'Start date is required'
  if (!form.value.dueDate) e.dueDate = 'Due date is required'
  if (form.value.startDate && form.value.dueDate && form.value.startDate >= form.value.dueDate) {
    e.dueDate = 'Due date must be after start date'
  }
  if (!form.value.lead) e.lead = 'Lead operator is required'
  formErrors.value = e
  return Object.keys(e).length === 0
}

function submitCreate() {
  if (!validateForm()) return
  submitting.value = true
  // 模拟一点延迟让交互更真实
  setTimeout(() => {
    const newWo = store.createWorkOrder({
      product: form.value.product,
      qty: Number(form.value.qty),
      line: form.value.line,
      priority: form.value.priority,
      startDate: form.value.startDate,
      dueDate: form.value.dueDate,
      lead: form.value.lead,
    })
    submitting.value = false
    dialogVisible.value = false
    toast.add({
      severity: 'success',
      summary: 'Work Order Created',
      detail: `${newWo.id} · ${newWo.product} · ${newWo.qty} pcs`,
      life: 3000,
    })
    // 切到列表视图让用户看到新增的工单
    if (view.value === 'gantt') view.value = 'list'
  }, 400)
}
</script>

<template>
  <div class="fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
      <div>
        <div class="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium mb-1.5">
          <span>Operations</span>
          <i class="pi pi-angle-right text-[10px]"></i>
          <span class="text-slate-600 dark:text-slate-400">Work Orders</span>
        </div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Work Orders</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Production order lifecycle · Real-time scheduling</p>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl p-1 border border-slate-200/60 dark:border-slate-700/60">
          <button @click="view = 'gantt'" class="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
            :class="view === 'gantt' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'">
            <i class="pi pi-calendar mr-1.5 text-xs"></i>Gantt
          </button>
          <button @click="view = 'list'" class="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
            :class="view === 'list' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'">
            <i class="pi pi-list mr-1.5 text-xs"></i>List
          </button>
        </div>
        <button class="btn-primary flex items-center gap-2" @click="openCreate">
          <i class="pi pi-plus text-sm"></i> New Order
        </button>
      </div>
    </div>

    <!-- KPI row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="stat-card">
        <p class="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1.5">Total Orders</p>
        <p class="text-[28px] font-bold text-slate-900 dark:text-white tracking-tight tabular-nums leading-tight">{{ woStats.total }}</p>
        <p class="text-[11px] text-slate-400 mt-1">+2 this week</p>
      </div>
      <div class="stat-card">
        <p class="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1.5">In Progress</p>
        <p class="text-[28px] font-bold text-indigo-600 dark:text-indigo-400 tracking-tight tabular-nums leading-tight">{{ woStats.inProgress }}</p>
        <p class="text-[11px] text-slate-400 mt-1">On 4 production lines</p>
      </div>
      <div class="stat-card">
        <p class="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1.5">Completed</p>
        <p class="text-[28px] font-bold text-emerald-600 dark:text-emerald-400 tracking-tight tabular-nums leading-tight">{{ woStats.completed }}</p>
        <p class="text-[11px] text-slate-400 mt-1">All closed on time</p>
      </div>
      <div class="stat-card">
        <p class="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1.5">On-time Rate</p>
        <p class="text-[28px] font-bold text-slate-900 dark:text-white tracking-tight tabular-nums leading-tight">{{ woStats.onTime }}%</p>
        <div class="mt-1.5 h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div class="h-full rounded-full bg-emerald-500" style="width: 96.2%"></div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-6 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60">
      <div class="flex-1 min-w-[200px] relative">
        <i class="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
        <input v-model="search" type="text" placeholder="Search by WO# or SKU..." class="field-input pl-11" />
      </div>
      <select v-model="filterStatus" class="field-input !w-auto min-w-[140px] cursor-pointer">
        <option value="">All Status</option>
        <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
      </select>
      <select v-model="filterPriority" class="field-input !w-auto min-w-[130px] cursor-pointer">
        <option value="">All Priority</option>
        <option v-for="p in priorities" :key="p" :value="p">{{ p }}</option>
      </select>
      <button v-if="search || filterStatus || filterPriority" @click="clearFilters" class="btn-ghost flex items-center gap-1.5">
        <i class="pi pi-times text-xs"></i> Clear
      </button>
    </div>

    <!-- Gantt View -->
    <div v-if="view === 'gantt'" class="chart-card">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-3">
        <div>
          <h3 class="font-semibold text-base text-slate-900 dark:text-white">Production Schedule</h3>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">25-day rolling window · {{ new Date('2026-06-29').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }} – {{ new Date('2026-07-13').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}, 2026</p>
        </div>
        <div class="flex flex-wrap gap-3 text-xs">
          <div v-for="(conf, key) in statusConfig" :key="key" class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded" :class="conf.dot"></span>
            <span class="text-slate-500 dark:text-slate-400 font-medium">{{ conf.label }}</span>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto -mx-6 px-6 custom-scrollbar">
        <div class="min-w-[900px]">
          <!-- Date header -->
          <div class="flex border-b border-slate-200 dark:border-slate-800 pb-2 mb-3 sticky top-0 bg-white dark:bg-slate-900 z-10">
            <div class="w-44 flex-shrink-0 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 self-end pb-1">Work Order</div>
            <div class="flex-1 grid" :style="{ gridTemplateColumns: `repeat(25, 1fr)` }">
              <div v-for="d in ganttDays" :key="d.date"
                class="text-center py-1 relative"
                :class="d.isToday ? 'bg-indigo-50 dark:bg-indigo-500/15 rounded-md mx-0.5' : ''">
                <div class="text-[10px] font-semibold" :class="d.isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'">{{ d.weekday }}</div>
                <div class="text-xs font-bold" :class="d.isToday ? 'text-indigo-600 dark:text-indigo-400' : d.isWeekend ? 'text-slate-300 dark:text-slate-600' : 'text-slate-600 dark:text-slate-300'">{{ d.day }}</div>
              </div>
            </div>
          </div>

          <!-- Gantt rows -->
          <div v-for="wo in filteredWorkOrders" :key="wo.id" class="flex items-center py-2.5 border-b border-slate-100 dark:border-slate-800/50 table-row-hover group cursor-pointer" @click="openDetail(wo)">
            <div class="w-44 flex-shrink-0 px-2">
              <p class="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">{{ wo.id }}</p>
              <p class="text-[11px] text-slate-400 dark:text-slate-500 truncate">{{ wo.product }}</p>
            </div>
            <div class="flex-1 relative h-9" :style="{ gridTemplateColumns: `repeat(25, 1fr)` }">
              <!-- Weekend background -->
              <div class="absolute inset-0 grid pointer-events-none" :style="{ gridTemplateColumns: `repeat(25, 1fr)` }">
                <div v-for="d in ganttDays" :key="d.date" :class="d.isWeekend ? 'bg-slate-50 dark:bg-slate-800/30' : ''"></div>
              </div>
              <!-- Today line -->
              <div class="absolute top-0 bottom-0 w-px bg-indigo-500/60 z-10" :style="{ left: `calc(${(10/25)*100}% + (100%/25/2))` }">
                <div class="absolute -top-1 -left-1.5 w-3 h-3 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-slate-900"></div>
              </div>
              <!-- Bar -->
              <div class="absolute top-1.5 bottom-1.5 rounded-lg flex items-center px-2.5 cursor-pointer transition-all hover:opacity-90 hover:shadow-lg hover:scale-y-110 z-[5]"
                :style="{ ...getGanttBar(wo), background: getGanttGradient(wo) }"
                :title="`${wo.id} · ${wo.status} · ${wo.progress}%`">
                <span class="text-[10px] font-bold text-white truncate drop-shadow-sm">{{ wo.progress }}%</span>
                <div v-if="wo.progress > 0 && wo.progress < 100" class="absolute right-0 top-0 bottom-0 w-1 bg-white/40 rounded-r-lg"></div>
              </div>
            </div>
          </div>

          <div v-if="filteredWorkOrders.length === 0" class="py-12 text-center">
            <i class="pi pi-inbox text-3xl text-slate-300 dark:text-slate-700"></i>
            <p class="text-sm text-slate-400 mt-2">No work orders match your filters</p>
          </div>
        </div>
      </div>
    </div>

    <!-- List View -->
    <div v-else class="chart-card">
      <div class="flex items-center justify-between mb-5">
        <h3 class="font-semibold text-base text-slate-900 dark:text-white">All Work Orders</h3>
        <span class="text-xs text-slate-400 dark:text-slate-500 font-medium">{{ filteredWorkOrders.length }} orders</span>
      </div>
      <div class="overflow-x-auto -mx-6 px-6 custom-scrollbar">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <th class="text-left py-3 px-2 font-bold">Work Order</th>
              <th class="text-left py-3 px-2 font-bold">Product</th>
              <th class="text-left py-3 px-2 font-bold">Status</th>
              <th class="text-left py-3 px-2 font-bold">Priority</th>
              <th class="text-left py-3 px-2 font-bold">Line</th>
              <th class="text-left py-3 px-2 font-bold">Lead</th>
              <th class="text-right py-3 px-2 font-bold">Progress</th>
              <th class="text-left py-3 px-2 font-bold">Due Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="wo in filteredWorkOrders" :key="wo.id"
              class="border-b border-slate-100 dark:border-slate-800/50 table-row-hover cursor-pointer"
              @click="openDetail(wo)">
              <td class="py-3 px-2 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">{{ wo.id }}</td>
              <td class="py-3 px-2 text-slate-700 dark:text-slate-300 font-medium">{{ wo.product }}</td>
              <td class="py-3 px-2">
                <span class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full" :class="statusConfig[wo.status].dot"></span>
                  <span class="text-xs text-slate-600 dark:text-slate-400 font-medium">{{ wo.status }}</span>
                </span>
              </td>
              <td class="py-3 px-2"><span class="badge" :class="priorityConfig[wo.priority].badge">{{ wo.priority }}</span></td>
              <td class="py-3 px-2"><span class="badge badge-todo">{{ wo.line }}</span></td>
              <td class="py-3 px-2">
                <div class="flex items-center gap-2">
                  <img v-if="store.getEmployee(wo.lead)" :src="store.getEmployee(wo.lead).avatar" :alt="store.getEmployee(wo.lead).name"
                    class="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700" />
                  <span class="text-xs text-slate-600 dark:text-slate-400 font-medium">{{ store.getEmployee(wo.lead)?.name?.split(' ')[0] || '—' }}</span>
                </div>
              </td>
              <td class="py-3 px-2 text-right">
                <div class="flex items-center gap-2 justify-end">
                  <div class="w-24 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div class="h-full rounded-full" :class="statusConfig[wo.status].dot" :style="{ width: wo.progress + '%' }"></div>
                  </div>
                  <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 w-10 text-right tabular-nums">{{ wo.progress }}%</span>
                </div>
              </td>
              <td class="py-3 px-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">{{ wo.dueDate }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="filteredWorkOrders.length === 0" class="py-12 text-center">
        <i class="pi pi-inbox text-3xl text-slate-300 dark:text-slate-700"></i>
        <p class="text-sm text-slate-400 mt-2">No work orders match your filters</p>
      </div>
    </div>

    <!-- Drawer: 工单详情 -->
    <Drawer v-model:visible="drawerVisible" :header="null" position="right" :modal="true" :style="{ width: '480px', maxWidth: '100vw' }" class="wo-detail-drawer">
      <template #container="{ closeCallback }">
        <div v-if="selectedWo" class="flex flex-col h-full">
          <!-- Header -->
          <div class="p-6 border-b border-slate-200 dark:border-slate-800">
            <div class="flex items-start justify-between mb-3">
              <div>
                <p class="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider mb-1">Work Order</p>
                <h2 class="font-mono text-xl font-bold text-slate-900 dark:text-white">{{ selectedWo.id }}</h2>
              </div>
              <button @click="closeCallback" class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <i class="pi pi-times"></i>
              </button>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold" :class="statusConfig[selectedWo.status].badge">
                <span class="w-1.5 h-1.5 rounded-full" :class="statusConfig[selectedWo.status].dot"></span>
                {{ selectedWo.status }}
              </span>
              <span class="badge" :class="priorityConfig[selectedWo.priority].badge">{{ selectedWo.priority }}</span>
              <span class="badge badge-todo">{{ selectedWo.line }}</span>
            </div>
          </div>

          <!-- Content (scroll) -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            <!-- Product & quantities -->
            <div>
              <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Product</h3>
              <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <div class="flex items-center gap-3">
                  <div class="p-2.5 rounded-lg bg-indigo-500 text-white">
                    <i class="pi pi-box"></i>
                  </div>
                  <div>
                    <p class="font-mono text-sm font-bold text-slate-900 dark:text-white">{{ selectedWo.product }}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">{{ store.getProduct(selectedWo.product)?.name }} · {{ store.getProduct(selectedWo.product)?.spec }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div class="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <p class="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Planned</p>
                <p class="text-lg font-bold text-slate-900 dark:text-white tabular-nums">{{ selectedWo.qty }}</p>
              </div>
              <div class="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <p class="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Completed</p>
                <p class="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{{ selectedWo.completed }}</p>
              </div>
              <div class="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <p class="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Scrapped</p>
                <p class="text-lg font-bold text-rose-500 tabular-nums">{{ selectedWo.scrapped }}</p>
              </div>
            </div>

            <!-- Schedule -->
            <div>
              <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Schedule</h3>
              <div class="space-y-2.5">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-slate-500 dark:text-slate-400 flex items-center gap-2"><i class="pi pi-calendar text-xs"></i>Start Date</span>
                  <span class="font-semibold text-slate-900 dark:text-white tabular-nums">{{ selectedWo.startDate }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-slate-500 dark:text-slate-400 flex items-center gap-2"><i class="pi pi-calendar-minus text-xs"></i>Due Date</span>
                  <span class="font-semibold text-slate-900 dark:text-white tabular-nums">{{ selectedWo.dueDate }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-slate-500 dark:text-slate-400 flex items-center gap-2"><i class="pi pi-chart-line text-xs"></i>Progress</span>
                  <span class="font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">{{ selectedWo.progress }}%</span>
                </div>
              </div>
            </div>

            <!-- Lead -->
            <div>
              <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Lead Operator</h3>
              <div class="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <img v-if="store.getEmployee(selectedWo.lead)" :src="store.getEmployee(selectedWo.lead).avatar" :alt="store.getEmployee(selectedWo.lead).name" class="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700" />
                <div>
                  <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ store.getEmployee(selectedWo.lead)?.name }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400">{{ store.getEmployee(selectedWo.lead)?.role }} · {{ store.getEmployee(selectedWo.lead)?.shift }} Shift</p>
                </div>
              </div>
            </div>

            <!-- Timeline -->
            <div>
              <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Activity Timeline</h3>
              <div class="space-y-0">
                <div v-for="(t, idx) in selectedWo.timeline" :key="idx" class="relative pl-6 pb-4 last:pb-0">
                  <div v-if="idx < selectedWo.timeline.length - 1" class="absolute left-1.5 top-5 bottom-0 w-px bg-slate-200 dark:bg-slate-700"></div>
                  <div class="absolute left-0 top-1 w-3 h-3 rounded-full bg-indigo-500 ring-2 ring-indigo-50 dark:ring-indigo-500/20"></div>
                  <div>
                    <p class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ t.action }}</p>
                    <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{{ t.at }} · {{ store.getEmployee(t.by)?.name || t.by }}</p>
                    <p v-if="t.note" class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ t.note }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer: status action -->
          <div class="p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <button v-if="nextAction" @click="advanceStatus"
              class="btn-primary w-full flex items-center justify-center gap-2 !py-3">
              <i :class="nextAction.icon" class="text-sm"></i>
              {{ nextAction.action }}
            </button>
            <div v-else class="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm font-medium">
              <i class="pi pi-lock text-xs"></i>
              This work order is closed
            </div>
          </div>
        </div>
      </template>
    </Drawer>

    <!-- Dialog: New Work Order -->
    <Dialog v-model:visible="dialogVisible" modal header="Create Work Order" :style="{ width: '480px', maxWidth: '95vw' }">
      <div class="space-y-4 pt-2">
        <!-- Product -->
        <div>
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Product <span class="text-rose-500">*</span></label>
          <select v-model="form.product" class="field-input cursor-pointer" :class="formErrors.product ? '!border-rose-400' : ''">
            <option value="" disabled>Select a product SKU</option>
            <option v-for="p in store.products" :key="p.sku" :value="p.sku">{{ p.sku }} · {{ p.name }}</option>
          </select>
          <p v-if="formErrors.product" class="text-xs text-rose-500 mt-1">{{ formErrors.product }}</p>
        </div>

        <!-- Qty -->
        <div>
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Quantity (pcs) <span class="text-rose-500">*</span></label>
          <input v-model="form.qty" type="number" min="1" placeholder="e.g. 500" class="field-input" :class="formErrors.qty ? '!border-rose-400' : ''" />
          <p v-if="formErrors.qty" class="text-xs text-rose-500 mt-1">{{ formErrors.qty }}</p>
        </div>

        <!-- Line + Priority -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Production Line</label>
            <select v-model="form.line" class="field-input cursor-pointer">
              <option v-for="l in lines" :key="l" :value="l">{{ l }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Priority</label>
            <select v-model="form.priority" class="field-input cursor-pointer">
              <option v-for="p in priorities" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
        </div>

        <!-- Dates -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Start Date <span class="text-rose-500">*</span></label>
            <input v-model="form.startDate" type="date" class="field-input" :class="formErrors.startDate ? '!border-rose-400' : ''" />
            <p v-if="formErrors.startDate" class="text-xs text-rose-500 mt-1">{{ formErrors.startDate }}</p>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Due Date <span class="text-rose-500">*</span></label>
            <input v-model="form.dueDate" type="date" class="field-input" :class="formErrors.dueDate ? '!border-rose-400' : ''" />
            <p v-if="formErrors.dueDate" class="text-xs text-rose-500 mt-1">{{ formErrors.dueDate }}</p>
          </div>
        </div>

        <!-- Lead -->
        <div>
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Lead Operator <span class="text-rose-500">*</span></label>
          <select v-model="form.lead" class="field-input cursor-pointer" :class="formErrors.lead ? '!border-rose-400' : ''">
            <option value="" disabled>Select an operator</option>
            <option v-for="e in store.employees" :key="e.id" :value="e.id">{{ e.name }} · {{ e.role }}</option>
          </select>
          <p v-if="formErrors.lead" class="text-xs text-rose-500 mt-1">{{ formErrors.lead }}</p>
        </div>
      </div>

      <template #footer>
        <button @click="dialogVisible = false" class="btn-ghost">Cancel</button>
        <button @click="submitCreate" :disabled="submitting" class="btn-primary flex items-center gap-2">
          <i v-if="submitting" class="pi pi-spin pi-spinner text-sm"></i>
          <i v-else class="pi pi-check text-sm"></i>
          {{ submitting ? 'Creating...' : 'Create Work Order' }}
        </button>
      </template>
    </Dialog>

    <Toast />
  </div>
</template>
