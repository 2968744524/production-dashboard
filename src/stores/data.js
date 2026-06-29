/**
 * MES Pro · Unified Data Layer
 * -----------------------------------------------------------
 * 所有页面共享的真实业务数据 + 工具函数 + actions。
 * 数据规范（海外制造业通用）：
 *   - 工单号：WO-2026-XXXX
 *   - SKU：XXX-XXXX-XX（品名-规格-版本）
 *   - 批次号：LOT-YYYYMMDD-NNN
 *   - 序列号：SN-XXXXXXXX
 *   - OEE：78~82%（行业良好水平）
 *   - 良率：96~98.5%
 *   - CPK：≥1.33 合格，1.0~1.33 需关注，<1.0 不合格
 *   - 班次：3班倒（Day 06:00-14:00 / Swing 14:00-22:00 / Night 22:00-06:00）
 * 头像来源：randomuser.me（免版权真实人脸）
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/* ============================================================
 * 1. 员工数据（含 randomuser.me 真实头像）
 * ============================================================ */
const employees = [
  { id: 'EMP-1001', name: 'Sarah Mitchell',     role: 'Shift Supervisor',  shift: 'Day',    dept: 'Production',    skills: ['Leadership', 'Quality', 'Safety'],     oee: 86.2, yield: 98.4, avatar: 'https://randomuser.me/api/portraits/women/44.jpg',  phone: '+1-313-555-0142' },
  { id: 'EMP-1002', name: 'David Chen',         role: 'CNC Operator',      shift: 'Day',    dept: 'Machining',     skills: ['CNC', 'CAM', '5S'],                    oee: 82.7, yield: 97.9, avatar: 'https://randomuser.me/api/portraits/men/32.jpg',    phone: '+1-313-555-0188' },
  { id: 'EMP-1003', name: 'Maria Rodriguez',    role: 'Quality Engineer',  shift: 'Day',    dept: 'Quality',       skills: ['SPC', 'GD&T', 'ISO 9001'],             oee: 88.1, yield: 99.1, avatar: 'https://randomuser.me/api/portraits/women/68.jpg',  phone: '+1-313-555-0117' },
  { id: 'EMP-1004', name: 'James Wilson',       role: 'Maintenance Tech',  shift: 'Day',    dept: 'Maintenance',   skills: ['Mechanical', 'Electrical', 'PLC'],     oee: 79.3, yield: 96.5, avatar: 'https://randomuser.me/api/portraits/men/75.jpg',    phone: '+1-313-555-0193' },
  { id: 'EMP-1005', name: 'Emily Johnson',      role: 'Assembly Operator', shift: 'Day',    dept: 'Assembly',      skills: ['Soldering', 'Inspection', 'Lean'],     oee: 84.6, yield: 98.2, avatar: 'https://randomuser.me/api/portraits/women/52.jpg',  phone: '+1-313-555-0156' },
  { id: 'EMP-1006', name: 'Michael Brown',      role: 'Production Lead',   shift: 'Swing',  dept: 'Production',    skills: ['Scheduling', 'ERP', 'Six Sigma'],      oee: 85.9, yield: 98.0, avatar: 'https://randomuser.me/api/portraits/men/45.jpg',    phone: '+1-313-555-0124' },
  { id: 'EMP-1007', name: 'Jessica Taylor',     role: 'CNC Operator',      shift: 'Swing',  dept: 'Machining',     skills: ['CNC', 'Fixture', 'Measuring'],         oee: 81.4, yield: 97.2, avatar: 'https://randomuser.me/api/portraits/women/26.jpg',  phone: '+1-313-555-0171' },
  { id: 'EMP-1008', name: 'Robert Anderson',    role: 'Quality Inspector', shift: 'Swing',  dept: 'Quality',       skills: ['CMM', 'SPC', 'Calibration'],           oee: 87.5, yield: 99.3, avatar: 'https://randomuser.me/api/portraits/men/22.jpg',    phone: '+1-313-555-0109' },
  { id: 'EMP-1009', name: 'Linda Martinez',     role: 'Packaging Lead',    shift: 'Swing',  dept: 'Packaging',     skills: ['Automation', 'Forklift', 'Inventory'], oee: 83.2, yield: 97.6, avatar: 'https://randomuser.me/api/portraits/women/85.jpg',  phone: '+1-313-555-0163' },
  { id: 'EMP-1010', name: 'Thomas Lee',         role: 'Maintenance Tech',  shift: 'Swing',  dept: 'Maintenance',   skills: ['Hydraulics', 'Welding', 'PLC'],         oee: 80.1, yield: 96.8, avatar: 'https://randomuser.me/api/portraits/men/64.jpg',    phone: '+1-313-555-0137' },
  { id: 'EMP-1011', name: 'Patricia White',     role: 'Night Supervisor',  shift: 'Night',  dept: 'Production',    skills: ['Leadership', 'Quality', 'Cross-training'], oee: 84.3, yield: 97.8, avatar: 'https://randomuser.me/api/portraits/women/63.jpg',  phone: '+1-313-555-0148' },
  { id: 'EMP-1012', name: 'Kevin Garcia',       role: 'CNC Operator',      shift: 'Night',  dept: 'Machining',     skills: ['CNC', 'Multi-axis', 'Tooling'],        oee: 82.9, yield: 97.4, avatar: 'https://randomuser.me/api/portraits/men/91.jpg',    phone: '+1-313-555-0115' },
]

/* ============================================================
 * 2. 产品 SKU 主数据
 * ============================================================ */
