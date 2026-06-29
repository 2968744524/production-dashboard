<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useDataStore } from '../stores/data'
import Chart from 'primevue/chart'

const store = useDataStore()
const isDark = ref(false)

const xbarChart = ref({})
const rChart = ref({})
const paretoChart = ref({})
const chartOptions = ref({})
const rChartOptions = ref({})
const paretoOptions = ref({})

function buildCharts() {
  const spc = store.spcData
  const labels = spc.subgroups.map(s => s.id)

  // Xbar 控制图
  const meanData = spc.subgroups.map(s => s.mean)
  const uclLine = Array(spc.subgroups.length).fill(spc.ucl)
  const lclLine = Array(spc.subgroups.length).fill(spc.lcl)
  const clLine = Array(spc.subgroups.length).fill(spc.cl)
  const uslLine = Array(spc.subgroups.length).fill(spc.usl)
  const lslLine = Array(spc.subgroups.length).fill(spc.lsl)

  // 标记超限点
  const pointColors = spc.subgroups.map(s => (s.mean > spc.ucl || s.mean < spc.lcl) ? '#ef4444' : '#6366f1')
  const pointRadius = spc.subgroups.map(s => (s.mean > spc.ucl || s.mean < spc.lcl) ? 7 : 4)

  xbarChart.value = {
    labels,
    datasets: [
      { label: 'X̄ (subgroup mean)', data: meanData, borderColor: '#6366f1', backgroundColor: '#6366f1',
        borderWidth: 2, tension: 0.3, pointRadius, pointHoverRadius: 8, pointBackgroundColor: pointColors, pointBorderColor: '#fff', pointBorderWidth: 2, fill: false },
      { label: 'UCL (' + spc.ucl.toFixed(3) + ')', data: uclLine, borderColor: '#ef4444', borderWidth: 1.5, borderDash: [6, 4], pointRadius: 0, fill: false },
      { label: 'CL (' + spc.cl.toFixed(3) + ')', data: clLine, borderColor: '#22c55e', borderWidth: 1.5, borderDash: [4, 4], pointRadius: 0, fill: false },
      { label: 'LCL (' + spc.lcl.toFixed(3) + ')', data: lclLine, borderColor: '#ef4444', borderWidth: 1.5, borderDash: [6, 4], pointRadius: 0, fill: false },
      { label: 'USL (' + spc.usl.toFixed(3) + ')', data: uslLine, borderColor: '#94a3b8', borderWidth: 1, borderDash: [2, 2], pointRadius: 0, fill: false },
      { label: 'LSL (' + spc.lsl.toFixed(3) + ')', data: lslLine, borderColor: '#94a3b8', borderWidth: 1, borderDash: [2, 2], pointRadius: 0, fill: false },
    ]
  }

  // R 图
  const rangeData = spc.subgroups.map(s => s.range)
  const rUcl = Array(spc.subgroups.length).fill(0.037)
  const rCl = Array(spc.subgroups.length).fill(0.020)
  const rPointColors = spc.subgroups.map(s => s.range > 0.037 ? '#ef4444' : '#8b5cf6')
  const rPointRadius = spc.subgroups.map(s => s.range > 0.037 ? 7 : 4)

  rChart.value = {
    labels,
    datasets: [
      { label: 'R (range)', data: rangeData, borderColor: '#8b5cf6', backgroundColor: '#8b5cf6',
        borderWidth: 2, tension: 0.3, pointRadius: rPointRadius, pointHoverRadius: 8, pointBackgroundColor: rPointColors, pointBorderColor: '#fff', pointBorderWidth: 2, fill: false },
      { label: 'UCL (0.037)', data: rUcl, borderColor: '#ef4444', borderWidth: 1.5, borderDash: [6, 4], pointRadius: 0, fill: false },
      { label: 'CL (0.020)', data: rCl, borderColor: '#22c55e', borderWidth: 1.5, borderDash: [4, 4], pointRadius: 0, fill: false },
    ]
  }

  // 柏拉图
  const pareto = store.defectsPareto
  const maxCum = pareto[pareto.length - 1].cumulative
  paretoChart.value = {
    labels: pareto.map(d => d.defect.length > 16 ? d.defect.slice(0, 15) + '…' : d.defect),
    datasets: [
      { label: 'Defect count', data: pareto.map(d => d.count), backgroundColor: '#6366f1', borderRadius: 6, barThickness: 32, yAxisID: 'y' },
      { label: 'Cumulative %', data: pareto.map(d => (d.cumulative / maxCum) * 100), type: 'line', borderColor: '#f59e0b', backgroundColor: '#f59e0b', borderWidth: 2.5, tension: 0.3, pointRadius: 5, pointHoverRadius: 7, pointBackgroundColor: '#fff', pointBorderColor: '#f59e0b', pointBorderWidth: 2, yAxisID: 'y1' }
    ]
  }
}

