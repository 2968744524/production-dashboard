// Mock Data Store - Simulates backend API responses

// Production data for dashboard
export const productionStats = {
  totalOutput: 12847,
  todayTarget: 15000,
  completionRate: 85.6,
  defectRate: 1.2,
  activeEquipment: 18,
  totalEquipment: 24,
  pendingTasks: 7,
  completedTasksToday: 23
}

// Production trend (last 7 days)
export const productionTrend = {
  dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  actual: [1200, 1350, 1180, 1420, 1560, 1380, 1480],
  target: [1400, 1450, 1400, 1500, 1550, 1300, 1500]
}

// Equipment status
export const equipmentList = [
  { id: 'EQ-001', name: 'CNC Machine A-01', status: 'running', uptime: '98.2%', temperature: 42, load: 78 },
  { id: 'EQ-002', name: 'CNC Machine A-02', status: 'running', uptime: '97.5%', temperature: 45, load: 82 },
  { id: 'EQ-003', name: 'Assembly Line B-01', status: 'idle', uptime: '96.8%', temperature: 25, load: 0 },
  { id: 'EQ-004', name: 'Assembly Line B-02', status: 'running', uptime: '99.1%', temperature: 38, load: 65 },
  { id: 'EQ-005', name: 'Packaging Unit C-01', status: 'maintenance', uptime: '94.3%', temperature: 28, load: 0 },
  { id: 'EQ-006', name: 'Quality Scanner D-01', status: 'running', uptime: '97.9%', temperature: 35, load: 91 },
  { id: 'EQ-007', name: 'Robotic Arm E-01', status: 'error', uptime: '88.5%', temperature: 55, load: 0 },
  { id: 'EQ-008', name: 'Conveyor F-01', status: 'running', uptime: '98.7%', temperature: 30, load: 54 }
]

// Task list
export let taskList = [
  { id: 1, title: 'Daily Production Report - Line A', priority: 'high', status: 'in-progress', assignee: 'Zhang Wei', deadline: '2024-06-29', category: 'Reporting' },
  { id: 2, title: 'Preventive Maintenance: CNC-002', priority: 'high', status: 'pending', assignee: 'Li Ming', deadline: '2024-06-30', category: 'Maintenance' },
  { id: 3, title: 'Quality Audit - Batch #20240627', priority: 'medium', status: 'completed', assignee: 'Wang Fang', deadline: '2024-06-28', category: 'Quality' },
  { id: 4, title: 'Update MES System Config', priority: 'medium', status: 'in-progress', assignee: 'Chen Jie', deadline: '2024-07-01', category: 'Development' },
  { id: 5, title: 'Inventory Count Check', priority: 'low', status: 'pending', assignee: 'Liu Yang', deadline: '2024-07-02', category: 'Operations' },
  { id: 6, title: 'New Employee Training - Safety Protocol', priority: 'medium', status: 'completed', assignee: 'Zhao Qiang', deadline: '2024-06-27', category: 'Training' },
  { id: 7, title: 'Data Backup & Archive - June', priority: 'low', status: 'pending', assignee: 'Sun Hua', deadline: '2024-07-05', category: 'IT' }
]

// Product quality distribution
export const qualityData = {
  categories: ['Excellent', 'Good', 'Acceptable', 'Defective'],
  values: [68, 22, 8, 2]
}

// Department output comparison
export const departmentOutput = {
  departments: ['Line A', 'Line B', 'Line C', 'Packaging', 'QC'],
  currentMonth: [4200, 3800, 2900, 1950, 997],
  lastMonth: [3950, 3600, 2800, 1800, 850]
}

// Real-time alerts
export const alerts = [
  { id: 1, type: 'error', message: 'EQ-007 Robotic Arm E-01: Overheating detected', time: '5 min ago' },
  { id: 2, type: 'warning', message: 'Line B production below target by 12%', time: '15 min ago' },
  { id: 3, type: 'info', message: 'Scheduled maintenance reminder: EQ-005 in 2 hours', time: '30 min ago' },
  { id: 4, type: 'success', message: 'Quality check passed: Batch #20240628-A', time: '45 min ago' }
]

// Users for login simulation
export const users = [
  { username: 'admin', password: 'admin123', role: 'Administrator', avatar: '' },
  { username: 'operator', password: 'operator123', role: 'Operator', avatar: '' }
]
