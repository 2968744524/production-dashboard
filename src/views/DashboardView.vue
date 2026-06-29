<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useDataStore } from '../stores/data'
import Chart from 'primevue/chart'
import Toast from 'primevue/toast'

const store = useDataStore()
const isDark = ref(false)

const colorMap = {
  indigo:  { bg: 'bg-indigo-50 dark:bg-indigo-500/15',  text: 'text-indigo-600 dark:text-indigo-400', ring: 'bg-indigo-500' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400', ring: 'bg-emerald-500' },
  amber:   { bg: 'bg-amber-50 dark:bg-amber-500/15',   text: 'text-amber-600 dark:text-amber-400',   ring: 'bg-amber-500' },
  rose:    { bg: 'bg-rose-50 dark:bg-rose-500/15',     text: 'text-rose-600 dark:text-rose-400',     ring: 'bg-rose-500' },
  blue:    { bg: 'bg-blue-50 dark:bg-blue-500/15',     text: 'text-blue-600 dark:text-blue-400',     ring: 'bg-blue-500' },
  teal:    { bg: 'bg-teal-50 dark:bg-teal-500/15',     text: 'text-teal-600 dark:text-teal-400',     ring: 'bg-teal-500' },
}

const productionChart = ref({})
const qualityChart = ref({})
const oeeChart = ref({})
const chartOptions = ref({})
const doughnutOptions = ref({})
const radarOptions = ref({})

function buildCharts() {
  productionChart.value = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Output',
        data: [1850, 2100, 1940, 2300, 2180, 1650, 1200],
        borderColor: '#6366f1',
        backgroundColor: (ctx) => {
          const { ctx: c, chartArea } = ctx.chart
          if (!chartArea) return 'rgba(99,102,241,0.1)'
          const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
          g.addColorStop(0, 'rgba(99,102,241,0.3)'); g.addColorStop(1, 'rgba(99,102,241,0)')
          return g
        },
        fill: true, tension: 0.4, borderWidth: 3,
        pointRadius: 4, pointHoverRadius: 7,
        pointBackgroundColor: '#fff', pointBorderColor: '#6366f1', pointBorderWidth: 2.5,
        pointHoverBackgroundColor: '#6366f1', pointHoverBorderColor: '#fff',
      },
      {
        label: 'Target', data: [2000, 2000, 2000, 2000, 2000, 2000, 2000],
        borderColor: '#f59e0b', borderDash: [8, 4], borderWidth: 2,
        fill: false, tension: 0, pointRadius: 0,
      }
    ]
  }

  qualityChart.value = {
    labels: ['Pass', 'Rework', 'Scrap'],
    datasets: [{
      data: [78.2, 16.5, 5.3],
      backgroundColor: ['#6366f1', '#f59e0b', '#ef4444'],
      borderWidth: 0, hoverOffset: 14, spacing: 3,
    }]
  }

  oeeChart.value = {
    labels: ['Availability', 'Performance', 'Quality', 'OEE'],
    datasets: [{
      label: 'Today',
      data: [91.8, 88.4, 98.2, 82.4],
      backgroundColor: 'rgba(99,102,241,0.22)',
      borderColor: '#6366f1', borderWidth: 2.5,
      pointBackgroundColor: '#6366f1', pointBorderColor: '#fff', pointBorderWidth: 2.5,
      pointRadius: 5, pointHoverRadius: 8,
    }, {
      label: 'Target', data: [92, 90, 98, 85],
      backgroundColor: 'rgba(245,158,11,0.10)',
      borderColor: '#f59e0b', borderDash: [6, 4], borderWidth: 2, pointRadius: 0,
    }]
  }
}