const products = [
  { sku: 'ALH-1042-A3', name: 'Aluminum Housing',      spec: '104×82×45mm · 6061-T6',          unit: 'pc',  price: 28.50,  abc: 'A' },
  { sku: 'STS-2208-B1', name: 'Stainless Bracket',     spec: '220×80×12mm · SUS304',           unit: 'pc',  price: 15.20,  abc: 'A' },
  { sku: 'CST-0512-C2', name: 'Cast Steel Flange',     spec: 'DN50 · ANSI 150#, cast steel',   unit: 'pc',  price: 42.80,  abc: 'A' },
  { sku: 'PCH-3001-D1', name: 'Precision Shaft',       spec: 'φ30×120mm · 4140 HT',            unit: 'pc',  price: 36.00,  abc: 'B' },
  { sku: 'GBR-0820-E2', name: 'Gear Box Cover',        spec: 'φ82×20mm · aluminum die-cast',   unit: 'pc',  price: 19.50,  abc: 'B' },
  { sku: 'VHV-1105-F1', name: 'Valve Housing',         spec: 'NPT 1", brass forging',          unit: 'pc',  price: 54.00,  abc: 'A' },
  { sku: 'MNT-0406-G3', name: 'Mounting Plate',        spec: '40×60×6mm · Q235',               unit: 'pc',  price:  8.20,  abc: 'C' },
  { sku: 'HET-2040-H2', name: 'Heat Exchanger Tube',   spec: 'φ20×400mm · copper C12200',      unit: 'pc',  price: 22.30,  abc: 'B' },
]

/* ============================================================
 * 3. 工单 Work Orders
 * 状态：Created → Released → In Progress → Completed → Closed
 * timeline: 操作记录数组（用于详情抽屉展示）
 * ============================================================ */
function makeTimeline(wo) {
  const tl = []
  tl.push({ at: `${wo.startDate} 06:00`, action: 'Work order created', by: 'EMP-1006', note: `Planned qty: ${wo.qty} pcs on ${wo.line}` })
  if (['Released', 'In Progress', 'Completed', 'Closed'].includes(wo.status)) {
    tl.push({ at: `${wo.startDate} 08:15`, action: 'Released to production', by: 'EMP-1006', note: 'Materials allocated, BOM verified' })
  }
  if (['In Progress', 'Completed', 'Closed'].includes(wo.status)) {
    tl.push({ at: `${wo.startDate} 14:00`, action: 'Production started', by: wo.lead, note: 'First article inspection passed' })
  }
  if (['Completed', 'Closed'].includes(wo.status)) {
    tl.push({ at: `${wo.dueDate} 18:30`, action: 'Production completed', by: wo.lead, note: `${wo.completed}/${wo.qty} pcs produced` })
  }
  if (wo.status === 'Closed') {
    tl.push({ at: `${wo.dueDate} 20:00`, action: 'Work order closed', by: 'EMP-1003', note: 'Final QA passed, goods moved to finished warehouse' })
  }
  return tl
}

const workOrders = [
  { id: 'WO-2026-1042', product: 'ALH-1042-A3', qty: 500,  completed: 487, scrapped: 8, status: 'In Progress', priority: 'High',   line: 'Line A', startDate: '2026-06-23', dueDate: '2026-07-02', lead: 'EMP-1002', progress: 97.4, ganttStart: 0,  ganttDuration: 9,  timeline: [] },
  { id: 'WO-2026-1043', product: 'STS-2208-B1', qty: 1200, completed: 1200, scrapped: 12, status: 'Completed',  priority: 'Medium', line: 'Line B', startDate: '2026-06-18', dueDate: '2026-06-27', lead: 'EMP-1007', progress: 100,  ganttStart: -5, ganttDuration: 9,  timeline: [] },
  { id: 'WO-2026-1044', product: 'CST-0512-C2', qty: 300,  completed: 0,    scrapped: 0,  status: 'Released',   priority: 'High',   line: 'Line A', startDate: '2026-07-01', dueDate: '2026-07-10', lead: 'EMP-1012', progress: 0,    ganttStart: 2,  ganttDuration: 9,  timeline: [] },
  { id: 'WO-2026-1045', product: 'PCH-3001-D1', qty: 800,  completed: 312,  scrapped: 5,  status: 'In Progress', priority: 'Medium', line: 'Line C', startDate: '2026-06-25', dueDate: '2026-07-05', lead: 'EMP-1005', progress: 39,   ganttStart: 2,  ganttDuration: 10, timeline: [] },
  { id: 'WO-2026-1046', product: 'GBR-0820-E2', qty: 2000, completed: 1450, scrapped: 18, status: 'In Progress', priority: 'Low',    line: 'Line B', startDate: '2026-06-22', dueDate: '2026-07-03', lead: 'EMP-1009', progress: 72.5, ganttStart: -1, ganttDuration: 11, timeline: [] },
  { id: 'WO-2026-1047', product: 'VHV-1105-F1', qty: 250,  completed: 0,    scrapped: 0,  status: 'Created',    priority: 'High',   line: 'Line A', startDate: '2026-07-05', dueDate: '2026-07-12', lead: 'EMP-1006', progress: 0,    ganttStart: 6,  ganttDuration: 7,  timeline: [] },
  { id: 'WO-2026-1048', product: 'HET-2040-H2', qty: 600,  completed: 600,  scrapped: 6,  status: 'Closed',     priority: 'Medium', line: 'Line C', startDate: '2026-06-15', dueDate: '2026-06-24', lead: 'EMP-1002', progress: 100,  ganttStart: -8, ganttDuration: 9,  timeline: [] },
  { id: 'WO-2026-1049', product: 'MNT-0406-G3', qty: 3000, completed: 1850, scrapped: 24, status: 'In Progress', priority: 'Low',    line: 'Line D', startDate: '2026-06-24', dueDate: '2026-07-08', lead: 'EMP-1011', progress: 61.7, ganttStart: 1,  ganttDuration: 14, timeline: [] },
  { id: 'WO-2026-1050', product: 'ALH-1042-A3', qty: 400,  completed: 0,    scrapped: 0,  status: 'Released',   priority: 'Medium', line: 'Line A', startDate: '2026-07-03', dueDate: '2026-07-10', lead: 'EMP-1002', progress: 0,    ganttStart: 4,  ganttDuration: 7,  timeline: [] },
  { id: 'WO-2026-1051', product: 'STS-2208-B1', qty: 800,  completed: 0,    scrapped: 0,  status: 'Created',    priority: 'Medium', line: 'Line B', startDate: '2026-07-08', dueDate: '2026-07-18', lead: 'EMP-1007', progress: 0,    ganttStart: 9,  ganttDuration: 10, timeline: [] },
]
// 给每个工单初始化 timeline
workOrders.forEach(wo => { wo.timeline = makeTimeline(wo) })