function buildOptions() {
  const dark = isDark.value
  const gridColor = dark ? 'rgba(148,163,184,0.08)' : 'rgba(15,23,42,0.06)'
  const tickColor = dark ? '#64748b' : '#94a3b8'

  chartOptions.value = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top', align: 'end',
        labels: { color: dark ? '#cbd5e1' : '#475569', font: { size: 11, family: 'Inter', weight: 500 }, usePointStyle: true, pointStyle: 'circle', padding: 12, boxWidth: 8, boxHeight: 8 } },
      tooltip: { backgroundColor: dark ? '#1e293b' : '#fff', titleColor: dark ? '#f1f5f9' : '#0f172a', bodyColor: dark ? '#94a3b8' : '#475569', borderColor: dark ? '#334155' : '#e2e8f0', borderWidth: 1, cornerRadius: 12, padding: 12, titleFont: { size: 13, family: 'Inter', weight: 600 }, bodyFont: { size: 12, family: 'Inter' }, displayColors: true, boxPadding: 4 }
    },
    scales: {
      x: { ticks: { color: tickColor, font: { size: 11, family: 'Inter' } }, grid: { display: false }, border: { color: dark ? '#334155' : '#e2e8f0' } },
      y: { ticks: { color: tickColor, font: { size: 11, family: 'Inter' } }, grid: { color: gridColor }, border: { display: false } }
    }
  }

  rChartOptions.value = { ...chartOptions.value }

  paretoOptions.value = {
    ...chartOptions.value,
    plugins: { ...chartOptions.value.plugins, legend: { ...chartOptions.value.plugins.legend, position: 'top', align: 'end' } },
    scales: {
      x: { ...chartOptions.value.scales.x, ticks: { ...chartOptions.value.scales.x.ticks, maxRotation: 30, minRotation: 0, font: { size: 10 } } },
      y: { ...chartOptions.value.scales.y, position: 'left', title: { display: true, text: 'Count', color: tickColor, font: { size: 11 } } },
      y1: { type: 'linear', display: true, position: 'right', min: 0, max: 100, ticks: { color: '#f59e0b', font: { size: 11 }, callback: (v) => v + '%' }, grid: { drawOnChartArea: false }, border: { display: false }, title: { display: true, text: 'Cumulative %', color: '#f59e0b', font: { size: 11 } } }
    }
  }
}

const cpkStatus = computed(() => {
  const cpk = store.spcData.cpk
  if (cpk >= 1.33) return { label: 'Capable', color: 'emerald', desc: 'Process meets specification' }
  if (cpk >= 1.0) return { label: 'Marginal', color: 'amber', desc: 'Monitor closely' }
  return { label: 'Incapable', color: 'rose', desc: 'Action required' }
})

const colorMap = {
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/30' },
  amber:   { bg: 'bg-amber-50 dark:bg-amber-500/15',   text: 'text-amber-600 dark:text-amber-400',   border: 'border-amber-200 dark:border-amber-500/30' },
  rose:    { bg: 'bg-rose-50 dark:bg-rose-500/15',     text: 'text-rose-600 dark:text-rose-400',     border: 'border-rose-200 dark:border-rose-500/30' },
}

const inspectionStats = computed(() => {
  const batches = store.inspectionBatches
  return {
    total: batches.length,
    accept: batches.filter(b => b.result === 'Accept').length,
    concession: batches.filter(b => b.result === 'Concession').length,
    reject: batches.filter(b => b.result === 'Reject').length,
    yield: ((batches.reduce((sum, b) => sum + b.passed, 0) / batches.reduce((sum, b) => sum + b.sample, 0)) * 100).toFixed(1),
  }
})

