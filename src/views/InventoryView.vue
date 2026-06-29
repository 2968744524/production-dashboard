<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useDataStore } from '../stores/data'
import Chart from 'primevue/chart'

const store = useDataStore()
const isDark = ref(false)
const search = ref('')
const filterAbc = ref('')

const abcChart = ref({})
const ageChart = ref({})
const chartOptions = ref({})
const barOptions = ref({})

function buildCharts() {
  // ABC 分类
  const abcCount = { A: 0, B: 0, C: 0 }
  store.inventory.forEach(i => { abcCount[i.abc]++ })
  abcChart.value = {
    labels: ['Class A (High value)', 'Class B (Medium)', 'Class C (Low value)'],
    datasets: [{
      data: [abcCount.A, abcCount.B, abcCount.C],
      backgroundColor: ['#6366f1', '#8b5cf6', '#a855f7'],
      borderWidth: 0, hoverOffset: 10,
    }]
  }

  // 库龄分布
  ageChart.value = {
    labels: ['0-7 days', '8-30 days', '31-90 days', '90+ days'],
    datasets: [{
      label: 'Items',
      data: [3, 2, 2, 1],
      backgroundColor: (ctx) => {
        const { ctx: c, chartArea } = ctx.chart
        if (!chartArea) return '#6366f1'
        const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
        g.addColorStop(0, '#818cf8'); g.addColorStop(1, '#6366f1')
        return g
      },
      borderRadius: 8, barThickness: 40,
    }]
  }
}

function buildOptions() {
  const dark = isDark.value
  chartOptions.value = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'bottom', labels: { color: dark ? '#cbd5e1' : '#475569', font: { size: 11, family: 'Inter' }, usePointStyle: true, pointStyle: 'circle', padding: 12, boxWidth: 8 } },
      tooltip: { backgroundColor: dark ? '#1e293b' : '#fff', titleColor: dark ? '#f1f5f9' : '#0f172a', bodyColor: dark ? '#94a3b8' : '#475569', borderColor: dark ? '#334155' : '#e2e8f0', borderWidth: 1, cornerRadius: 12, padding: 12 } },
    scales: undefined,
  }
  barOptions.value = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: chartOptions.value.plugins.tooltip },
    scales: {
      x: { ticks: { color: dark ? '#64748b' : '#94a3b8', font: { size: 11, family: 'Inter' } }, grid: { display: false }, border: { color: dark ? '#334155' : '#e2e8f0' } },
      y: { ticks: { color: dark ? '#64748b' : '#94a3b8', font: { size: 11, family: 'Inter' }, stepSize: 1 }, grid: { color: dark ? 'rgba(148,163,184,0.08)' : 'rgba(15,23,42,0.06)' }, border: { display: false }, beginAtZero: true }
    }
  }
}

const invStats = computed(() => {
  const items = store.inventory
  return {
    totalSku: items.length,
    totalValue: items.reduce((s, i) => s + i.onHand * (store.getProduct(i.sku)?.price || 0), 0),
    lowStock: items.filter(i => i.onHand <= i.safety).length,
    critical: items.filter(i => i.onHand <= i.safety * 0.7).length,
  }
})

const statusConfig = {
  healthy:  { label: 'Healthy',  badge: 'badge-done',     dot: 'bg-emerald-500' },
  warning:  { label: 'Low',      badge: 'badge-medium',   dot: 'bg-amber-500' },
  critical: { label: 'Critical', badge: 'badge-high',     dot: 'bg-rose-500' },
}

const moveTypeConfig = {
  IN:  { badge: 'badge-done',     icon: 'pi pi-arrow-down-left', text: 'text-emerald-500' },
  OUT: { badge: 'badge-progress', icon: 'pi pi-arrow-up-right',  text: 'text-indigo-500' },
}