/* ============================================================
 * 4. 设备 Equipment（增强：OEE 三维度拆解 + 维护）
 * ============================================================ */
const equipment = [
  { id: 'EQ-CNC-A01', name: 'CNC Machining Center A-01', type: 'CNC',        status: 'running', availability: 94.2, performance: 89.5, quality: 98.1, oee: 82.7, temp: 42, load: 78,  nextPm: '2026-07-15', health: 88, runHours: 4258 },
  { id: 'EQ-CNC-A02', name: 'CNC Turning Center A-02',   type: 'CNC',        status: 'running', availability: 92.8, performance: 87.3, quality: 97.5, oee: 79.0, temp: 45, load: 82,  nextPm: '2026-07-20', health: 85, runHours: 5102 },
  { id: 'EQ-ASM-B01', name: 'Assembly Line B-01',        type: 'Assembly',   status: 'idle',    availability: 90.1, performance: 85.6, quality: 96.8, oee: 74.6, temp: 25, load: 0,   nextPm: '2026-07-10', health: 82, runHours: 6840 },
  { id: 'EQ-ASM-B02', name: 'Assembly Line B-02',        type: 'Assembly',   status: 'running', availability: 95.3, performance: 91.2, quality: 99.1, oee: 86.1, temp: 38, load: 65,  nextPm: '2026-08-01', health: 91, runHours: 3210 },
  { id: 'EQ-PKG-C01', name: 'Packaging Unit C-01',       type: 'Packaging',  status: 'offline', availability: 84.5, performance: 80.2, quality: 94.3, oee: 63.9, temp: 28, load: 0,   nextPm: '2026-07-01', health: 68, runHours: 8950 },
  { id: 'EQ-QSC-D01', name: 'Quality Scanner D-01',      type: 'Inspection', status: 'running', availability: 96.1, performance: 92.4, quality: 99.4, oee: 88.3, temp: 35, load: 91,  nextPm: '2026-07-25', health: 93, runHours: 2105 },
  { id: 'EQ-RBT-E01', name: 'Robotic Arm E-01',          type: 'Robot',      status: 'error',   availability: 78.3, performance: 72.1, quality: 88.5, oee: 50.0, temp: 55, load: 0,   nextPm: '2026-06-30', health: 45, runHours: 7650 },
  { id: 'EQ-CNV-F01', name: 'Conveyor System F-01',      type: 'Conveyor',   status: 'running', availability: 97.2, performance: 93.8, quality: 98.7, oee: 89.9, temp: 30, load: 54,  nextPm: '2026-08-05', health: 95, runHours: 12340 },
]

const maintenanceLog = [
  { id: 'PM-2026-018', equipment: 'EQ-PKG-C01', type: 'Preventive', priority: 'High',   title: 'Belt replacement & lubrication',     scheduled: '2026-07-01', status: 'Scheduled', tech: 'EMP-1004', estHours: 4 },
  { id: 'PM-2026-019', equipment: 'EQ-RBT-E01', type: 'Corrective', priority: 'Critical', title: 'Servo motor overheating - replace',  scheduled: '2026-06-30', status: 'In Progress', tech: 'EMP-1010', estHours: 6 },
  { id: 'PM-2026-020', equipment: 'EQ-CNC-A01', type: 'Preventive', priority: 'Medium', title: 'Spindle inspection & calibration',    scheduled: '2026-07-15', status: 'Scheduled', tech: 'EMP-1004', estHours: 3 },
  { id: 'PM-2026-021', equipment: 'EQ-ASM-B01', type: 'Preventive', priority: 'Medium', title: 'Pneumatic system check',              scheduled: '2026-07-10', status: 'Scheduled', tech: 'EMP-1010', estHours: 2 },
  { id: 'PM-2026-022', equipment: 'EQ-QSC-D01', type: 'Preventive', priority: 'Low',    title: 'Lens cleaning & calibration',         scheduled: '2026-07-25', status: 'Scheduled', tech: 'EMP-1004', estHours: 1.5 },
]