const resultConfig = {
  'Accept':    { badge: 'badge-done',     icon: 'pi pi-check-circle',  text: 'text-emerald-500' },
  'Concession':{ badge: 'badge-medium',   icon: 'pi pi-exclamation-circle', text: 'text-amber-500' },
  'Reject':    { badge: 'badge-high',     icon: 'pi pi-times-circle',  text: 'text-rose-500' },
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
          <span>Quality & Assets</span>
          <i class="pi pi-angle-right text-[10px]"></i>
          <span class="text-slate-600 dark:text-slate-400">Quality (SPC)</span>
        </div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Quality Control</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">SPC monitoring · Inspection records · Defect analysis</p>
      </div>
      <div class="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
        <i class="pi pi-shield text-indigo-600 dark:text-indigo-400 text-sm"></i>
        <span class="text-sm font-semibold text-indigo-700 dark:text-indigo-300">ISO 9001 Certified</span>
      </div>
    </div>

    <!-- Cpk 指标卡 -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="stat-card">
        <p class="text-xs text-slate-400 dark:text-slate-500 font-medium mb-2">Process Capability</p>
        <div class="flex items-baseline gap-1.5">
          <span class="text-2xl font-bold text-slate-400 dark:text-slate-500">Cpk</span>
          <span class="text-3xl font-bold tabular-nums" :class="colorMap[cpkStatus.color].text">{{ store.spcData.cpk.toFixed(2) }}</span>
        </div>
        <span class="inline-flex items-center gap-1 mt-2.5 px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider" :class="colorMap[cpkStatus.color].bg + ' ' + colorMap[cpkStatus.color].text">
          <span class="w-1.5 h-1.5 rounded-full" :class="cpkStatus.color === 'emerald' ? 'bg-emerald-500' : cpkStatus.color === 'amber' ? 'bg-amber-500' : 'bg-rose-500'"></span>
          {{ cpkStatus.label }}
        </span>
        <p class="text-[11px] text-slate-400 mt-2 font-medium">{{ cpkStatus.desc }}</p>
      </div>
      <div class="stat-card">
        <p class="text-xs text-slate-400 dark:text-slate-500 font-medium mb-2">Process Performance</p>
        <div class="flex items-baseline gap-1.5">
          <span class="text-2xl font-bold text-slate-400 dark:text-slate-500">Ppk</span>
          <span class="text-3xl font-bold text-amber-500 tabular-nums">{{ store.spcData.ppk.toFixed(2) }}</span>
        </div>
        <p class="text-[11px] text-slate-400 mt-2 font-medium">σ = {{ store.spcData.sigma.toFixed(4) }}mm</p>
      </div>
      <div class="stat-card">
        <p class="text-xs text-slate-400 dark:text-slate-500 font-medium mb-2">First Pass Yield</p>
        <p class="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{{ inspectionStats.yield }}%</p>
        <p class="text-[11px] text-slate-400 mt-2 font-medium">{{ inspectionStats.total }} batches inspected today</p>
      </div>
      <div class="stat-card">
        <p class="text-xs text-slate-400 dark:text-slate-500 font-medium mb-2">Inspection Results</p>
        <div class="flex items-center gap-3 mt-1">
          <span class="flex items-center gap-1 text-sm"><span class="w-2 h-2 rounded-full bg-emerald-500"></span><span class="font-bold text-slate-700 dark:text-slate-300 tabular-nums">{{ inspectionStats.accept }}</span></span>
          <span class="flex items-center gap-1 text-sm"><span class="w-2 h-2 rounded-full bg-amber-500"></span><span class="font-bold text-slate-700 dark:text-slate-300 tabular-nums">{{ inspectionStats.concession }}</span></span>
          <span class="flex items-center gap-1 text-sm"><span class="w-2 h-2 rounded-full bg-rose-500"></span><span class="font-bold text-slate-700 dark:text-slate-300 tabular-nums">{{ inspectionStats.reject }}</span></span>
        </div>
        <p class="text-[11px] text-slate-400 mt-2 font-medium">Accept · Concession · Reject</p>
      </div>
    </div>

    <!-- SPC 控制图：Xbar -->
    <div class="chart-card mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-2">
        <div>
          <h3 class="font-semibold text-base text-slate-900 dark:text-white">X̄ Control Chart</h3>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{{ store.spcData.characteristic }} · n=5 · 25 subgroups</p>
        </div>
        <div class="flex items-center gap-3 text-xs">
          <span class="flex items-center gap-1.5"><span class="w-3 h-0.5 bg-rose-500"></span><span class="text-slate-500 dark:text-slate-400">Control limits</span></span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-0.5 bg-slate-400"></span><span class="text-slate-500 dark:text-slate-400">Spec limits</span></span>
        </div>
      </div>
      <div class="h-72"><Chart type="line" :data="xbarChart" :options="chartOptions" /></div>
    </div>

    <!-- SPC 控制图：R + Pareto -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <div class="chart-card">
        <div class="mb-5">
          <h3 class="font-semibold text-base text-slate-900 dark:text-white">R Control Chart</h3>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Subgroup range (within-group variation)</p>
        </div>
        <div class="h-60"><Chart type="line" :data="rChart" :options="rChartOptions" /></div>
      </div>

      <div class="chart-card">
        <div class="mb-5">
          <h3 class="font-semibold text-base text-slate-900 dark:text-white">Defect Pareto</h3>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">80/20 analysis of defect types</p>
        </div>
        <div class="h-60"><Chart type="bar" :data="paretoChart" :options="paretoOptions" /></div>
      </div>
    </div>

    <!-- 检验批次表 -->
    <div class="chart-card">
      <div class="flex items-center justify-between mb-5">
        <div>
          <h3 class="font-semibold text-base text-slate-900 dark:text-white">Inspection Batches</h3>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Today's quality inspection records</p>
        </div>
        <span class="text-xs text-slate-400 dark:text-slate-500 font-medium">{{ store.inspectionBatches.length }} batches</span>
      </div>
      <div class="overflow-x-auto -mx-6 px-6 custom-scrollbar">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <th class="text-left py-3 px-2 font-bold">Lot ID</th>
              <th class="text-left py-3 px-2 font-bold">Work Order</th>
              <th class="text-left py-3 px-2 font-bold">Product</th>
              <th class="text-right py-3 px-2 font-bold">Sample</th>
              <th class="text-right py-3 px-2 font-bold">Passed</th>
              <th class="text-right py-3 px-2 font-bold">Failed</th>
              <th class="text-left py-3 px-2 font-bold">Result</th>
              <th class="text-left py-3 px-2 font-bold">Inspector</th>
              <th class="text-left py-3 px-2 font-bold">Time</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="batch in store.inspectionBatches" :key="batch.id"
              class="border-b border-slate-100 dark:border-slate-800/50 table-row-hover cursor-pointer">
              <td class="py-3 px-2 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">{{ batch.id }}</td>
              <td class="py-3 px-2 font-mono text-xs text-slate-500 dark:text-slate-400">{{ batch.wo }}</td>
              <td class="py-3 px-2 text-slate-700 dark:text-slate-300 font-medium">{{ batch.product }}</td>
              <td class="py-3 px-2 text-right text-slate-600 dark:text-slate-400 tabular-nums">{{ batch.sample }}</td>
              <td class="py-3 px-2 text-right font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{{ batch.passed }}</td>
              <td class="py-3 px-2 text-right font-bold tabular-nums" :class="batch.failed > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'">{{ batch.failed }}</td>
              <td class="py-3 px-2">
                <span class="badge" :class="resultConfig[batch.result].badge">
                  <i :class="resultConfig[batch.result].icon" class="text-[10px] mr-1"></i>{{ batch.result }}
                </span>
              </td>
              <td class="py-3 px-2">
                <div class="flex items-center gap-2">
                  <img v-if="store.getEmployee(batch.inspector)" :src="store.getEmployee(batch.inspector).avatar" :alt="store.getEmployee(batch.inspector).name" class="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700" />
                  <span class="text-xs text-slate-600 dark:text-slate-400 font-medium">{{ store.getEmployee(batch.inspector)?.name?.split(' ')[0] || '—' }}</span>
                </div>
              </td>
              <td class="py-3 px-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">{{ batch.time }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
