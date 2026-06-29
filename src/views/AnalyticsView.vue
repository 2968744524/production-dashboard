<template>
  <div class="analytics-page">
    <!-- KPI Cards -->
    <el-row :gutter="16" class="kpi-row">
      <el-col :span="6" v-for="(kpi, i) in kpis" :key="i">
        <div class="kpi-card">
          <div class="kpi-label">{{ kpi.label }}</div>
          <div class="kpi-value">{{ kpi.value }}</div>
          <el-progress
            :percentage="kpi.percent"
            :color="kpi.color"
            :stroke-width="6"
            :show-text="false"
            style="margin-top: 8px;"
          />
        </div>
      </el-col>
    </el-row>

    <!-- Charts -->
    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header><div class="card-header"><span>Hourly Production Output</span></div></template>
          <div ref="hourlyChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header><div class="card-header"><span>Defect Rate Trend (30 Days)</span></div></template>
          <div ref="defectChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="24">
        <el-card class="chart-card">
          <template #header><div class="card-header"><span>OEE (Overall Equipment Effectiveness)</span></div></template>
          <div ref="oeeChartRef" style="height: 280px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Data Table -->
    <el-card style="margin-top: 16px; border-radius: 10px;">
      <template #header><div class="card-header"><span>Production Summary Report</span></div></template>
      <el-table
        :data="reportData"
        stripe
        style="width: 100%"
        :header-cell-style="{ background: '#1a2634', color: '#8a9bb0' }"
        show-summary
        :summary-method="getSummary"
      >
        <el-table-column prop="line" label="Production Line" width="150" />
        <el-table-column prop="planned" label="Planned (Units)" width="140" align="right" />
        <el-table-column prop="actual" label="Actual (Units)" width="140" align="right">
          <template #default="{ row }">
            <span :style="{ color: row.actual >= row.planned ? '#67c23a' : '#f56c6c', fontWeight: 600 }">{{ row.actual }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="defects" label="Defects" width="100" align="right" />
        <el-table-column prop="efficiency" label="Efficiency %" width="120" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.efficiency >= 90 ? 'success' : row.efficiency >= 75 ? 'warning' : 'danger'" effect="dark">
              {{ row.efficiency }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="oee" label="OEE %" width="110" align="center">
          <template #default="{ row }">
            <span :class="row.oee >= 80 ? 'oee-good' : 'oee-bad'">{{ row.oee }}%</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const hourlyChartRef = ref(null)
const defectChartRef = ref(null)
const oeeChartRef = ref(null)
let charts = []

const kpis = [
  { label: 'Availability Rate', value: '94.2%', percent: 94.2, color: '#409eff' },
  { label: 'Performance Rate', value: '88.7%', percent: 88.7, color: '#67c23a' },
  { label: 'Quality Rate', value: '98.8%', percent: 98.8, color: '#e6a23c' },
  { label: 'OEE Score', value: '82.7%', percent: 82.7, color: '#f56c6c' }
]

const reportData = [
  { line: 'Line A - Assembly', planned: 4200, actual: 4150, defects: 48, efficiency: 98.8, oee: 86.3 },
  { line: 'Line B - CNC Machining', planned: 3800, actual: 3420, defects: 35, efficiency: 90.0, oee: 81.5 },
  { line: 'Line C - Welding', planned: 2900, actual: 2755, defects: 22, efficiency: 95.0, oee: 84.2 },
  { line: 'Packaging Unit', planned: 1950, actual: 1922, defects: 12, efficiency: 98.6, oee: 91.0 },
  { line: 'Quality Control', planned: 997, actual: 980, defects: 0, efficiency: 98.3, oee: 79.8 }
]

function getSummary({ columns, data }) {
  const sums = []
  columns.forEach((col, i) => {
    if (i === 0) { sums[i] = 'Total'; return }
    const vals = data.map(d => d[col.property])
    if (typeof vals[0] === 'number') {
      sums[i] = vals.reduce((a, b) => a + b, 0)
    } else { sums[i] = '' }
  })
  // Calculate overall efficiency and OEE
  const totalPlanned = data.reduce((a, d) => a + d.planned, 0)
  const totalActual = data.reduce((a, d) => a + d.actual, 0)
  sums[columns.findIndex(c => c.property === 'efficiency')] = ((totalActual / totalPlanned) * 100).toFixed(1) + '%'
  return sums
}

// Generate hourly data
const hours = Array.from({ length: 12 }, (_, i) => `${(i + 7)}:00`)
const hourlyData = [120, 180, 250, 310, 380, 350, 290, 320, 370, 340, 200, 95]
const targetHourly = [150, 200, 260, 330, 360, 340, 300, 330, 360, 330, 220, 100]

// Defect rate over 30 days
const days30 = Array.from({ length: 30 }, (_, i) => `${i + 1}`)
const defectRates = Array.from({ length: 30 }, () => +(Math.random() * 2.5 + 0.5).toFixed(1))

function initHourlyChart() {
  const chart = echarts.init(hourlyChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['Actual', 'Target'], textStyle: { color: '#8a9bb0' }, top: 0 },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category', data: hours,
      axisLine: { lineStyle: { color: '#2c3e50' } },
      axisLabel: { color: '#8a9bb0', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#1e2d3d' } },
      axisLabel: { color: '#8a9bb0' }
    },
    series: [
      {
        name: 'Actual', type: 'bar',
        data: hourlyData.map((v, i) => ({
          value: v,
          itemStyle: { color: v >= targetHourly[i] ? '#67c23a' : '#409eff' }
        })),
        barWidth: '50%'
      },
      {
        name: 'Target', type: 'line', data: targetHourly,
        smooth: true, lineStyle: { width: 2, color: '#e6a23c', type: 'dashed' },
        itemStyle: { color: '#e6a23c' }
      }
    ]
  })
  charts.push(chart)
}