const downtimeReasons = [
  { reason: 'Tool change / setup', minutes: 184, percent: 32.1 },
  { reason: 'Equipment failure',   minutes: 132, percent: 23.0 },
  { reason: 'Material shortage',   minutes: 98,  percent: 17.1 },
  { reason: 'Quality hold',         minutes: 76,  percent: 13.3 },
  { reason: 'Operator break',       minutes: 52,  percent: 9.1  },
  { reason: 'Other',                minutes: 30,  percent: 5.4  },
]

/* ============================================================
 * 5. 质量检验 + SPC 数据
 * ============================================================ */
const inspectionBatches = [
  { id: 'LOT-20260628-014', wo: 'WO-2026-1042', product: 'ALH-1042-A3', qty: 120,  sample: 13, passed: 119, failed: 1,  result: 'Accept',     inspector: 'EMP-1003', time: '2026-06-28 14:32' },
  { id: 'LOT-20260628-015', wo: 'WO-2026-1046', product: 'GBR-0820-E2', qty: 200,  sample: 21, passed: 198, failed: 2,  result: 'Accept',     inspector: 'EMP-1008', time: '2026-06-28 16:08' },
  { id: 'LOT-20260629-001', wo: 'WO-2026-1045', product: 'PCH-3001-D1', qty: 80,   sample: 8,  passed: 75,  failed: 3,  result: 'Concession', inspector: 'EMP-1003', time: '2026-06-29 08:15' },
  { id: 'LOT-20260629-002', wo: 'WO-2026-1049', product: 'MNT-0406-G3', qty: 300,  sample: 32, passed: 300, failed: 0,  result: 'Accept',     inspector: 'EMP-1008', time: '2026-06-29 09:42' },
  { id: 'LOT-20260629-003', wo: 'WO-2026-1042', product: 'ALH-1042-A3', qty: 100,  sample: 11, passed: 96,  failed: 4,  result: 'Reject',     inspector: 'EMP-1003', time: '2026-06-29 10:55' },
  { id: 'LOT-20260629-004', wo: 'WO-2026-1046', product: 'GBR-0820-E2', qty: 150,  sample: 16, passed: 149, failed: 1,  result: 'Accept',     inspector: 'EMP-1008', time: '2026-06-29 13:20' },
  { id: 'LOT-20260629-005', wo: 'WO-2026-1049', product: 'MNT-0406-G3', qty: 250,  sample: 26, passed: 248, failed: 2,  result: 'Accept',     inspector: 'EMP-1003', time: '2026-06-29 14:48' },
  { id: 'LOT-20260629-006', wo: 'WO-2026-1045', product: 'PCH-3001-D1', qty: 90,   sample: 9,  passed: 84,  failed: 1,  result: 'Concession', inspector: 'EMP-1008', time: '2026-06-29 15:35' },
]

const spcData = {
  characteristic: 'Shaft diameter (φ30mm)',
  nominal: 30.000,
  tolerance: 0.050,
  usl: 30.050,
  lsl: 29.950,
  subgroups: [
    { id: 1,  mean: 30.012, range: 0.018 },
    { id: 2,  mean: 30.015, range: 0.022 },
    { id: 3,  mean: 30.008, range: 0.015 },
    { id: 4,  mean: 30.019, range: 0.024 },
    { id: 5,  mean: 30.011, range: 0.017 },
    { id: 6,  mean: 30.022, range: 0.028 },
    { id: 7,  mean: 30.014, range: 0.020 },
    { id: 8,  mean: 30.009, range: 0.013 },
    { id: 9,  mean: 30.018, range: 0.025 },
    { id: 10, mean: 30.025, range: 0.030 },
    { id: 11, mean: 30.016, range: 0.021 },
    { id: 12, mean: 30.013, range: 0.019 },
    { id: 13, mean: 30.041, range: 0.035 },
    { id: 14, mean: 30.020, range: 0.023 },
    { id: 15, mean: 30.011, range: 0.016 },
    { id: 16, mean: 30.008, range: 0.014 },
    { id: 17, mean: 30.014, range: 0.020 },
    { id: 18, mean: 30.017, range: 0.022 },
    { id: 19, mean: 30.010, range: 0.015 },
    { id: 20, mean: 30.013, range: 0.018 },
    { id: 21, mean: 30.015, range: 0.020 },
    { id: 22, mean: 30.009, range: 0.014 },
    { id: 23, mean: 30.012, range: 0.017 },
    { id: 24, mean: 30.016, range: 0.021 },
    { id: 25, mean: 30.014, range: 0.019 },
  ],
  cl: 30.014,
  ucl: 30.038,
  lcl: 29.990,
  cpk: 1.42,
  ppk: 1.36,
  sigma: 0.0095,
}

const defectsPareto = [
  { defect: 'Dimensional out of tolerance', count: 47, cumulative: 47 },
  { defect: 'Surface finish',               count: 28, cumulative: 75 },
  { defect: 'Burrs / sharp edges',          count: 18, cumulative: 93 },
  { defect: 'Missing feature',              count: 12, cumulative: 105 },
  { defect: 'Material defect',              count: 8,  cumulative: 113 },
  { defect: 'Other',                        count: 5,  cumulative: 118 },
]

/* ============================================================
 * 6. 产品追溯 Traceability —— 5 条批次链
 * 每条链独立：不同产品、不同供应商、不同客户
 * ============================================================ */
