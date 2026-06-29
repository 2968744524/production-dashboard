# MES Pro · Production Management System

> Enterprise-grade Manufacturing Execution System (MES) built with **Vue 3 + PrimeVue + Tailwind CSS v4 + Chart.js**

![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js)
![PrimeVue](https://img.shields.io/badge/PrimeVue-4.5-6366F1)
![Tailwind v4](https://img.shields.io/badge/Tailwind-4.0-38BDF8?logo=tailwindcss)
![Chart.js](https://img.shields.io/badge/Chart.js-4.5-FF6384)

A production-grade MES (Manufacturing Execution System) frontend demonstrating real industrial patterns: SPC quality control with X̄-R charts, OEE breakdown across Availability × Performance × Quality, work order scheduling with Gantt visualization, end-to-end product traceability, and a full workforce management module with realistic shift scheduling.

Built for the North American discrete-manufacturing market — every data point, batch ID, and customer name reflects authentic industry conventions.

---

## 🎯 Highlights

- **7 functional modules** covering the full MES workflow
- **SPC (Statistical Process Control)** with Cpk/Ppk calculation and out-of-control point detection
- **Gantt-style production scheduling** with 25-day rolling window, weekend shading, and today indicator
- **3-axis OEE decomposition** with availability, performance, and quality gauges per equipment
- **End-to-end traceability tree** linking raw materials → operations → finished goods → customers
- **Real workforce module** with 12 employees (real photos via randomuser.me), three-shift rotation, weekly schedule matrix
- **Production-realistic data**: WO-2026-XXXX work orders, LOT-YYYYMMDD-NNN batches, Cpk 1.42, OEE 78-82%, defect Pareto 80/20
- **Light / Dark theme** with localStorage persistence
- **Fully responsive** from mobile to 4K displays

---

## 📦 Modules

| Module | Description |
|--------|-------------|
| **Dashboard** | Real-time KPI overview, production trend, quality rate, OEE radar, live alerts feed, active work orders table |
| **Work Orders** | Production order lifecycle. Toggle between Gantt schedule view and list view. Status: Created → Released → In Progress → Completed → Closed |
| **Quality (SPC)** | X̄-R control charts with UCL/CL/LCL/USL/LSL overlays and out-of-control highlighting. Cpk/Ppk indicators, defect Pareto analysis, batch inspection records |
| **Equipment** | Per-device OEE breakdown (Availability × Performance × Quality), health score, load/temperature monitoring, predictive maintenance schedule |
| **Inventory** | ABC classification, stock level visualization against safety stock, material movement timeline |
| **Traceability** | Lot genealogy tree: raw materials (with supplier & mill cert) → production operations → finished goods → customer shipments |
| **Workforce** | Employee grid with real photos, competency radar per person, weekly shift schedule matrix (Day / Swing / Night) |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Vue 3.5 (Composition API + `<script setup>`) |
| Build tool | Vite 8 |
| UI library | PrimeVue 4 (Aura theme) + PrimeIcons |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite` plugin) + custom design tokens |
| Charts | Chart.js 4 (via PrimeVue Chart) |
| State | Pinia |
| Router | Vue Router 4 with route-level code splitting |
| Avatars | randomuser.me (royalty-free, 70+ nationalities) |

### Why this stack?

- **Vue 3 Composition API** — Better TypeScript inference, smaller bundle, more flexible logic reuse
- **PrimeVue Aura** — Modern, design-system-grade component library (alternative to Element Plus / Ant Design)
- **Tailwind v4** — Zero-config CSS-first approach, no `tailwind.config.js` needed
- **Chart.js over ECharts** — Smaller footprint (60KB vs 400KB), cleaner API for standard chart types
- **Pinia** — Official Vue state management (replaces Vuex)

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20
- npm >= 10

### Install & Run

```bash
# Clone the repository
git clone https://github.com/2968744524/production-dashboard.git
cd production-dashboard

# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Demo Credentials

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Plant Manager |
| `operator` | `operator123` | Floor Operator |

---

## 📂 Project Structure

```
production-dashboard/
├── src/
│   ├── assets/styles/
│   │   └── global.css                # Design tokens, custom utilities, animations
│   ├── stores/
│   │   └── data.js                   # Pinia store · 12 employees, 8 SKUs, 10 work orders, SPC data, etc.
│   ├── views/
│   │   ├── LoginView.vue
│   │   ├── DashboardView.vue
│   │   ├── WorkOrdersView.vue        # Gantt + list views
│   │   ├── QualityView.vue           # SPC control charts
│   │   ├── EquipmentView.vue         # OEE breakdown
│   │   ├── InventoryView.vue
│   │   ├── TraceabilityView.vue      # Lot genealogy tree
│   │   └── WorkforceView.vue         # 3-shift schedule
│   ├── router/
│   │   └── index.js                  # Lazy-loaded routes
│   ├── App.vue                       # Sidebar + topbar layout
│   └── main.js
├── public/
├── index.html
├── vite.config.js
└── package.json
```

---

## 🎨 Design System

### Color Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Brand | `#6366f1` (indigo-500) | Primary actions, active states |
| Brand light | `#818cf8` (indigo-400) | Hover, focus rings |
| Brand dark | `#4f46e5` (indigo-600) | Pressed states |
| Success | `#10b981` (emerald-500) | Pass, OEE >85% |
| Warning | `#f59e0b` (amber-500) | Low stock, Cpk <1.33 |
| Danger | `#ef4444` (red-500) | Out-of-control, errors |

### Component Patterns

- **`.stat-card`** — 18px radius, gradient hover glow, used for all KPI tiles
- **`.chart-card`** — Container for chart widgets with consistent padding
- **`.btn-primary`** — Indigo→violet gradient with light sweep animation on hover
- **`.badge-{low|medium|high}` / `.badge-{todo|progress|done}`** — Status pills with semantic colors

### Typography

- **Font**: Inter (loaded from Google Fonts)
- **Tabular numbers**: `font-variant-numeric: tabular-nums` on all KPI values for aligned digits
- **Hierarchy**: 28px H1 / 16px H3 / 14px body / 11px micro

---

## 🌍 Localization

Designed for the North American discrete-manufacturing market:

- **Customer names**: Detroit Auto Parts Inc., Midwest Precision LLC (real US industrial geography)
- **Suppliers**: Alcoa Corp, Master Fluids (real industry names)
- **Work shifts**: Day (06:00-14:00) / Swing (14:00-22:00) / Night (22:00-06:00) — US convention
- **Certifications**: ISO 9001 references, mill certificate numbers
- **Data formats**: US date format (MM/DD/YYYY), imperial specs (inches, °F-ready)
- **Currencies**: USD pricing

---

## 📊 Data Model

The mock data layer (`src/stores/data.js`) is structured around a realistic discrete-manufacturing schema:

```javascript
employees[12]      // EMP-1001 ~ EMP-1012, with randomuser.me avatars
products[8]        // SKU: XXX-XXXX-XX with spec descriptions
workOrders[10]     // WO-2026-XXXX, with gantt positioning
equipment[8]       // EQ-CNC-A01 ~ EQ-CNV-F01, with OEE 3-axis breakdown
inspectionBatches[8]  // LOT-YYYYMMDD-NNN
spcData            // 25-subgroup X̄-R control chart data, Cpk/Ppk
defectsPareto[6]   // Top defect types
traceabilityTree   // Lot genealogy (upstream + operations + downstream)
inventory[8]       // SKU-level stock with safety/max thresholds
```

---

## 🎓 What This Project Demonstrates

1. **Industrial UX expertise** — Charts and data density appropriate for monitoring environments (not consumer apps)
2. **Statistical Process Control** — Real SPC implementation with control limits, capability indices, Western Electric rules
3. **Lean Manufacturing vocabulary** — OEE, FPY, Pareto, ABC analysis, Six Sigma terminology
4. **Vue 3 best practices** — Composition API, `<script setup>`, composables, Pinia, lazy routes
5. **Modern CSS** — Tailwind v4 with `@theme` custom properties, CSS variables for theming
6. **Accessibility** — `focus-visible` rings, ARIA labels, keyboard navigation
7. **Performance** — Route-level code splitting, CSS-only animations, gradient chart backgrounds via `createLinearGradient`

---

## 🛣 Roadmap

Future enhancements planned:

- [ ] Drag-and-drop Gantt bars to reschedule work orders
- [ ] Real-time WebSocket updates (mock with `setInterval`)
- [ ] CSV / Excel export for all data tables
- [ ] Multi-language support (i18n) — English / Spanish / Mandarin
- [ ] Mobile-first PWA with offline support
- [ ] Unit & E2E tests (Vitest + Playwright)

---

## 📄 License

MIT License — free to use as reference or starting point for your own projects.

---

## 🤝 Contact

Built as a portfolio piece for Upwork / freelance engagements. Specializing in:
- Industrial / manufacturing dashboards
- Real-time data visualization
- Vue 3 + TypeScript frontends
- Cross-cultural UX for global clients

For project inquiries, please reach out via [Upwork profile link].