const filteredInventory = computed(() => {
  return store.inventoryStatus.filter(i => {
    const m = search.value.toLowerCase()
    const matchSearch = !m || i.sku.toLowerCase().includes(m) || i.name.toLowerCase().includes(m)
    const matchAbc = !filterAbc.value || i.abc === filterAbc.value
    return matchSearch && matchAbc
  })
})

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
          <span>Operations</span>
          <i class="pi pi-angle-right text-[10px]"></i>
          <span class="text-slate-600 dark:text-slate-400">Inventory</span>
        </div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Inventory</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Material stock levels · Movements · ABC analysis</p>
      </div>
      <button class="btn-primary flex items-center gap-2">
        <i class="pi pi-plus text-sm"></i> New Material
      </button>
    </div>

    <!-- KPI -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="stat-card">
        <p class="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1">Total SKUs</p>
        <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ invStats.totalSku }}</p>
      </div>
      <div class="stat-card">
        <p class="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1">Stock Value</p>
        <p class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">${{ (invStats.totalValue / 1000).toFixed(1) }}K</p>
      </div>
      <div class="stat-card">
        <p class="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1">Low Stock</p>
        <p class="text-2xl font-bold text-amber-600 dark:text-amber-400">{{ invStats.lowStock }}</p>
      </div>
      <div class="stat-card">
        <p class="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1">Critical</p>
        <p class="text-2xl font-bold text-rose-600 dark:text-rose-400">{{ invStats.critical }}</p>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <div class="chart-card">
        <div class="mb-5">
          <h3 class="font-semibold text-base text-slate-900 dark:text-white">ABC Classification</h3>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Pareto-based value categorization</p>
        </div>
        <div class="h-56"><Chart type="doughnut" :data="abcChart" :options="chartOptions" /></div>
      </div>
      <div class="chart-card">
        <div class="mb-5">
          <h3 class="font-semibold text-base text-slate-900 dark:text-white">Stock Age Distribution</h3>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">How long items have been in inventory</p>
        </div>
        <div class="h-56"><Chart type="bar" :data="ageChart" :options="barOptions" /></div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-6 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <div class="flex-1 min-w-[200px] relative">
        <i class="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
        <input v-model="search" type="text" placeholder="Search by SKU or name..." class="field-input pl-11" />
      </div>
      <select v-model="filterAbc" class="field-input !w-auto min-w-[130px] cursor-pointer">
        <option value="">All Classes</option>
        <option value="A">Class A</option>
        <option value="B">Class B</option>
        <option value="C">Class C</option>
      </select>
    </div>

    <!-- Inventory table -->
    <div class="chart-card mb-6">
      <div class="flex items-center justify-between mb-5">
        <h3 class="font-semibold text-base text-slate-900 dark:text-white">Material Stock</h3>
        <span class="text-xs text-slate-400 dark:text-slate-500">{{ filteredInventory.length }} items</span>
      </div>
      <div class="overflow-x-auto -mx-6 px-6">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <th class="text-left py-3 px-2 font-semibold">SKU</th>
              <th class="text-left py-3 px-2 font-semibold">Name</th>
              <th class="text-left py-3 px-2 font-semibold">ABC</th>
              <th class="text-right py-3 px-2 font-semibold">On Hand</th>
              <th class="text-right py-3 px-2 font-semibold">Safety</th>
              <th class="text-left py-3 px-2 font-semibold w-48">Stock Level</th>
              <th class="text-left py-3 px-2 font-semibold">Status</th>
              <th class="text-right py-3 px-2 font-semibold">Lead Time</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredInventory" :key="item.sku"
              class="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <td class="py-3 px-2 font-mono text-xs font-medium text-slate-700 dark:text-slate-300">{{ item.sku }}</td>
              <td class="py-3 px-2 text-slate-700 dark:text-slate-300">{{ item.name }}</td>
              <td class="py-3 px-2"><span class="badge" :class="item.abc === 'A' ? 'badge-high' : item.abc === 'B' ? 'badge-medium' : 'badge-low'">{{ item.abc }}</span></td>
              <td class="py-3 px-2 text-right font-semibold text-slate-700 dark:text-slate-300">{{ item.onHand.toLocaleString() }}</td>
              <td class="py-3 px-2 text-right text-slate-500 dark:text-slate-400">{{ item.safety.toLocaleString() }}</td>
              <td class="py-3 px-2">
                <div class="flex items-center gap-2">
                  <div class="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                    <div class="absolute left-0 top-0 h-full w-px bg-amber-500" :style="{ left: '50%' }" title="Safety stock"></div>
                    <div class="h-full rounded-full" :class="item.status === 'critical' ? 'bg-rose-500' : item.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'"
                      :style="{ width: Math.min((item.onHand / item.max) * 100, 100) + '%' }"></div>
                  </div>
                  <span class="text-xs text-slate-400 dark:text-slate-500 w-9 text-right">{{ Math.round((item.onHand / item.max) * 100) }}%</span>
                </div>
              </td>
              <td class="py-3 px-2">
                <span class="badge" :class="statusConfig[item.status].badge">
                  <span class="w-1.5 h-1.5 rounded-full inline-block mr-1" :class="statusConfig[item.status].dot"></span>{{ statusConfig[item.status].label }}
                </span>
              </td>
              <td class="py-3 px-2 text-right text-slate-500 dark:text-slate-400">{{ item.leadTime }}d</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Movements -->
    <div class="chart-card">
      <div class="flex items-center justify-between mb-5">
        <div>
          <h3 class="font-semibold text-base text-slate-900 dark:text-white">Recent Movements</h3>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Latest inventory transactions</p>
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <div v-for="mov in store.inventoryMovements" :key="mov.id"
          class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
          <div class="p-2.5 rounded-xl flex-shrink-0"
            :class="mov.type === 'IN' ? 'bg-emerald-50 dark:bg-emerald-500/15' : 'bg-indigo-50 dark:bg-indigo-500/15'">
            <i :class="[moveTypeConfig[mov.type].icon, moveTypeConfig[mov.type].text]" class="text-sm"></i>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-mono text-xs font-medium text-slate-700 dark:text-slate-300">{{ mov.sku }}</span>
              <span class="badge" :class="mov.type === 'IN' ? 'badge-done' : 'badge-progress'">{{ mov.type }}</span>
            </div>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{{ mov.from }} · {{ mov.time }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-bold" :class="mov.type === 'IN' ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'">
              {{ mov.type === 'IN' ? '+' : '−' }}{{ mov.qty.toLocaleString() }}
            </p>
          </div>
          <div class="flex items-center gap-2 pl-3 border-l border-slate-100 dark:border-slate-800">
            <img v-if="store.getEmployee(mov.operator)" :src="store.getEmployee(mov.operator).avatar" :alt="store.getEmployee(mov.operator).name" class="w-6 h-6 rounded-full object-cover" />
            <span class="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">{{ store.getEmployee(mov.operator)?.name || '—' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