const traceabilityRecords = [
  {
    root: { id: 'LOT-20260628-014', type: 'Finished Goods', product: 'ALH-1042-A3', qty: 120, wo: 'WO-2026-1042', date: '2026-06-28', inspector: 'EMP-1003', result: 'Accept' },
    children: [{
      id: 'WO-2026-1042', type: 'Work Order', label: 'ALH-1042-A3 · 500 pcs',
      operations: [
        { op: 'Op-10 CNC Roughing', machine: 'EQ-CNC-A01', operator: 'EMP-1002', start: '06-23 06:00', end: '06-23 14:00', result: 'Pass' },
        { op: 'Op-20 CNC Finishing', machine: 'EQ-CNC-A02', operator: 'EMP-1002', start: '06-23 14:30', end: '06-23 22:00', result: 'Pass' },
        { op: 'Op-30 Deburring',     machine: 'EQ-ASM-B02', operator: 'EMP-1005', start: '06-24 08:00', end: '06-24 12:00', result: 'Pass' },
        { op: 'Op-40 Inspection',    machine: 'EQ-QSC-D01', operator: 'EMP-1003', start: '06-24 13:00', end: '06-24 16:00', result: 'Pass' },
        { op: 'Op-50 Packaging',     machine: 'EQ-PKG-C01', operator: 'EMP-1009', start: '06-24 16:30', end: '06-24 18:00', result: 'Pass' },
      ],
    }],
    upstream: [
      { id: 'RM-AL-2026-088', type: 'Raw Material', name: 'Aluminum bar 6061-T6 φ35mm', supplier: 'Alcoa Corp', lot: 'RM-AL-2026-088', received: '2026-06-20', qty: '500 kg', cert: 'Mill cert #MC-2026-4471' },
      { id: 'RM-CT-2026-031', type: 'Coolant',       name: 'Semi-synthetic coolant 5%', supplier: 'Master Fluids', lot: 'RM-CT-2026-031', received: '2026-06-15', qty: '200 L', cert: 'MSDS-CF-1132' },
    ],
    downstream: [
      { id: 'SO-2026-0842', type: 'Customer Order', customer: 'Detroit Auto Parts Inc.', qty: 100, shipDate: '2026-06-30', tracking: '1Z-999-AA1-2026-558', address: 'Detroit, MI' },
      { id: 'SO-2026-0843', type: 'Customer Order', customer: 'Midwest Precision LLC',   qty: 20,  shipDate: '2026-07-02', tracking: '1Z-999-AA1-2026-561', address: 'Chicago, IL' },
    ],
  },
  {
    root: { id: 'LOT-20260628-015', type: 'Finished Goods', product: 'GBR-0820-E2', qty: 200, wo: 'WO-2026-1046', date: '2026-06-28', inspector: 'EMP-1008', result: 'Accept' },
    children: [{
      id: 'WO-2026-1046', type: 'Work Order', label: 'GBR-0820-E2 · 2000 pcs',
      operations: [
        { op: 'Op-10 Die Casting',  machine: 'EQ-ASM-B01', operator: 'EMP-1009', start: '06-22 06:00', end: '06-22 18:00', result: 'Pass' },
        { op: 'Op-20 Trimming',     machine: 'EQ-ASM-B02', operator: 'EMP-1009', start: '06-23 08:00', end: '06-23 14:00', result: 'Pass' },
        { op: 'Op-30 Inspection',   machine: 'EQ-QSC-D01', operator: 'EMP-1008', start: '06-23 15:00', end: '06-23 17:00', result: 'Pass' },
        { op: 'Op-40 Packaging',    machine: 'EQ-PKG-C01', operator: 'EMP-1009', start: '06-24 09:00', end: '06-24 11:00', result: 'Pass' },
      ],
    }],
    upstream: [
      { id: 'RM-AL-2026-091', type: 'Raw Material', name: 'Aluminum ingot A380', supplier: 'Norsk Hydro', lot: 'RM-AL-2026-091', received: '2026-06-18', qty: '1200 kg', cert: 'Mill cert #MC-2026-4502' },
    ],
    downstream: [
      { id: 'SO-2026-0850', type: 'Customer Order', customer: 'Ohio Gear Works', qty: 180, shipDate: '2026-07-01', tracking: '1Z-999-AA1-2026-570', address: 'Cleveland, OH' },
      { id: 'SO-2026-0851', type: 'Customer Order', customer: 'Penn Tool Co.',   qty: 20,  shipDate: '2026-07-03', tracking: '1Z-999-AA1-2026-571', address: 'Pittsburgh, PA' },
    ],
  },
  {
    root: { id: 'LOT-20260629-001', type: 'Finished Goods', product: 'PCH-3001-D1', qty: 80, wo: 'WO-2026-1045', date: '2026-06-29', inspector: 'EMP-1003', result: 'Concession' },
    children: [{
      id: 'WO-2026-1045', type: 'Work Order', label: 'PCH-3001-D1 · 800 pcs',
      operations: [
        { op: 'Op-10 Turning',       machine: 'EQ-CNC-A01', operator: 'EMP-1005', start: '06-25 06:00', end: '06-25 16:00', result: 'Pass' },
        { op: 'Op-20 Heat Treatment',machine: 'EQ-ASM-B02', operator: 'EMP-1005', start: '06-26 08:00', end: '06-26 12:00', result: 'Pass' },
        { op: 'Op-30 Grinding',      machine: 'EQ-CNC-A02', operator: 'EMP-1005', start: '06-27 08:00', end: '06-27 15:00', result: 'Pass' },
        { op: 'Op-40 Inspection',    machine: 'EQ-QSC-D01', operator: 'EMP-1003', start: '06-28 09:00', end: '06-28 11:00', result: 'Hold' },
      ],
    }],
    upstream: [
      { id: 'RM-ST-2026-042', type: 'Raw Material', name: '4140 steel bar φ32mm', supplier: 'Timken Steel', lot: 'RM-ST-2026-042', received: '2026-06-22', qty: '600 kg', cert: 'Mill cert #MC-2026-4515' },
    ],
    downstream: [
      { id: 'SO-2026-0860', type: 'Customer Order', customer: 'Detroit Auto Parts Inc.', qty: 60, shipDate: '2026-07-04', tracking: '1Z-999-AA1-2026-580', address: 'Detroit, MI' },
    ],
  },
  {
    root: { id: 'LOT-20260629-002', type: 'Finished Goods', product: 'MNT-0406-G3', qty: 300, wo: 'WO-2026-1049', date: '2026-06-29', inspector: 'EMP-1008', result: 'Accept' },
    children: [{
      id: 'WO-2026-1049', type: 'Work Order', label: 'MNT-0406-G3 · 3000 pcs',
      operations: [
        { op: 'Op-10 Stamping',     machine: 'EQ-ASM-B01', operator: 'EMP-1011', start: '06-24 22:00', end: '06-25 06:00', result: 'Pass' },
        { op: 'Op-20 Deburring',    machine: 'EQ-ASM-B02', operator: 'EMP-1011', start: '06-25 08:00', end: '06-25 14:00', result: 'Pass' },
        { op: 'Op-30 Plating',      machine: 'EQ-ASM-B02', operator: 'EMP-1011', start: '06-26 08:00', end: '06-26 16:00', result: 'Pass' },
        { op: 'Op-40 Inspection',   machine: 'EQ-QSC-D01', operator: 'EMP-1008', start: '06-27 09:00', end: '06-27 12:00', result: 'Pass' },
        { op: 'Op-50 Packaging',    machine: 'EQ-PKG-C01', operator: 'EMP-1009', start: '06-27 14:00', end: '06-27 17:00', result: 'Pass' },
      ],
    }],
    upstream: [
      { id: 'RM-ST-2026-048', type: 'Raw Material', name: 'Q235 steel sheet 6mm', supplier: 'Nucor Corp', lot: 'RM-ST-2026-048', received: '2026-06-20', qty: '2000 kg', cert: 'Mill cert #MC-2026-4520' },
    ],
    downstream: [
      { id: 'SO-2026-0870', type: 'Customer Order', customer: 'Midwest Precision LLC', qty: 200, shipDate: '2026-07-02', tracking: '1Z-999-AA1-2026-590', address: 'Chicago, IL' },
      { id: 'SO-2026-0871', type: 'Customer Order', customer: 'Ohio Gear Works',       qty: 100, shipDate: '2026-07-05', tracking: '1Z-999-AA1-2026-591', address: 'Cleveland, OH' },
    ],
  },
  {
    root: { id: 'LOT-20260629-006', type: 'Finished Goods', product: 'PCH-3001-D1', qty: 90, wo: 'WO-2026-1045', date: '2026-06-29', inspector: 'EMP-1008', result: 'Concession' },
    children: [{
      id: 'WO-2026-1045', type: 'Work Order', label: 'PCH-3001-D1 · 800 pcs',
      operations: [
        { op: 'Op-10 Turning',        machine: 'EQ-CNC-A01', operator: 'EMP-1005', start: '06-28 22:00', end: '06-29 06:00', result: 'Pass' },
        { op: 'Op-20 Heat Treatment', machine: 'EQ-ASM-B02', operator: 'EMP-1005', start: '06-29 08:00', end: '06-29 12:00', result: 'Pass' },
        { op: 'Op-30 Grinding',       machine: 'EQ-CNC-A02', operator: 'EMP-1005', start: '06-29 13:00', end: '06-29 15:00', result: 'Hold' },
      ],
    }],
    upstream: [
      { id: 'RM-ST-2026-042', type: 'Raw Material', name: '4140 steel bar φ32mm', supplier: 'Timken Steel', lot: 'RM-ST-2026-042', received: '2026-06-22', qty: '600 kg', cert: 'Mill cert #MC-2026-4515' },
    ],
    downstream: [
      { id: 'SO-2026-0862', type: 'Customer Order', customer: 'Penn Tool Co.', qty: 90, shipDate: '2026-07-06', tracking: '1Z-999-AA1-2026-595', address: 'Pittsburgh, PA' },
    ],
  },
]

