<template>
  <div class="dashboard">
    <!-- Stats Row -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6" v-for="(stat, i) in stats" :key="i">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" :style="{ background: stat.gradient }">
            <el-icon :size="24"><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value stat-number">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
          <div class="stat-trend" :class="stat.trendUp ? 'up' : 'down'">
            <el-icon><component :is="stat.trendUp ? 'Top' : 'Bottom'" /></el-icon>
            {{ stat.change }}%
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Charts Row -->
    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header"><span>Production Trend (7 Days)</span></div>
          </template>
          <div ref="trendChartRef" style="height: 320px;"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header"><span>Quality Distribution</span></div>
          </template>
          <div ref="qualityChartRef" style="height: 320px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Bottom Row -->
    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="14">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header"><span>Department Output Comparison</span></div>
          </template>
          <div ref="deptChartRef" style="height: 280px;"></div>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card class="chart-card alert-card">
          <template #header>
            <div class="card-header"><span>Real-time Alerts</span></div>
          </template>
          <div class="alert-list">
            <div
              v-for="alert in alerts"
              :key="alert.id"
              class="alert-item"
              :class="'alert-' + alert.type"
            >
              <div class="alert-dot"></div>
              <div class="alert-content">
                <div class="alert-msg">{{ alert.message }}</div>
                <div class="alert-time">{{ alert.time }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { productionStats, productionTrend, qualityData, departmentOutput, alerts } from '../stores/data'

const trendChartRef = ref(null)
const qualityChartRef = ref(null)
const deptChartRef = ref(null)
let charts = []

const stats = [
  { label: "Today's Output", value: productionStats.totalOutput.toLocaleString(), icon: 'Box', gradient: 'linear-gradient(135deg,#409eff,#337ecc)', change: 5.2, trendUp: true },
  { label: 'Completion Rate', value: productionStats.completionRate + '%', icon: 'CircleCheck', gradient: 'linear-gradient(135deg,#67c23a,#529b2e)', change: 2.1, trendUp: true },
  { label: 'Active Equipment', value: `${productionStats.activeEquipment}/${productionStats.totalEquipment}`, icon: 'Cpu', gradient: 'linear-gradient(135deg,#e6a23c,#b88230)', change: 0, trendUp: false },
  { label: 'Tasks Completed', value: productionStats.completedTasksToday, icon: 'List', gradient: 'linear-gradient(135deg,#f56c6c,#c45656)', change: 12.3, trendUp: true }
]

function initTrendChart() {
  const chart = echarts.init(trendChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['Actual', 'Target'], textStyle: { color: '#8a9bb0' }, top: 0 },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: productionTrend.dates,
      axisLine: { lineStyle: { color: '#2c3e50' } },
      axisLabel: { color: '#8a9bb0' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#1e2d3d' } },
      axisLabel: { color: '#8a9bb0' }
    },
    series: [
      {
        name: 'Actual',
        type: 'line',
        data: productionTrend.actual,
        smooth: true,
        lineStyle: { width: 3, color: '#409eff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64,158,255,0.25)' },
            { offset: 1, color: 'rgba(64,158,255,0)' }
          ])
        },
        itemStyle: { color: '#409eff' }
      },
      {
        name: 'Target',
        type: 'line',
        data: productionTrend.target,
        smooth: true,
        lineStyle: { width: 2, color: '#67c23a', type: 'dashed' },
        itemStyle: { color: '#67c23a' }
      }
    ]
  })
  charts.push(chart)
}

function initQualityChart() {
  const chart = echarts.init(qualityChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'horizontal', bottom: 0, textStyle: { color: '#8a9bb0' } },
    series: [{
      type: 'pie',
      radius: ['42%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      itemStyle: { borderColor: '#1e2d3d', borderWidth: 2 },
      label: { color: '#8a9bb0', fontSize: 12 },
      data: qualityData.categories.map((name, i) => ({
        value: qualityData.values[i],
        name,
        itemStyle: {
          color: ['#67c23a', '#409eff', '#e6a23c', '#f56c6c'][i]
        }
      })),
      emphasis: {
        itemStyle: { shadowBlur: 20, shadowColor: 'rgba(0,0,0,0.4)' }
      }
    }]
  })
  charts.push(chart)
}

function initDeptChart() {
  const chart = echarts.init(deptChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['This Month', 'Last Month'], textStyle: { color: '#8a9bb0' }, top: 0 },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '18%', containLabel: true },
    xAxis: {
      type: 'category',
      data: departmentOutput.departments,
      axisLine: { lineStyle: { color: '#2c3e50' } },
      axisLabel: { color: '#8a9bb0', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#1e2d3d' } },
      axisLabel: { color: '#8a9bb0' }
    },
    series: [
      {
        name: 'This Month',
        type: 'bar',
        data: departmentOutput.currentMonth,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#409eff' }, { offset: 1, color: '#337ecc' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '35%'
      },
      {
        name: 'Last Month',
        type: 'bar',
        data: departmentOutput.lastMonth,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#2c3e50' }, { offset: 1, color: '#1e2d3d' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '35%'
      }
    ]
  })
  charts.push(chart)
}

onMounted(() => {
  setTimeout(() => {
    initTrendChart()
    initQualityChart()
    initDeptChart()
  }, 100)

  window.addEventListener('resize', () => {
    charts.forEach(c => c.resize())
  })
})

onUnmounted(() => {
  charts.forEach(c => c.dispose())
})
</script>

<style scoped>
.stats-row .stat-card {
  padding: 4px 16px;
}
.stat-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 16px;
}
.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}
.stat-info { flex: 1; }
.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}
.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
}
.stat-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}
.stat-trend.up { color: var(--accent-green); }
.stat-trend.down { color: var(--accent-red); }

.chart-card {
  border-radius: 10px;
}
.card-header span {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 15px;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.alert-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 10px 12px;
  background: rgba(255,255,255,0.02);
  border-radius: 8px;
  border-left: 3px solid transparent;
}
.alert-error { border-left-color: #f56c6c; }
.alert-warning { border-left-color: #e6a23c; }
.alert-info { border-left-color: #409eff; }
.alert-success { border-left-color: #67c23a; }

.alert-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 5px;
}
.alert-error .alert-dot { background: #f56c6c; box-shadow: 0 0 8px #f56c6c66; }
.alert-warning .alert-dot { background: #e6a23c; box-shadow: 0 0 8px #e6a23c66; }
.alert-info .alert-dot { background: #409eff; box-shadow: 0 0 8px #409eff66; }
.alert-success .alert-dot { background: #67c23a; box-shadow: 0 0 8px #67c23a66; }

.alert-content { flex: 1; }
.alert-msg {
  color: var(--text-primary);
  font-size: 13px;
  line-height: 1.5;
}
.alert-time {
  color: var(--text-secondary);
  font-size: 11px;
  margin-top: 4px;
}
</style>
