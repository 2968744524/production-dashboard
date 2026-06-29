<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useDataStore } from '../stores/data'
import Chart from 'primevue/chart'

const store = useDataStore()
const isDark = ref(false)
const selectedShift = ref('all')
const selectedEmployee = ref(null)

const skillChart = ref({})
const radarOptions = ref({})

function buildCharts() {
  const emp = selectedEmployee.value ? store.getEmployee(selectedEmployee.value) : store.employees[0]
  const skills = ['Technical', 'Quality', 'Safety', 'Productivity', 'Teamwork', 'Attendance']
  // 根据 oee 和 yield 生成合理的能力值
  const data = [
    Math.min(emp.oee, 100),
    emp.yield,
    95 + Math.random() * 5,
    85 + Math.random() * 10,
    88 + Math.random() * 8,
    94 + Math.random() * 5,
  ].map(v => Math.round(v))

  skillChart.value = {
    labels: skills,
    datasets: [{
      label: emp.name,
      data,
      backgroundColor: 'rgba(99,102,241,0.15)',
      borderColor: '#6366f1', borderWidth: 2.5,
      pointBackgroundColor: '#6366f1', pointBorderColor: '#fff', pointBorderWidth: 2,
      pointRadius: 4, pointHoverRadius: 6,
    }]
  }
}

function buildOptions() {
  const dark = isDark.value
  radarOptions.value = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false },
      tooltip: { backgroundColor: dark ? '#1e293b' : '#fff', titleColor: dark ? '#f1f5f9' : '#0f172a', bodyColor: dark ? '#94a3b8' : '#475569', borderColor: dark ? '#334155' : '#e2e8f0', borderWidth: 1, cornerRadius: 12, padding: 12 } },
    scales: { r: { min: 60, max: 100, ticks: { color: dark ? '#475569' : '#cbd5e1', backdropColor: 'transparent', font: { size: 10 }, stepSize: 10 }, grid: { color: dark ? 'rgba(148,163,184,0.12)' : 'rgba(15,23,42,0.08)' }, angleLines: { color: dark ? 'rgba(148,163,184,0.12)' : 'rgba(15,23,42,0.08)' }, pointLabels: { color: dark ? '#e2e8f0' : '#334155', font: { size: 11, family: 'Inter', weight: 500 } } } }
  }
}

