<template>
  <div class="equipment-page">
    <el-row :gutter="16" style="margin-bottom: 16px;">
      <el-col :span="6" v-for="(summary, i) in summaryCards" :key="i">
        <div class="eq-summary-card" :style="{ borderTopColor: summary.color }">
          <div class="eq-summary-icon">
            <el-icon :size="28"><component :is="summary.icon" /></el-icon>
          </div>
          <div class="eq-summary-info">
            <div class="eq-summary-value">{{ summary.value }}</div>
            <div class="eq-summary-label">{{ summary.label }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :span="14">
        <el-card class="chart-card">
          <template #header><div class="card-header"><span>Equipment Load & Temperature</span></div></template>
          <div ref="loadChartRef" style="height: 340px;"></div>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card class="chart-card">
          <template #header><div class="card-header"><span>Status Distribution</span></div></template>
          <div ref="statusChartRef" style="height: 340px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="table-card" style="margin-top: 16px;">
      <template #header>
        <div class="card-header"><span>Equipment List</span></div>
      </template>
      <el-table
        :data="equipmentList"
        stripe
        style="width: 100%"
        :header-cell-style="{ background: '#1a2634', color: '#8a9bb0' }"
      >
        <el-table-column prop="id" label="ID" width="100" />
        <el-table-column prop="name" label="Equipment Name" min-width="200" />
        <el-table-column prop="status" label="Status" width="120" align="center">
          <template #default="{ row }">
            <el-tag
              size="small"
              :type="statusTagType(row.status)"
              effect="dark"
              round
            >
              {{ formatStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="uptime" label="Uptime" width="90" align="center" />
        <el-table-column label="Temperature (°C)" width="130" align="center">
          <template #default="{ row }">
            <span :class="row.temperature > 50 ? 'temp-danger' : 'temp-normal'">{{ row.temperature }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="load" label="Load %" width="100" align="center">
          <template #default="{ row }">
            <el-progress
              v-if="row.status === 'running'"
              :percentage="row.load"
              :color="row.load > 85 ? '#f56c6c' : row.load > 60 ? '#e6a23c' : '#67c23a'"
              :stroke-width="8"
              :show-text="false"
              style="width: 70px;"
            />
            <span v-else style="color: var(--text-secondary);">--</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { equipmentList } from '../stores/data'

const loadChartRef = ref(null)
const statusChartRef = ref(null)
let charts = []

const statusCounts = {
  running: equipmentList.filter(e => e.status === 'running').length,
  idle: equipmentList.filter(e => e.status === 'idle').length,
  maintenance: equipmentList.filter(e => e.status === 'maintenance').length,
  error: equipmentList.filter(e => e.status === 'error').length
}

const summaryCards = [
  { label: 'Running', value: statusCounts.running, icon: 'VideoPlay', color: '#67c23a' },
  { label: 'Idle', value: statusCounts.idle, icon: 'VideoPause', color: '#909399' },
  { label: 'Maintenance', value: statusCounts.maintenance, icon: 'Setting', color: '#e6a23c' },
  { label: 'Error / Alert', value: statusCounts.error, icon: 'Warning', color: '#f56c6c' }
]

function statusTagType(s) {
  const map = { running: 'success', idle: 'info', maintenance: 'warning', error: 'danger' }
  return map[s] || 'info'
}

function formatStatus(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function initLoadChart() {
  const chart = echarts.init(loadChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: {
      data: ['Load %', 'Temperature °C'],
      textStyle: { color: '#8a9bb0' }, top: 0
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: equipmentList.map(e => e.id),
      axisLine: { lineStyle: { color: '#2c3e50' } },
      axisLabel: { color: '#8a9bb0', fontSize: 10, rotate: 30 }
    },
    yAxis: [
      {
        type: 'value',
        name: 'Load %',
        max: 100,
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#1e2d3d' } },
        axisLabel: { color: '#8a9bb0' }
      },
      {
        type: 'value',
        name: 'Temp °C',
        max: 80,
        axisLine: { show: false },
        splitLine: { show: false },
        axisLabel: { color: '#8a9bb0' }
      }
    ],
    series: [
      {
        name: 'Load %',
        type: 'bar',
        data: equipmentList.map(e => ({ value: e.load, itemStyle: { color: e.status === 'running' ? '#409eff' : '#2c3e50' } })),
        barWidth: '40%'
      },
      {
        name: 'Temperature °C',
        type: 'line',
        yAxisIndex: 1,
        data: equipmentList.map(e => e.temperature),
        smooth: true,
        lineStyle: { width: 2, color: '#f56c6c' },
        itemStyle: { color: '#f56c6c' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245,108,108,0.2)' },
            { offset: 1, color: 'rgba(245,108,108,0)' }
          ])
        }
      }
    ]
  })
  charts.push(chart)
}

function initStatusChart() {
  const chart = echarts.init(statusChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: { orient: 'horizontal', bottom: 5, textStyle: { color: '#8a9bb0' } },
    series: [{
      type: 'pie',
      radius: ['40%', '68%'],
      center: ['50%', '48%'],
      itemStyle: { borderColor: '#1e2d3d', borderWidth: 2 },
      label: { color: '#8a9bb0', fontSize: 13, fontWeight: 'bold' },
      data: [
        { value: statusCounts.running, name: 'Running', itemStyle: { color: '#67c23a' } },
        { value: statusCounts.idle, name: 'Idle', itemStyle: { color: '#909399' } },
        { value: statusCounts.maintenance, name: 'Maintenance', itemStyle: { color: '#e6a23c' } },
        { value: statusCounts.error, name: 'Error', itemStyle: { color: '#f56c6c' } }
      ]
    }]
  })
  charts.push(chart)
}

onMounted(() => {
  setTimeout(() => {
    initLoadChart()
    initStatusChart()
  }, 100)

  window.addEventListener('resize', () => charts.forEach(c => c.resize()))
})

onUnmounted(() => charts.forEach(c => c.dispose()))
</script>

<style scoped>
.eq-summary-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-top: 3px solid;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.eq-summary-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: rgba(255,255,255,0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  flex-shrink: 0;
}
.eq-summary-value { font-size: 26px; font-weight: 700; color: var(--text-primary); }
.eq-summary-label { font-size: 13px; color: var(--text-secondary); margin-top: 2px; }

.chart-card { border-radius: 10px; }
.card-header span { font-weight: 500; color: var(--text-primary); font-size: 15px; }

.temp-normal { color: var(--accent-green); font-weight: 600; }
.temp-danger { color: var(--accent-red); font-weight: 600; }

.table-card :deep(.el-card__body) { padding: 0; }
</style>