/* ============================================================
 * 7. 库存 Inventory
 * ============================================================ */
const inventory = [
  { sku: 'ALH-1042-A3', name: 'Aluminum Housing',      onHand: 1240, safety: 500,  max: 3000, unit: 'pc', abc: 'A', leadTime: 7,  lastIn: '2026-06-28', lastOut: '2026-06-29' },
  { sku: 'STS-2208-B1', name: 'Stainless Bracket',     onHand: 320,  safety: 800,  max: 2500, unit: 'pc', abc: 'A', leadTime: 10, lastIn: '2026-06-25', lastOut: '2026-06-29' },
  { sku: 'CST-0512-C2', name: 'Cast Steel Flange',     onHand: 85,   safety: 100,  max: 500,  unit: 'pc', abc: 'A', leadTime: 14, lastIn: '2026-06-20', lastOut: '2026-06-28' },
  { sku: 'PCH-3001-D1', name: 'Precision Shaft',       onHand: 410,  safety: 200,  max: 1000, unit: 'pc', abc: 'B', leadTime: 5,  lastIn: '2026-06-27', lastOut: '2026-06-29' },
  { sku: 'GBR-0820-E2', name: 'Gear Box Cover',        onHand: 1820, safety: 1000, max: 4000, unit: 'pc', abc: 'B', leadTime: 6,  lastIn: '2026-06-26', lastOut: '2026-06-29' },
  { sku: 'VHV-1105-F1', name: 'Valve Housing',         onHand: 60,   safety: 80,   max: 400,  unit: 'pc', abc: 'A', leadTime: 12, lastIn: '2026-06-22', lastOut: '2026-06-27' },
  { sku: 'MNT-0406-G3', name: 'Mounting Plate',        onHand: 5600, safety: 2000, max: 10000,unit: 'pc', abc: 'C', leadTime: 3,  lastIn: '2026-06-29', lastOut: '2026-06-29' },
  { sku: 'HET-2040-H2', name: 'Heat Exchanger Tube',   onHand: 280,  safety: 150,  max: 800,  unit: 'pc', abc: 'B', leadTime: 8,  lastIn: '2026-06-24', lastOut: '2026-06-28' },
]