function initDefectChart() {
  const chart = echarts.init(defectChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category', data: days30,
      axisLine: { lineStyle: { color: '#2c3e50' } },
      axisLabel: { color: '#8a9bb0', fontSize: 9, interval: 2 }
    },
    yAxis: {
      type: 'value', name: '%',
      max: 4,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#1e2d3d' } },
      axisLabel: { color: '#8a9bb0' }
    },
    visualMap: {
      show: false,
      pieces: [
        { lte: 1.0, color: '#67c23a' },
        { gt: 1.0, lte: 2.0, color: '#e6a23c' },
        { gt: 2.0, color: '#f56c6c' }
      ]
    },
    series: [{
      type: 'line', data: defectRates,
      smooth: true,
      lineStyle: { width: 2 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(103,194,58,0.15)' },
          { offset: 1, color: 'rgba(103,194,58,0)' }
        ])
      },
      markLine: {
        silent: true,
        lineStyle: { type: 'dashed', color: '#f56c6c' },
        data: [{ yAxis: 2.0, name: 'Alert Threshold', label: { formatter: 'Alert 2.0%', color: '#f56c6c' } }]
      }
    }]
  })
  charts.push(chart)
}

function initOEEChart() {
  const chart = echarts.init(oeeChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['Availability', 'Performance', 'Quality'],
      textStyle: { color: '#8a9bb0' }, top: 0
    },
    radar: {
      indicator: [
        { name: 'Availability', max: 100 },
        { name: 'Performance', max: 100 },
        { name: 'Quality', max: 100 },
        { name: 'OEE', max: 100 }
      ],
      axisName: { color: '#8a9bb0' },
      splitArea: { areaStyle: { color: ['rgba(64,158,255,0.02)', 'rgba(64,158,255,0.05)'] } },
      axisLine: { lineStyle: { color: '#2c3e50' } },
      splitLine: { lineStyle: { color: '#2c3e50' } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [94.2, 88.7, 98.8, 82.7],
          name: 'Current Period',
          areaStyle: { color: 'rgba(64,158,255,0.2)' },
          lineStyle: { color: '#409eff', width: 2 },
          itemStyle: { color: '#409eff' }
        },
        {
          value: [91.5, 85.3, 97.2, 76.1],
          name: 'Last Period',
          areaStyle: { color: 'rgba(103,194,58,0.08)' },
          lineStyle: { color: '#67c23a', width: 2, type: 'dashed' },
          itemStyle: { color: '#67c23a' }
        }
      ]
    }]
  })
  charts.push(chart)
}

onMounted(() => {
  setTimeout(() => {
    initHourlyChart()
    initDefectChart()
    initOEEChart()
  }, 100)

  window.addEventListener('resize', () => charts.forEach(c => c.resize()))
})

onUnmounted(() => charts.forEach(c => c.dispose()))
</script>

<style scoped>
.kpi-row .kpi-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 20px;
}
.kpi-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
.kpi-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
}

.chart-card { border-radius: 10px; }
.card-header span { font-weight: 500; color: var(--text-primary); font-size: 15px; }

.oee-good { color: #67c23a; font-weight: 600; }
.oee-bad { color: #f56c6c; font-weight: 600; }
</style>
