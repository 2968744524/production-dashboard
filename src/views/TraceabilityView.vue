<script setup>
import { ref } from 'vue'
import { useDataStore } from '../stores/data'

const store = useDataStore()
const searchLot = ref('LOT-20260628-014')
const trace = ref(store.traceability)

function searchTrace() {
  // 演示：直接显示当前 traceability
  trace.value = store.traceability
}

const opResultConfig = {
  'Pass': { badge: 'badge-done',   icon: 'pi pi-check',     text: 'text-emerald-500' },
  'Fail': { badge: 'badge-high',   icon: 'pi pi-times',     text: 'text-rose-500' },
  'Hold': { badge: 'badge-medium', icon: 'pi pi-pause',     text: 'text-amber-500' },
}
</script>

<template>
  <div class="fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
      <div>
        <div class="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium mb-1.5">
          <span>Operations</span>
          <i class="pi pi-angle-right text-[10px]"></i>
          <span class="text-slate-600 dark:text-slate-400">Traceability</span>
        </div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Traceability</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Forward & backward product genealogy tracking</p>
      </div>
    </div>

    <!-- Search bar -->
    <div class="chart-card mb-6">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1 relative">
          <i class="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input v-model="searchLot" @keyup.enter="searchTrace" type="text" placeholder="Enter lot number, e.g. LOT-20260628-014" class="field-input pl-11 font-mono" />
        </div>
        <button @click="searchTrace" class="btn-primary flex items-center gap-2 justify-center">
          <i class="pi pi-search text-sm"></i> Trace
        </button>
      </div>
      <p class="text-xs text-slate-400 mt-3">Tip: Search by lot number, serial number, or work order ID to view complete genealogy.</p>
    </div>

    <!-- Root summary -->
    <div class="stat-card mb-6 !p-5 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-500/10 dark:to-violet-500/10 border-indigo-200 dark:border-indigo-500/30">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="p-3 rounded-xl bg-indigo-500 text-white">
            <i class="pi pi-box text-xl"></i>
          </div>
          <div>
            <p class="text-xs text-indigo-600 dark:text-indigo-400 font-medium uppercase tracking-wider">Finished Goods</p>
            <p class="font-mono text-lg font-bold text-slate-900 dark:text-white">{{ trace.root.id }}</p>
            <p class="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{{ trace.root.product }} · {{ trace.root.qty }} pcs · {{ trace.root.date }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="badge badge-done"><i class="pi pi-check text-[10px] mr-1"></i>{{ trace.root.result }}</span>
          <div class="flex items-center gap-2 pl-3 border-l border-indigo-200 dark:border-indigo-500/30">
            <img v-if="store.getEmployee(trace.root.inspector)" :src="store.getEmployee(trace.root.inspector).avatar" class="w-8 h-8 rounded-full object-cover" />
            <span class="text-xs text-slate-600 dark:text-slate-400">{{ store.getEmployee(trace.root.inspector)?.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Traceability Tree -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      <!-- Upstream (Backward trace) -->
      <div class="chart-card">
        <div class="flex items-center gap-2 mb-5">
          <div class="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/15">
            <i class="pi pi-arrow-left text-amber-500 text-sm"></i>
          </div>
          <div>
            <h3 class="font-semibold text-sm text-slate-900 dark:text-white">Upstream</h3>
            <p class="text-xs text-slate-400 dark:text-slate-500">Raw materials & inputs</p>
          </div>
        </div>
        <div class="flex flex-col gap-3">
          <div v-for="item in trace.upstream" :key="item.id" class="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-500/30 transition-colors">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">{{ item.type }}</span>
              <span class="text-xs text-slate-400 dark:text-slate-500">{{ item.received }}</span>
            </div>
            <p class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ item.name }}</p>
            <div class="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
              <p><span class="font-medium">Lot:</span> <span class="font-mono">{{ item.lot }}</span></p>
              <p><span class="font-medium">Supplier:</span> {{ item.supplier }}</p>
              <p><span class="font-medium">Qty:</span> {{ item.qty }}</p>
              <p><span class="font-medium">Cert:</span> <span class="font-mono text-[11px]">{{ item.cert }}</span></p>
            </div>
          </div>
        </div>
      </div>

      <!-- Production (Middle) -->
      <div class="chart-card">
        <div class="flex items-center gap-2 mb-5">
          <div class="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/15">
            <i class="pi pi-cog text-indigo-500 text-sm"></i>
          </div>
          <div>
            <h3 class="font-semibold text-sm text-slate-900 dark:text-white">Production</h3>
            <p class="text-xs text-slate-400 dark:text-slate-500">Operations & routing</p>
          </div>
        </div>
        <div class="flex flex-col gap-0">
          <div v-for="(op, idx) in trace.children[0].operations" :key="idx" class="relative pl-6 pb-4">
            <!-- Vertical line -->
            <div v-if="idx < trace.children[0].operations.length - 1" class="absolute left-2 top-6 bottom-0 w-px bg-slate-200 dark:bg-slate-700"></div>
            <!-- Dot -->
            <div class="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-indigo-500 ring-4 ring-indigo-50 dark:ring-indigo-500/15 flex items-center justify-center">
              <span class="text-[9px] font-bold text-white">{{ idx + 1 }}</span>
            </div>
            <!-- Content -->
            <div class="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-colors">
              <div class="flex items-center justify-between mb-1.5">
                <p class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ op.op }}</p>
                <span class="badge" :class="opResultConfig[op.result].badge">{{ op.result }}</span>
              </div>
              <div class="grid grid-cols-2 gap-1 text-xs text-slate-500 dark:text-slate-400">
                <p><i class="pi pi-cog text-[10px] mr-1"></i>{{ op.machine }}</p>
                <p class="text-right">{{ op.start }} → {{ op.end }}</p>
              </div>
              <div class="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <img v-if="store.getEmployee(op.operator)" :src="store.getEmployee(op.operator).avatar" class="w-5 h-5 rounded-full object-cover" />
                <span class="text-xs text-slate-500 dark:text-slate-400">{{ store.getEmployee(op.operator)?.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Downstream (Forward trace) -->
      <div class="chart-card">
        <div class="flex items-center gap-2 mb-5">
          <div class="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/15">
            <i class="pi pi-arrow-right text-emerald-500 text-sm"></i>
          </div>
          <div>
            <h3 class="font-semibold text-sm text-slate-900 dark:text-white">Downstream</h3>
            <p class="text-xs text-slate-400 dark:text-slate-500">Customers & shipments</p>
          </div>
        </div>
        <div class="flex flex-col gap-3">
          <div v-for="item in trace.downstream" :key="item.id" class="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-colors">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{{ item.type }}</span>
              <span class="text-xs text-slate-400 dark:text-slate-500">{{ item.shipDate }}</span>
            </div>
            <p class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ item.customer }}</p>
            <div class="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
              <p><span class="font-medium">Qty:</span> {{ item.qty }} pcs</p>
              <p><span class="font-medium">Ship to:</span> {{ item.address }}</p>
              <p><span class="font-medium">Tracking:</span> <span class="font-mono text-[11px]">{{ item.tracking }}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Work Order link -->
    <div class="chart-card">
      <div class="flex items-center justify-between mb-5">
        <div>
          <h3 class="font-semibold text-base text-slate-900 dark:text-white">Linked Work Order</h3>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Production order that generated this lot</p>
        </div>
      </div>
      <div class="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-xl bg-indigo-500 text-white">
            <i class="pi pi-file-edit"></i>
          </div>
          <div>
            <p class="font-mono text-sm font-semibold text-slate-900 dark:text-white">{{ trace.children[0].id }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">{{ trace.children[0].label }}</p>
          </div>
        </div>
        <router-link to="/work-orders" class="btn-ghost flex items-center gap-1.5 text-xs">
          View <i class="pi pi-arrow-right text-[10px]"></i>
        </router-link>
      </div>
    </div>
  </div>
</template>