const inventoryMovements = [
  { id: 'MOV-2241', sku: 'ALH-1042-A3', type: 'OUT', qty: 120, from: 'WO-2026-1042', time: '2026-06-29 14:32', operator: 'EMP-1009' },
  { id: 'MOV-2240', sku: 'MNT-0406-G3', type: 'IN',  qty: 2000,from: 'PO-2026-0312', time: '2026-06-29 10:15', operator: 'EMP-1004' },
  { id: 'MOV-2239', sku: 'PCH-3001-D1', type: 'OUT', qty: 80,  from: 'WO-2026-1045', time: '2026-06-29 09:42', operator: 'EMP-1009' },
  { id: 'MOV-2238', sku: 'GBR-0820-E2', type: 'OUT', qty: 150, from: 'WO-2026-1046', time: '2026-06-28 16:08', operator: 'EMP-1009' },
  { id: 'MOV-2237', sku: 'CST-0512-C2', type: 'OUT', qty: 50,  from: 'WO-2026-1044', time: '2026-06-28 14:00', operator: 'EMP-1009' },
  { id: 'MOV-2236', sku: 'STS-2208-B1', type: 'IN',  qty: 1500,from: 'PO-2026-0315', time: '2026-06-25 11:20', operator: 'EMP-1004' },
  { id: 'MOV-2235', sku: 'VHV-1105-F1', type: 'IN',  qty: 200, from: 'PO-2026-0318', time: '2026-06-22 09:30', operator: 'EMP-1004' },
]

/* ============================================================
 * 8. 仪表盘汇总
 * ============================================================ */
const dashboardKpi = [
  { label: 'Daily Output',      value: '12,847', icon: 'pi pi-box',              color: 'indigo', change: '+12.5%', up: true },
  { label: 'First Pass Yield',  value: '98.2%',  icon: 'pi pi-check-circle',     color: 'emerald', change: '+0.8%', up: true },
  { label: 'OEE',               value: '82.4%',  icon: 'pi pi-chart-pie',        color: 'amber',   change: '+1.2%', up: true },
  { label: 'Open Work Orders',  value: '6',      icon: 'pi pi-file-edit',        color: 'blue',    change: '-2',    up: true },
  { label: 'Active Alerts',     value: '3',      icon: 'pi pi-exclamation-triangle', color: 'rose', change: '-2',    up: true },
  { label: 'On-time Delivery',  value: '96.2%',  icon: 'pi pi-clock',            color: 'teal',    change: '+1.5%', up: true },
]

const alerts = [
  { id: 1, level: 'error',   message: 'EQ-RBT-E01 Robotic Arm: Servo motor overheating (55°C)', time: '5 min ago',  source: 'Equipment' },
  { id: 2, level: 'warning', message: 'WO-2026-1043 running 2 days behind schedule',            time: '15 min ago', source: 'Work Order' },
  { id: 3, level: 'warning', message: 'STS-2208-B1 inventory below safety stock (320/800)',     time: '32 min ago', source: 'Inventory' },
  { id: 4, level: 'info',    message: 'Scheduled maintenance: EQ-PKG-C01 in 2 hours',           time: '1 hour ago', source: 'Maintenance' },
  { id: 5, level: 'error',   message: 'SPC subgroup #13 out of control on shaft diameter',     time: '2 hours ago',source: 'Quality' },
  { id: 6, level: 'warning', message: 'CNC-A02 tool wear reached 87% - replace recommended',   time: '3 hours ago',source: 'Equipment' },
]

/* ============================================================
 * 工单状态机
 * ============================================================ */
const STATUS_FLOW = {
  'Created':     { next: 'Released',     action: 'Release',         icon: 'pi pi-forward',       note: 'Released to production, materials allocated' },
  'Released':    { next: 'In Progress',  action: 'Start Production', icon: 'pi pi-play',         note: 'Production started, first article inspection passed' },
  'In Progress': { next: 'Completed',    action: 'Mark Completed',   icon: 'pi pi-check',        note: 'Production completed, all units produced' },
  'Completed':   { next: 'Closed',       action: 'Close Order',      icon: 'pi pi-lock',         note: 'Final QA passed, goods moved to finished warehouse' },
  'Closed':      null,
}

/* ============================================================
 * Store
 * ============================================================ */
