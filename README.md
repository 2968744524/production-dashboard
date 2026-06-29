# Production Dashboard - MES System

> Real-time Manufacturing Execution & Monitoring System built with **Vue 3 + ECharts + Element Plus**

![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js)
![ECharts](https://img.shields.io/badge/ECharts-5.x-AA344D?logo=apache-echarts)
![Element Plus](https://img.shields.io/badge/Element%20Plus-2.x-409EFF?logo=element)

## 📊 Features

- **Real-time Dashboard** — Production overview with KPI cards, trend charts, and live alerts
- **Task Management** — Full CRUD operations with priority levels, status tracking, and filtering
- **Equipment Monitoring** — Live equipment status, load/temperature visualization, uptime tracking
- **Data Analytics** — OEE (Overall Equipment Effectiveness) radar charts, defect rate analysis, hourly production reports
- **Dark Theme** — Professional industrial dashboard UI optimized for monitoring environments
- **JWT Authentication** — Simulated login system with RBAC-ready structure

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vue 3 (Composition API) + Vite 5 |
| UI Framework | Element Plus 2 |
| Charts | ECharts 5 (vue-echarts) |
| Routing | Vue Router 4 |
| State | Reactive Store (stores/data.js) |

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn

### Installation

```bash
git clone https://github.com/2968744524/production-dashboard.git
cd production-dashboard
npm install
```

### Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📸 Screenshots

### Main Dashboard
The dashboard provides a comprehensive overview of production operations:

- **KPI Cards** — Today's output, completion rate, active equipment count, tasks completed
- **Production Trend Chart** — 7-day actual vs target comparison with area fill
- **Quality Distribution Pie Chart** — Product quality breakdown by category
- **Department Output Bar Chart** — Monthly comparison across production lines
- **Real-time Alerts Feed** — Live system notifications with severity indicators

### Task Management
Full task lifecycle management:
- Create, edit, delete tasks
- Filter by status, priority, and search
- Priority tagging (High/Medium/Low)
- Status workflow (Pending → In Progress → Completed)

### Equipment Monitor
Real-time equipment health monitoring:
- Status summary cards (Running/Idle/Maintenance/Error)
- Load & temperature dual-axis chart
- Equipment list table with progress bars and alerts

### Data Analytics
Advanced production analytics:
- OEE radar chart (Availability / Performance / Quality)
- Hourly production bar chart vs target
- 30-day defect rate trend with alert thresholds
- Summary report table with totals

## 🔐 Demo Login

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Administrator |
| operator | operator123 | Operator |

## 📁 Project Structure

```
production-dashboard/
├── src/
│   ├── assets/styles/
│   │   └── global.css          # Dark theme styles & overrides
│   ├── components/
│   │   ├── common/             # Shared components (Sidebar, Header)
│   │   ├── dashboard/          # Dashboard widgets
│   │   └── tasks/              # Task-related components
│   ├── views/
│   │   ├── LayoutView.vue      # App layout (sidebar + header)
│   │   ├── LoginView.vue       # Login page
│   │   ├── DashboardView.vue   # Main dashboard
│   │   ├── TasksView.vue       # Task management
│   │   ├── EquipmentView.vue   # Equipment monitor
│   │   └── AnalyticsView.vue   # Data analytics
│   ├── router/index.js         # Route configuration
│   ├── stores/data.js          # Mock data store
│   ├── App.vue                 # Root component
│   └── main.js                 # Entry point
├── index.html
├── package.json
└── vite.config.js
```

## 🎯 Use Cases

This project is designed to demonstrate:

1. **Enterprise-grade Frontend Development** — Component architecture, routing, state management
2. **Data Visualization** — Complex ECharts integration (line, bar, pie, radar charts)
3. **Industrial UX Design** — Dark-themed monitoring dashboards
4. **CRUD Operations** — Full task management with form validation
5. **Responsive Layout** — Sidebar navigation, card-based grid layout

## License

MIT
