<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useDataStore } from '../stores/data'
import Chart from 'primevue/chart'

const store = useDataStore()
const isDark = ref(false)
const selectedTab = ref('overview') // overview | maintenance

const downtimeChart = ref({})
const chartOptions = ref({})
const downtimeOptions = ref({})
const polarOptions = ref({})

function buildCharts() {
  downtimeChart.value = {
    labels: store.downtimeReasons.map(r => r.reason),
    datasets: [{
      data: store.downtimeReasons.map(r => r.minutes),
      backgroundColor: ['#6366f1', '#8b5cf6', '#a855f7', '#f59e0b', '#10b981', '#94a3b8'],
      borderWidth: 0,
      hoverOffset: 10,
    }]
  }
}

function buildOptions() {
  const dark = isDark.value
  chartOptions.value = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'right',
        labels: { color: dark ? '#cbd5e1' : '#475569', font: { size: 11, family: 'Inter' }, usePointStyle: true, pointStyle: 'circle', padding: 12, boxWidth: 8 } },
      tooltip: { backgroundColor: dark ? '#1e293b' : '#fff', titleColor: dark ? '#f1f5f9' : '#0f172a', bodyColor: dark ? '#94a3b8' : '#475569', borderColor: dark ? '#334155' : '#e2e8f0', borderWidth: 1, cornerRadius: 12, padding: 12 }
    }
  }

  downtimeOptions.value = {
    ...chartOptions.value,
    cutout: '65%',
    plugins: { ...chartOptions.value.plugins, legend: { display: false } },
    scales: undefined,
  }
}

const statusConfig = {
  running: { label: 'Running', icon: 'pi pi-play-circle',  dot: 'bg-emerald-500', badge: 'badge-done',     bg: 'bg-emerald-50 dark:bg-emerald-500/15', text: 'text-emerald-500' },
  idle:    { label: 'Idle',    icon: 'pi pi-pause-circle', dot: 'bg-amber-500',   badge: 'badge-medium',   bg: 'bg-amber-50 dark:bg-amber-500/15',   text: 'text-amber-500' },
  error:   { label: 'Error',   icon: 'pi pi-times-circle', dot: 'bg-rose-500',    badge: 'badge-high',     bg: 'bg-rose-50 dark:bg-rose-500/15',     text: 'text-rose-500' },
  offline: { label: 'Offline', icon: 'pi pi-stop-circle',  dot: 'bg-slate-400',   badge: 'badge-todo',     bg: 'bg-slate-100 dark:bg-slate-700/50',  text: 'text-slate-400' },
}

const maintStatusConfig = {
  'Scheduled':   { badge: 'badge-low',       icon: 'pi pi-calendar', text: 'text-blue-500' },
  'In Progress': { badge: 'badge-progress',  icon: 'pi pi-spin pi-spinner', text: 'text-indigo-500' },
  'Completed':   { badge: 'badge-done',      icon: 'pi pi-check',     text: 'text-emerald-500' },
}

const healthColor = (h) => h >= 85 ? 'text-emerald-500' : h >= 70 ? 'text-amber-500' : 'text-rose-500'
const loadColor = (l) => l > 80 ? 'bg-rose-500' : l > 50 ? 'bg-amber-500' : 'bg-emerald-500'
const tempColor = (t) => t > 60 ? 'text-rose-500' : t > 45 ? 'text-amber-500' : 'text-emerald-500'

// OEE 三维度拆解 —— 用于横向进度条
const oeeBreakdown = (eq) => [
  { key: 'A', label: 'Avail',  value: eq.availability, color: 'bg-indigo-500',   text: 'text-indigo-500' },
  { key: 'P', label: 'Perf',   value: eq.performance,  color: 'bg-violet-500',   text: 'text-violet-500' },
  { key: 'Q', label: 'Quality',value: eq.quality,      color: 'bg-emerald-500',  text: 'text-emerald-500' },
]

// OEE 主色 —— 根据数值分档
const oeeColor = (v) => v >= 80 ? '#10b981' : v >= 60 ? '#f59e0b' : '#ef4444'
const oeeColorLight = (v) => v >= 80 ? '#34d399' : v >= 60 ? '#fbbf24' : '#f87171'
const oeeTextColor = (v) => v >= 80 ? 'text-emerald-600 dark:text-emerald-400' : v >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'

const eqStats = computed(() => ({
  total: store.equipment.length,
  running: store.equipment.filter(e => e.status === 'running').length,
  avgOee: (store.equipment.reduce((s, e) => s + e.oee, 0) / store.equipment.length).toFixed(1),
  needMaintenance: store.equipment.filter(e => e.health < 70).length,
}))