function buildOptions() {
  const dark = isDark.value
  const gridColor = dark ? 'rgba(148,163,184,0.08)' : 'rgba(15,23,42,0.05)'
  const tickColor = dark ? '#64748b' : '#94a3b8'

  chartOptions.value = {
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: true, position: 'top', align: 'end',
        labels: { color: dark ? '#cbd5e1' : '#475569', font: { size: 12, family: 'Inter', weight: 500 }, usePointStyle: true, pointStyle: 'circle', padding: 16, boxWidth: 8 } },
      tooltip: { backgroundColor: dark ? '#1e293b' : '#fff', titleColor: dark ? '#f1f5f9' : '#0f172a', bodyColor: dark ? '#94a3b8' : '#475569', borderColor: dark ? '#334155' : '#e2e8f0', borderWidth: 1, cornerRadius: 12, padding: 12, titleFont: { size: 13, family: 'Inter', weight: 600 }, bodyFont: { size: 12, family: 'Inter' }, displayColors: true, boxPadding: 4, caretSize: 6 }
    },
    scales: {
      x: { ticks: { color: tickColor, font: { size: 11, family: 'Inter' } }, grid: { display: false }, border: { color: dark ? '#334155' : '#e2e8f0' } },
      y: { ticks: { color: tickColor, font: { size: 11, family: 'Inter' } }, grid: { color: gridColor }, border: { display: false } }
    }
  }

  doughnutOptions.value = {
    ...chartOptions.value, cutout: '70%',
    plugins: { ...chartOptions.value.plugins, legend: { ...chartOptions.value.plugins.legend, position: 'bottom', align: 'center', labels: { ...chartOptions.value.plugins.legend.labels, padding: 16, usePointStyle: true } } },
    scales: undefined,
  }

  radarOptions.value = {
    responsive: true, maintainAspectRatio: true,
    plugins: { legend: { display: false }, tooltip: chartOptions.value.plugins.tooltip },
    scales: {
      r: {
        min: 0, max: 100,
        ticks: {
          color: dark ? '#64748b' : '#94a3b8',
          backdropColor: 'transparent',
          showLabelBackdrop: false,
          font: { size: 10, family: 'Inter', weight: 500 },
          stepSize: 25,
          padding: 4
        },
        grid: { color: dark ? 'rgba(148,163,184,0.14)' : 'rgba(15,23,42,0.07)' },
        angleLines: { color: dark ? 'rgba(148,163,184,0.14)' : 'rgba(15,23,42,0.07)' },
        pointLabels: { color: dark ? '#e2e8f0' : '#1e293b', font: { size: 12, family: 'Inter', weight: 600 }, padding: 8 }
      }
    }
  }
}

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
          <span>Plant Operations</span>
          <i class="pi pi-angle-right text-[10px]"></i>
          <span class="text-slate-600 dark:text-slate-400">Dashboard</span>
        </div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Production Overview</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) }} · Plant 1, Michigan</p>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span class="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Live</span>
          <span class="text-xs text-slate-400 dark:text-slate-500">· Just now</span>
        </div>
        <button class="btn-ghost flex items-center gap-1.5 text-sm">
          <i class="pi pi-download text-xs"></i>Export
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      <div v-for="(item, i) in store.dashboardKpi" :key="i" class="stat-card group cursor-pointer">
        <div class="flex items-start justify-between mb-4">
          <div class="p-2.5 rounded-xl transition-transform group-hover:scale-110" :class="colorMap[item.color].bg">
            <i :class="[item.icon, colorMap[item.color].text]" class="text-lg"></i>
          </div>
          <span class="text-[11px] font-bold px-2 py-1 rounded-md flex items-center gap-0.5"
            :class="item.up ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400'">
            <i :class="item.up ? 'pi pi-arrow-up' : 'pi pi-arrow-down'" class="text-[9px]"></i>
            {{ item.change }}
          </span>
        </div>
        <div class="text-[26px] xl:text-[28px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight" style="font-variant-numeric: tabular-nums;">{{ item.value }}</div>
        <div class="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{{ item.label }}</div>
        <!-- Mini sparkline -->
        <div class="mt-3 h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div class="h-full rounded-full" :class="colorMap[item.color].ring" :style="{ width: 60 + Math.random() * 30 + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- Charts Row 1 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      <div class="lg:col-span-2 chart-card">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h3 class="font-semibold text-base text-slate-900 dark:text-white">Production Trend</h3>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Output vs target · Last 7 days</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">7 days</span>
          </div>
        </div>
        <div class="h-64"><Chart type="line" :data="productionChart" :options="chartOptions" /></div>
      </div>

      <div class="chart-card flex flex-col">
        <div class="mb-2">
          <h3 class="font-semibold text-base text-slate-900 dark:text-white">Quality Rate</h3>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Pass · Rework · Scrap</p>
        </div>
        <div class="flex-1 flex items-center justify-center min-h-0"><Chart type="doughnut" :data="qualityChart" :options="doughnutOptions" /></div>
      </div>
    </div>

    <!-- Charts Row 2 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      <div class="chart-card flex flex-col items-center">
        <div class="mb-3 w-full">
          <h3 class="font-semibold text-base text-slate-900 dark:text-white">OEE Breakdown</h3>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Availability × Performance × Quality</p>
        </div>
        <div class="w-full flex items-center justify-center"><Chart type="radar" :data="oeeChart" :options="radarOptions" /></div>
        <div class="flex items-center justify-center gap-5 pt-1">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-indigo-500 ring-2 ring-indigo-500/30"></span>
            <span class="text-xs font-semibold text-slate-600 dark:text-slate-400">Today</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full border-2 border-amber-500"></span>
            <span class="text-xs font-semibold text-slate-600 dark:text-slate-400">Target</span>
          </div>
        </div>
      </div>

      <div class="lg:col-span-2 chart-card">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-semibold text-base text-slate-900 dark:text-white">Recent Alerts</h3>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Latest system notifications</p>
          </div>
          <button class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors flex items-center gap-1">
            View all <i class="pi pi-arrow-right text-[10px]"></i>
          </button>
        </div>
        <div class="flex flex-col gap-2">
          <div v-for="alert in store.alerts.slice(0, 5)" :key="alert.id"
            class="flex items-center gap-3 p-3 rounded-xl table-row-hover cursor-pointer">
            <div class="p-2.5 rounded-xl flex-shrink-0"
              :class="{
                'bg-rose-50 dark:bg-rose-500/15': alert.level === 'error',
                'bg-amber-50 dark:bg-amber-500/15': alert.level === 'warning',
                'bg-blue-50 dark:bg-blue-500/15': alert.level === 'info',
              }">
              <i class="text-sm" :class="{
                'pi pi-times-circle text-rose-500': alert.level === 'error',
                'pi pi-exclamation-triangle text-amber-500': alert.level === 'warning',
                'pi pi-info-circle text-blue-500': alert.level === 'info',
              }"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{{ alert.message }}</p>
              <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{{ alert.time }} · <span class="font-medium text-slate-500 dark:text-slate-400">{{ alert.source }}</span></p>
            </div>
            <span class="badge flex-shrink-0" :class="{
              'badge-high': alert.level === 'error',
              'badge-medium': alert.level === 'warning',
              'badge-low': alert.level === 'info',
            }">{{ alert.level }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Work Orders -->
    <div class="chart-card">
      <div class="flex items-center justify-between mb-5">
        <div>
          <h3 class="font-semibold text-base text-slate-900 dark:text-white">Active Work Orders</h3>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Currently in progress</p>
        </div>
        <router-link to="/work-orders" class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors flex items-center gap-1">
          View all <i class="pi pi-arrow-right text-[10px]"></i>
        </router-link>
      </div>
      <div class="overflow-x-auto -mx-6 px-6">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <th class="text-left py-3 px-2 font-bold">Work Order</th>
              <th class="text-left py-3 px-2 font-bold">Product</th>
              <th class="text-left py-3 px-2 font-bold">Line</th>
              <th class="text-right py-3 px-2 font-bold">Qty</th>
              <th class="text-left py-3 px-2 font-semibold w-56">Progress</th>
              <th class="text-left py-3 px-2 font-bold">Due</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="wo in store.workOrders.filter(w => w.status === 'In Progress').slice(0, 5)" :key="wo.id"
              class="border-b border-slate-100 dark:border-slate-800/50 table-row-hover cursor-pointer">
              <td class="py-3 px-2 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">{{ wo.id }}</td>
              <td class="py-3 px-2 text-slate-700 dark:text-slate-300 font-medium">{{ wo.product }}</td>
              <td class="py-3 px-2"><span class="badge badge-todo">{{ wo.line }}</span></td>
              <td class="py-3 px-2 text-right text-slate-600 dark:text-slate-400 tabular-nums">{{ wo.completed }}/{{ wo.qty }}</td>
              <td class="py-3 px-2">
                <div class="flex items-center gap-2.5">
                  <div class="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div class="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all" :style="{ width: wo.progress + '%' }"></div>
                  </div>
                  <span class="text-xs font-semibold text-slate-600 dark:text-slate-400 w-10 text-right tabular-nums">{{ wo.progress }}%</span>
                </div>
              </td>
              <td class="py-3 px-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">{{ wo.dueDate }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Toast />
  </div>
</template>
