<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '../stores/data'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

const store = useDataStore()
const toast = useToast()

const view = ref('gantt')
const search = ref('')
const filterStatus = ref('')
const filterPriority = ref('')

const statuses = ['Created', 'Released', 'In Progress', 'Completed', 'Closed']
const priorities = ['High', 'Medium', 'Low']

const statusConfig = {
  'Created':     { label: 'Created',     color: 'slate',   dot: 'bg-slate-400',   hex: '#94a3b8', badge: 'badge-todo' },
  'Released':    { label: 'Released',    color: 'blue',    dot: 'bg-blue-500',    hex: '#3b82f6', badge: 'badge-low' },
  'In Progress': { label: 'In Progress', color: 'indigo',  dot: 'bg-indigo-500',  hex: '#6366f1', badge: 'badge-progress' },
  'Completed':   { label: 'Completed',   color: 'emerald', dot: 'bg-emerald-500', hex: '#10b981', badge: 'badge-done' },
  'Closed':      { label: 'Closed',      color: 'gray',    dot: 'bg-gray-500',    hex: '#6b7280', badge: 'badge-todo' },
}

const priorityConfig = {
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
        <button class="btn-primary flex items-center gap-2" @click="toast.add({ severity: 'info', summary: 'Create', detail: 'Work order creation form would open here', life: 2500 })">
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
          <div v-for="wo in filteredWorkOrders" :key="wo.id" class="flex items-center py-2.5 border-b border-slate-100 dark:border-slate-800/50 table-row-hover group">
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
              class="border-b border-slate-100 dark:border-slate-800/50 table-row-hover cursor-pointer">
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

    <Toast />
  </div>
</template>