const observer = new MutationObserver(() => {
  isDark.value = document.documentElement.classList.contains('dark')
  buildCharts(); buildOptions()
})

onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark')
  buildCharts(); buildOptions()
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})
onUnmounted(() => observer.disconnect())
</script>

<template>
  <div class="fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
      <div>
        <div class="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium mb-1.5">
          <span>Quality & Assets</span>
          <i class="pi pi-angle-right text-[10px]"></i>
          <span class="text-slate-600 dark:text-slate-400">Equipment</span>
        </div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Equipment</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">OEE monitoring · Predictive maintenance · Health tracking</p>
      </div>
      <div class="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl p-1 border border-slate-200/60 dark:border-slate-700/60">
        <button @click="selectedTab = 'overview'" class="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
          :class="selectedTab === 'overview' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'">
          Overview
        </button>
        <button @click="selectedTab = 'maintenance'" class="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
          :class="selectedTab === 'maintenance' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'">
          Maintenance
        </button>
      </div>
    </div>

    <!-- KPI -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="stat-card">
        <p class="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1">Total Equipment</p>
        <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ eqStats.total }}</p>
      </div>
      <div class="stat-card">
        <p class="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1">Running</p>
        <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ eqStats.running }}</p>
      </div>
      <div class="stat-card">
        <p class="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1">Average OEE</p>
        <p class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{{ eqStats.avgOee }}%</p>
      </div>
      <div class="stat-card">
        <p class="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1">Need Attention</p>
        <p class="text-2xl font-bold" :class="eqStats.needMaintenance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'">{{ eqStats.needMaintenance }}</p>
      </div>
    </div>

    <!-- Overview Tab -->
    <div v-if="selectedTab === 'overview'">
      <!-- Equipment cards —— compact, data-dense, no gimmicks -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div v-for="eq in store.equipment" :key="eq.id" class="stat-card group cursor-pointer">
          <!-- Header: name + status badge -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="w-2 h-2 rounded-full flex-shrink-0" :class="statusConfig[eq.status].dot"></span>
              <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">{{ eq.name }}</p>
            </div>
            <span class="badge flex-shrink-0" :class="statusConfig[eq.status].badge">{{ statusConfig[eq.status].label }}</span>
          </div>

          <!-- Subtitle -->
          <p class="text-xs text-slate-400 dark:text-slate-500 font-mono mb-3 truncate">{{ eq.id }} · {{ eq.type }}</p>

          <!-- Metrics row: OEE + A + P + Q -->
          <div class="flex items-center gap-4 mb-3 pb-3 border-b border-slate-100 dark:border-slate-800/60">
            <div class="text-center px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 min-w-[64px]">
              <p class="text-lg font-bold tabular-nums leading-tight" :class="oeeTextColor(eq.oee)">{{ eq.oee }}<span class="text-xs">%</span></p>
              <p class="text-[10px] text-slate-400 dark:text-slate-500 font-medium">OEE</p>
            </div>
            <div class="flex-1 grid grid-cols-3 gap-2 text-center">
              <div>
                <p class="text-sm font-semibold tabular-nums text-indigo-500 dark:text-indigo-400">{{ eq.availability }}<span class="text-[10px]">%</span></p>
                <p class="text-[10px] text-slate-400 font-medium">Avail</p>
              </div>
              <div>
                <p class="text-sm font-semibold tabular-nums text-violet-500 dark:text-violet-400">{{ eq.performance }}<span class="text-[10px]">%</span></p>
                <p class="text-[10px] text-slate-400 font-medium">Perf</p>
              </div>
              <div>
                <p class="text-sm font-semibold tabular-nums text-emerald-500 dark:text-emerald-400">{{ eq.quality }}<span class="text-[10px]">%</span></p>
                <p class="text-[10px] text-slate-400 font-medium">Quality</p>
              </div>
            </div>
          </div>

          <!-- Bottom row: Health · Load · Temp · Hours -->
          <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Health <strong :class="healthColor(eq.health)">{{ eq.health }}</strong></span>
            <span>Load <strong :class="eq.load > 80 ? 'text-rose-500' : eq.load > 50 ? 'text-amber-500' : 'text-emerald-500'">{{ eq.load }}%</strong></span>
            <span :class="tempColor(eq.temp)"><strong>{{ eq.temp }}°C</strong></span>
            <span class="font-mono tabular-ns ml-auto text-slate-400">{{ eq.runHours.toLocaleString() }}h</span>
          </div>
        </div>
      </div>

      <!-- Downtime reasons -->
      <div class="chart-card mt-4">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h3 class="font-semibold text-sm text-slate-900 dark:text-white">Downtime Analysis</h3>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Top reasons for equipment downtime this week</p>
          </div>
        </div>
        <div class="flex items-center gap-6">
          <!-- 饼图：紧凑 -->
          <div class="w-[160px] flex-shrink-0">
            <div class="h-[140px]"><Chart type="doughnut" :data="downtimeChart" :options="downtimeOptions" /></div>
          </div>
          <!-- 排名列表 -->
          <div class="flex-1 min-w-0 space-y-2">
            <div v-for="r in [...store.downtimeReasons].sort((a,b) => b.percent - a.percent)" :key="r.reason"
              class="flex items-center gap-3 group">
              <span class="text-xs text-slate-600 dark:text-slate-400 w-24 flex-shrink-0 truncate group-hover:text-slate-900 dark:group-hover:white transition-colors">{{ r.reason }}</span>
              <div class="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div class="h-full rounded-full bg-indigo-500 transition-all duration-300" :style="{ width: r.percent + '%' }"></div>
              </div>
              <span class="text-xs font-semibold text-slate-700 dark:text-slate-300 w-[52px] text-right tabular-nums flex-shrink-0">{{ r.minutes }}m</span>
              <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 w-[40px] text-right tabular-ns flex-shrink-0">{{ r.percent }}%</span>
            </div>
            <div class="pt-1 border-t border-slate-100 dark:border-slate-800/60 flex justify-between text-[10px] text-slate-400">
              <span>Total {{ store.downtimeReasons.reduce((s,r) => s + r.minutes, 0) }}m</span>
              <span>{{ store.downtimeReasons.length }} categories</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Maintenance Tab -->
    <div v-else>
      <div class="chart-card">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h3 class="font-semibold text-base text-slate-900 dark:text-white">Maintenance Schedule</h3>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Preventive (PM) and corrective (CM) maintenance plan</p>
          </div>
        </div>
        <div class="overflow-x-auto -mx-6 px-6">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th class="text-left py-3 px-2 font-semibold">PM ID</th>
                <th class="text-left py-3 px-2 font-semibold">Equipment</th>
                <th class="text-left py-3 px-2 font-semibold">Type</th>
                <th class="text-left py-3 px-2 font-semibold">Title</th>
                <th class="text-left py-3 px-2 font-semibold">Priority</th>
                <th class="text-left py-3 px-2 font-semibold">Status</th>
                <th class="text-left py-3 px-2 font-semibold">Tech</th>
                <th class="text-right py-3 px-2 font-semibold">Est. Hrs</th>
                <th class="text-left py-3 px-2 font-semibold">Scheduled</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pm in store.maintenanceLog" :key="pm.id"
                class="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td class="py-3 px-2 font-mono text-xs font-medium text-slate-700 dark:text-slate-300">{{ pm.id }}</td>
                <td class="py-3 px-2 font-mono text-xs text-slate-500 dark:text-slate-400">{{ pm.equipment }}</td>
                <td class="py-3 px-2">
                  <span class="badge" :class="pm.type === 'Preventive' ? 'badge-low' : 'badge-high'">{{ pm.type === 'Preventive' ? 'PM' : 'CM' }}</span>
                </td>
                <td class="py-3 px-2 text-slate-700 dark:text-slate-300">{{ pm.title }}</td>
                <td class="py-3 px-2"><span class="badge" :class="pm.priority === 'Critical' ? 'badge-high' : pm.priority === 'High' ? 'badge-medium' : 'badge-low'">{{ pm.priority }}</span></td>
                <td class="py-3 px-2">
                  <span class="badge" :class="maintStatusConfig[pm.status].badge">
                    <i :class="maintStatusConfig[pm.status].icon" class="text-[10px] mr-1"></i>{{ pm.status }}
                  </span>
                </td>
                <td class="py-3 px-2">
                  <div class="flex items-center gap-2">
                    <img v-if="store.getEmployee(pm.tech)" :src="store.getEmployee(pm.tech).avatar" :alt="store.getEmployee(pm.tech).name" class="w-6 h-6 rounded-full object-cover" />
                    <span class="text-xs text-slate-600 dark:text-slate-400">{{ store.getEmployee(pm.tech)?.name || '—' }}</span>
                  </div>
                </td>
                <td class="py-3 px-2 text-right text-slate-600 dark:text-slate-400">{{ pm.estHours }}h</td>
                <td class="py-3 px-2 text-xs text-slate-500 dark:text-slate-400">{{ pm.scheduled }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