const shiftConfig = {
  'Day':    { label: 'Day Shift',    time: '06:00 - 14:00', color: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  'Swing':  { label: 'Swing Shift',  time: '14:00 - 22:00', color: 'bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400', dot: 'bg-indigo-500' },
  'Night':  { label: 'Night Shift',  time: '22:00 - 06:00', color: 'bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-400', dot: 'bg-violet-500' },
}

const filteredEmployees = computed(() => {
  if (selectedShift.value === 'all') return store.employees
  return store.employees.filter(e => e.shift === selectedShift.value)
})

const wfStats = computed(() => ({
  total: store.employees.length,
  dayShift: store.employees.filter(e => e.shift === 'Day').length,
  swingShift: store.employees.filter(e => e.shift === 'Swing').length,
  nightShift: store.employees.filter(e => e.shift === 'Night').length,
  avgOee: (store.employees.reduce((s, e) => s + e.oee, 0) / store.employees.length).toFixed(1),
}))

function selectEmployee(id) {
  selectedEmployee.value = id
  buildCharts()
}

// 本周排班表（演示 7 天）
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const observer = new MutationObserver(() => {
  isDark.value = document.documentElement.classList.contains('dark')
  buildOptions()
  if (selectedEmployee.value) buildCharts()
})

onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark')
  buildOptions(); buildCharts()
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
          <span class="text-slate-600 dark:text-slate-400">Workforce</span>
        </div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Workforce</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Personnel · Shift scheduling · Performance tracking</p>
      </div>
    </div>

    <!-- KPI -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <div class="stat-card">
        <p class="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1.5">Total Staff</p>
        <p class="text-[28px] font-bold text-slate-900 dark:text-white tracking-tight tabular-nums leading-tight">{{ wfStats.total }}</p>
        <p class="text-[11px] text-slate-400 mt-1">Active roster</p>
      </div>
      <div class="stat-card">
        <p class="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1.5">Day Shift</p>
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-amber-500"></span>
          <p class="text-[28px] font-bold text-amber-600 dark:text-amber-400 tabular-nums leading-tight">{{ wfStats.dayShift }}</p>
        </div>
        <p class="text-[11px] text-slate-400 mt-1">06:00 – 14:00</p>
      </div>
      <div class="stat-card">
        <p class="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1.5">Swing Shift</p>
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
          <p class="text-[28px] font-bold text-indigo-600 dark:text-indigo-400 tabular-nums leading-tight">{{ wfStats.swingShift }}</p>
        </div>
        <p class="text-[11px] text-slate-400 mt-1">14:00 – 22:00</p>
      </div>
      <div class="stat-card">
        <p class="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1.5">Night Shift</p>
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-violet-500"></span>
          <p class="text-[28px] font-bold text-violet-600 dark:text-violet-400 tabular-nums leading-tight">{{ wfStats.nightShift }}</p>
        </div>
        <p class="text-[11px] text-slate-400 mt-1">22:00 – 06:00</p>
      </div>
      <div class="stat-card">
        <p class="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1.5">Avg OEE</p>
        <p class="text-[28px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums leading-tight">{{ wfStats.avgOee }}%</p>
        <div class="mt-1.5 h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div class="h-full rounded-full bg-emerald-500" :style="{ width: wfStats.avgOee + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- Shift filter -->
    <div class="flex items-center gap-2 mb-6">
      <button @click="selectedShift = 'all'" class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
        :class="selectedShift === 'all' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800'">
        All Shifts
      </button>
      <button v-for="(conf, key) in shiftConfig" :key="key" @click="selectedShift = key"
        class="px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
        :class="selectedShift === key ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800'">
        <span class="w-2 h-2 rounded-full" :class="conf.dot"></span>{{ conf.label }}
      </button>
    </div>

    <!-- Employee grid + detail -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      <!-- Employee cards (2 cols) -->
      <div class="lg:col-span-2">
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <div v-for="emp in filteredEmployees" :key="emp.id"
            class="stat-card cursor-pointer group !p-4"
            :class="selectedEmployee === emp.id ? '!border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-500/10' : ''"
            @click="selectEmployee(emp.id)">
            <!-- Avatar + name -->
            <div class="flex items-center gap-3 mb-3">
              <div class="relative">
                <img :src="emp.avatar" :alt="emp.name" class="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700 group-hover:ring-indigo-300 dark:group-hover:ring-indigo-500/40 transition-all" />
                <span class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-slate-900" :class="shiftConfig[emp.shift].dot"></span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">{{ emp.name }}</p>
                <p class="text-[11px] text-slate-400 dark:text-slate-500 truncate font-medium">{{ emp.role }}</p>
              </div>
            </div>
            <!-- Skills tags -->
            <div class="flex flex-wrap gap-1 mb-3">
              <span v-for="skill in emp.skills.slice(0, 2)" :key="skill" class="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold tracking-wide">{{ skill }}</span>
              <span v-if="emp.skills.length > 2" class="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 font-medium">+{{ emp.skills.length - 2 }}</span>
            </div>
            <!-- Performance -->
            <div class="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div>
                <p class="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">OEE</p>
                <p class="text-sm font-bold tabular-nums" :class="emp.oee >= 85 ? 'text-emerald-500' : emp.oee >= 80 ? 'text-amber-500' : 'text-rose-500'">{{ emp.oee }}%</p>
              </div>
              <div>
                <p class="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Yield</p>
                <p class="text-sm font-bold text-emerald-500 tabular-nums">{{ emp.yield }}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected employee detail -->
      <div class="chart-card sticky top-24 self-start">
        <div v-if="selectedEmployee" class="flex flex-col">
          <div class="flex flex-col items-center text-center mb-5">
            <img :src="store.getEmployee(selectedEmployee)?.avatar" :alt="store.getEmployee(selectedEmployee)?.name"
              class="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-100 dark:ring-indigo-500/20 mb-3" />
            <p class="font-semibold text-slate-900 dark:text-white">{{ store.getEmployee(selectedEmployee)?.name }}</p>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{{ store.getEmployee(selectedEmployee)?.role }} · {{ store.getEmployee(selectedEmployee)?.id }}</p>
            <span class="mt-2 px-2.5 py-1 rounded-lg text-xs font-medium" :class="shiftConfig[store.getEmployee(selectedEmployee)?.shift].color">
              {{ shiftConfig[store.getEmployee(selectedEmployee)?.shift].label }} · {{ shiftConfig[store.getEmployee(selectedEmployee)?.shift].time }}
            </span>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-3 gap-2 mb-5">
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
              <p class="text-[10px] text-slate-400 uppercase tracking-wider">OEE</p>
              <p class="text-lg font-bold text-indigo-500">{{ store.getEmployee(selectedEmployee)?.oee }}%</p>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
              <p class="text-[10px] text-slate-400 uppercase tracking-wider">Yield</p>
              <p class="text-lg font-bold text-emerald-500">{{ store.getEmployee(selectedEmployee)?.yield }}%</p>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
              <p class="text-[10px] text-slate-400 uppercase tracking-wider">Dept</p>
              <p class="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1.5">{{ store.getEmployee(selectedEmployee)?.dept }}</p>
            </div>
          </div>

          <!-- Skills -->
          <div class="mb-5">
            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Skills</p>
            <div class="flex flex-wrap gap-1.5">
              <span v-for="skill in store.getEmployee(selectedEmployee)?.skills" :key="skill"
                class="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">{{ skill }}</span>
            </div>
          </div>

          <!-- Radar chart -->
          <div class="mb-5">
            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Competency Matrix</p>
            <div class="h-56"><Chart type="radar" :data="skillChart" :options="radarOptions" /></div>
          </div>

          <!-- Contact -->
          <div class="pt-4 border-t border-slate-100 dark:border-slate-800">
            <p class="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <i class="pi pi-phone text-[10px]"></i>{{ store.getEmployee(selectedEmployee)?.phone }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Weekly schedule -->
    <div class="chart-card">
      <div class="flex items-center justify-between mb-5">
        <div>
          <h3 class="font-semibold text-base text-slate-900 dark:text-white">Weekly Shift Schedule</h3>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Current week · {{ filteredEmployees.length }} staff on roster</p>
        </div>
      </div>
      <div class="overflow-x-auto -mx-6 px-6">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <th class="text-left py-3 px-2 font-semibold sticky left-0 bg-white dark:bg-slate-900">Employee</th>
              <th v-for="d in weekDays" :key="d" class="text-center py-3 px-2 font-semibold">{{ d }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="emp in filteredEmployees.slice(0, 8)" :key="emp.id"
              class="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <td class="py-2.5 px-2 sticky left-0 bg-white dark:bg-slate-900">
                <div class="flex items-center gap-2">
                  <img :src="emp.avatar" :alt="emp.name" class="w-7 h-7 rounded-full object-cover" />
                  <div class="min-w-0">
                    <p class="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{{ emp.name }}</p>
                    <p class="text-[10px] text-slate-400 dark:text-slate-500">{{ emp.shift }} shift</p>
                  </div>
                </div>
              </td>
              <td v-for="(d, idx) in weekDays" :key="d" class="text-center py-2.5 px-2">
                <span v-if="emp.shift === 'Day' && idx < 5" class="inline-block w-2 h-2 rounded-full bg-amber-500" title="Day shift"></span>
                <span v-else-if="emp.shift === 'Swing' && idx < 5" class="inline-block w-2 h-2 rounded-full bg-indigo-500" title="Swing shift"></span>
                <span v-else-if="emp.shift === 'Night' && idx < 6" class="inline-block w-2 h-2 rounded-full bg-violet-500" title="Night shift"></span>
                <span v-else-if="idx === 5 || idx === 6" class="text-[10px] text-slate-300 dark:text-slate-700">OFF</span>
                <span v-else class="inline-block w-2 h-2 rounded-full" :class="shiftConfig[emp.shift].dot"></span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div v-for="(conf, key) in shiftConfig" :key="key" class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full" :class="conf.dot"></span>
          <span class="text-slate-500 dark:text-slate-400 font-medium">{{ conf.label }} ({{ conf.time }})</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-slate-300 dark:text-slate-700 font-medium">OFF</span>
          <span class="text-slate-500 dark:text-slate-400">Day off</span>
        </div>
      </div>
    </div>
  </div>
</template>