export const useDataStore = defineStore('mesData', () => {
  const _employees = ref(employees)
  const _products = ref(products)
  const _workOrders = ref(workOrders)
  const _equipment = ref(equipment)
  const _maintenanceLog = ref(maintenanceLog)
  const _downtimeReasons = ref(downtimeReasons)
  const _inspectionBatches = ref(inspectionBatches)
  const _spcData = ref(spcData)
  const _defectsPareto = ref(defectsPareto)
  const _traceabilityRecords = ref(traceabilityRecords)
  const _inventory = ref(inventory)
  const _inventoryMovements = ref(inventoryMovements)
  const _dashboardKpi = ref(dashboardKpi)
  const _alerts = ref(alerts)

  // 旧接口兼容
  const tasks = ref(workOrders.map(wo => ({
    id: wo.id,
    title: `${wo.id} · ${wo.product}`,
    priority: wo.priority,
    status: wo.status,
    assignee: getEmployee(wo.lead)?.name || 'Unassigned',
    deadline: wo.dueDate,
    description: `${wo.qty} units on ${wo.line}, ${wo.completed}/${wo.qty} completed`,
  })))

  function getEmployee(id) {
    return _employees.value.find(e => e.id === id)
  }

  function getProduct(sku) {
    return _products.value.find(p => p.sku === sku)
  }

  function getWorkOrder(id) {
    return _workOrders.value.find(w => w.id === id)
  }

  // 计算库存水位状态
  const inventoryStatus = computed(() => {
    return _inventory.value.map(item => {
      const ratio = item.onHand / item.safety
      let status = 'healthy'
      if (item.onHand <= item.safety) status = 'critical'
      else if (item.onHand <= item.safety * 1.3) status = 'warning'
      return { ...item, status, ratio }
    })
  })

  // 活跃工单（非 Closed/Completed）
  const activeWorkOrders = computed(() =>
    _workOrders.value.filter(w => w.status !== 'Closed' && w.status !== 'Completed')
  )

  /* ---------- Actions ---------- */

  /**
   * 新增工单
   * payload: { product, qty, line, priority, startDate, dueDate, lead }
   */
  function createWorkOrder(payload) {
    // 生成新工单号：WO-2026-{max+1}
    const maxNum = _workOrders.value.reduce((max, w) => {
      const n = parseInt(w.id.split('-').pop(), 10)
      return n > max ? n : max
    }, 1051)
    const newId = `WO-2026-${maxNum + 1}`

    // 计算甘特图位置（相对今天 2026-06-29）
    const today = new Date('2026-06-29')
    const start = new Date(payload.startDate)
    const due = new Date(payload.dueDate)
    const ganttStart = Math.round((start - today) / (1000 * 60 * 60 * 24))
    const ganttDuration = Math.max(1, Math.round((due - start) / (1000 * 60 * 60 * 24)))

    const newWo = {
      id: newId,
      product: payload.product,
      qty: Number(payload.qty),
      completed: 0,
      scrapped: 0,
      status: 'Created',
      priority: payload.priority,
      line: payload.line,
      startDate: payload.startDate,
      dueDate: payload.dueDate,
      lead: payload.lead,
      progress: 0,
      ganttStart,
      ganttDuration,
      timeline: [{
        at: `${payload.startDate} 06:00`,
        action: 'Work order created',
        by: 'EMP-1006',
        note: `Planned qty: ${payload.qty} pcs on ${payload.line}`,
      }],
    }
    _workOrders.value.push(newWo)
    return newWo
  }

  /**
   * 推进工单状态
   * 返回更新后的工单或 null（已是终态）
   */
  function advanceWorkOrderStatus(id) {
    const wo = _workOrders.value.find(w => w.id === id)
    if (!wo) return null
    const flow = STATUS_FLOW[wo.status]
    if (!flow) return null

    const prevStatus = wo.status
    wo.status = flow.next

    // 状态相关副作用
    if (flow.next === 'In Progress') {
      // 开始生产时，progress 给个初始值（如果是 0）
      if (wo.progress === 0) wo.progress = 5
    }
    if (flow.next === 'Completed') {
      wo.progress = 100
      wo.completed = wo.qty
    }

    // 追加时间线记录
    const now = new Date()
    const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    wo.timeline.push({
      at: ts,
      action: flow.note,
      by: 'EMP-1001', // admin 操作
      note: `Status changed from ${prevStatus} to ${flow.next}`,
    })

    return wo
  }

  /**
   * 按 lot 号查询追溯链
   * 返回批次链对象或 null
   */
  function getTraceabilityByLot(lot) {
    if (!lot) return null
    const trimmed = lot.trim().toUpperCase()
    return _traceabilityRecords.value.find(r => r.root.id.toUpperCase() === trimmed) || null
  }

  // 最近的批次号（用于快捷标签）
  const recentLots = computed(() =>
    _traceabilityRecords.value.map(r => r.root.id)
  )

  function initMockData() {
    // 兼容旧代码，无操作
  }

  return {
    employees: _employees,
    products: _products,
    workOrders: _workOrders,
    equipment: _equipment,
    maintenanceLog: _maintenanceLog,
    downtimeReasons: _downtimeReasons,
    inspectionBatches: _inspectionBatches,
    spcData: _spcData,
    defectsPareto: _defectsPareto,
    traceabilityRecords: _traceabilityRecords,
    inventory: _inventory,
    inventoryStatus,
    inventoryMovements: _inventoryMovements,
    dashboardKpi: _dashboardKpi,
    alerts: _alerts,
    tasks,
    activeWorkOrders,
    recentLots,
    statusFlow: STATUS_FLOW,
    getEmployee,
    getProduct,
    getWorkOrder,
    createWorkOrder,
    advanceWorkOrderStatus,
    getTraceabilityByLot,
    initMockData,
  }
})
