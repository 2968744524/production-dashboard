<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '../stores/data'

const store = useDataStore()

const searchLot = ref('LOT-20260628-014')
const trace = ref(store.getTraceabilityByLot('LOT-20260628-014'))
const notFound = ref(false)
const loading = ref(false)
const selectedNode = ref(null) // { type, data }
const drawerVisible = ref(false)

function searchTrace() {
  if (!searchLot.value.trim()) {
    notFound.value = true
    trace.value = null
    return
  }
  loading.value = true
  notFound.value = false
  // 模拟一点加载延迟，让搜索行为更真实
  setTimeout(() => {
    const result = store.getTraceabilityByLot(searchLot.value)
    if (result) {
      trace.value = result
      notFound.value = false
    } else {
      trace.value = null
      notFound.value = true
    }
    loading.value = false
  }, 350)
}

function quickSearch(lot) {
  searchLot.value = lot
  searchTrace()
}

const opResultConfig = {
  'Pass': { badge: 'badge-done',   icon: 'pi pi-check',     text: 'text-emerald-500' },
  'Fail': { badge: 'badge-high',   icon: 'pi pi-times',     text: 'text-rose-500' },
  'Hold': { badge: 'badge-medium', icon: 'pi pi-pause',     text: 'text-amber-500' },
}

// 节点详情抽屉
function openNodeDetail(type, item) {
  selectedNode.value = { type, data: item }
  drawerVisible.value = true
}

const nodeTitle = computed(() => {
  if (!selectedNode.value) return ''
  const { type, data } = selectedNode.value
  if (type === 'upstream') return `${data.type} · ${data.lot}`
  if (type === 'operation') return data.op
  if (type === 'downstream') return `${data.type} · ${data.id}`
  return ''
})
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
          <input v-model="searchLot" @keyup.enter="searchTrace" type="text" placeholder="Enter lot number, e.g. LOT-20260628-014" class="field-input pl-11 font-mono" :disabled="loading" />
          <i v-if="loading" class="pi pi-spin pi-spinner absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500 text-sm"></i>
        </div>
        <button @click="searchTrace" :disabled="loading" class="btn-primary flex items-center gap-2 justify-center">
          <i :class="loading ? 'pi pi-spin pi-spinner' : 'pi pi-search'" class="text-sm"></i> Trace
        </button>
      </div>
      <!-- Quick batches -->
      <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <p class="text-xs text-slate-400 dark:text-slate-500 font-medium mb-2">Recent batches — click to trace</p>
        <div class="flex flex-wrap gap-2">
          <button v-for="lot in store.recentLots" :key="lot"
            @click="quickSearch(lot)"
            class="px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-all"
            :class="searchLot === lot
              ? 'bg-indigo-500 text-white border-indigo-500'
              : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-400'">
            {{ lot }}
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state: not found -->
    <div v-if="notFound" class="chart-card py-16 text-center">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-500/10 mb-4">
        <i class="pi pi-search text-2xl text-rose-400"></i>
      </div>
      <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-1">No traceability record found</h3>
      <p class="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
        We couldn't find a batch matching <span class="font-mono font-semibold text-slate-700 dark:text-slate-300">{{ searchLot }}</span>.
        Try one of the recent batches above, or check the lot number format (LOT-YYYYMMDD-NNN).
      </p>
      <button @click="quickSearch(store.recentLots[0])" class="btn-ghost mt-5 inline-flex items-center gap-1.5">
        <i class="pi pi-arrow-left text-xs"></i> Back to latest batch
      </button>
    </div>

    <!-- Loading skeleton -->
    <div v-else-if="loading" class="space-y-4">
      <div class="chart-card h-24 animate-pulse"></div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="chart-card h-64 animate-pulse"></div>
        <div class="chart-card h-64 animate-pulse"></div>
        <div class="chart-card h-64 animate-pulse"></div>
      </div>
    </div>

    <!-- Result -->
    <template v-else-if="trace">
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
            <span class="badge" :class="trace.root.result === 'Accept' ? 'badge-done' : trace.root.result === 'Concession' ? 'badge-medium' : 'badge-high'">
              <i :class="trace.root.result === 'Accept' ? 'pi pi-check' : trace.root.result === 'Concession' ? 'pi pi-pause' : 'pi pi-times'" class="text-[10px] mr-1"></i>{{ trace.root.result }}
            </span>
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
            <div v-for="item in trace.upstream" :key="item.id"
              class="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-500/30 hover:shadow-sm transition-all cursor-pointer"
              @click="openNodeDetail('upstream', item)">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">{{ item.type }}</span>
                <i class="pi pi-chevron-right text-[10px] text-slate-300 dark:text-slate-600"></i>
              </div>
              <p class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ item.name }}</p>
              <div class="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                <p><span class="font-medium">Lot:</span> <span class="font-mono">{{ item.lot }}</span></p>
                <p><span class="font-medium">Supplier:</span> {{ item.supplier }}</p>
                <p><span class="font-medium">Qty:</span> {{ item.qty }}</p>
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
              <div class="absolute left-0 top-1.5 w-4 h-4 rounded-full ring-4 flex items-center justify-center"
                :class="op.result === 'Pass' ? 'bg-indigo-500 ring-indigo-50 dark:ring-indigo-500/15' : op.result === 'Hold' ? 'bg-amber-500 ring-amber-50 dark:ring-amber-500/15' : 'bg-rose-500 ring-rose-50 dark:ring-rose-500/15'">
                <span class="text-[9px] font-bold text-white">{{ idx + 1 }}</span>
              </div>
              <!-- Content -->
              <div class="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:shadow-sm transition-all cursor-pointer"
                @click="openNodeDetail('operation', op)">
                <div class="flex items-center justify-between mb-1.5">
                  <p class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ op.op }}</p>
                  <div class="flex items-center gap-1">
                    <span class="badge" :class="opResultConfig[op.result].badge">{{ op.result }}</span>
                    <i class="pi pi-chevron-right text-[10px] text-slate-300 dark:text-slate-600 ml-1"></i>
                  </div>
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
            <div v-for="item in trace.downstream" :key="item.id"
              class="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-500/30 hover:shadow-sm transition-all cursor-pointer"
              @click="openNodeDetail('downstream', item)">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{{ item.type }}</span>
                <i class="pi pi-chevron-right text-[10px] text-slate-300 dark:text-slate-600"></i>
              </div>
              <p class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ item.customer }}</p>
              <div class="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                <p><span class="font-medium">Qty:</span> {{ item.qty }} pcs</p>
                <p><span class="font-medium">Ship to:</span> {{ item.address }}</p>
                <p><span class="font-medium">Ship date:</span> {{ item.shipDate }}</p>
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
    </template>

    <!-- Node detail drawer -->
    <div v-if="drawerVisible" class="fixed inset-0 z-50 flex justify-end" @click.self="drawerVisible = false">
      <!-- Overlay -->
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>
      <!-- Panel -->
      <div class="relative w-[440px] max-w-[100vw] bg-white dark:bg-slate-900 shadow-2xl flex flex-col animate-slide-in-right">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider mb-1">Node Detail</p>
              <h2 class="font-mono text-base font-bold text-slate-900 dark:text-white break-all">{{ nodeTitle }}</h2>
            </div>
            <button @click="drawerVisible = false" class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex-shrink-0">
              <i class="pi pi-times"></i>
            </button>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto p-6">
          <!-- Upstream node -->
          <div v-if="selectedNode?.type === 'upstream'" class="space-y-4">
            <div class="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
              <p class="text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider">{{ selectedNode.data.type }}</p>
              <p class="text-sm font-semibold text-slate-900 dark:text-white mt-1">{{ selectedNode.data.name }}</p>
            </div>
            <dl class="space-y-3 text-sm">
              <div><dt class="text-xs text-slate-400 uppercase tracking-wider">Lot Number</dt><dd class="font-mono text-slate-800 dark:text-slate-200 mt-0.5">{{ selectedNode.data.lot }}</dd></div>
              <div><dt class="text-xs text-slate-400 uppercase tracking-wider">Supplier</dt><dd class="text-slate-800 dark:text-slate-200 mt-0.5">{{ selectedNode.data.supplier }}</dd></div>
              <div><dt class="text-xs text-slate-400 uppercase tracking-wider">Received Date</dt><dd class="text-slate-800 dark:text-slate-200 mt-0.5 tabular-nums">{{ selectedNode.data.received }}</dd></div>
              <div><dt class="text-xs text-slate-400 uppercase tracking-wider">Quantity</dt><dd class="text-slate-800 dark:text-slate-200 mt-0.5">{{ selectedNode.data.qty }}</dd></div>
              <div>
                <dt class="text-xs text-slate-400 uppercase tracking-wider">Certificate</dt>
                <dd class="mt-0.5">
                  <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono text-xs font-medium">
                    <i class="pi pi-verified text-[10px]"></i>{{ selectedNode.data.cert }}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <!-- Operation node -->
          <div v-else-if="selectedNode?.type === 'operation'" class="space-y-4">
            <div class="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
              <div class="flex items-center justify-between">
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ selectedNode.data.op }}</p>
                <span class="badge" :class="opResultConfig[selectedNode.data.result].badge">{{ selectedNode.data.result }}</span>
              </div>
            </div>
            <dl class="space-y-3 text-sm">
              <div><dt class="text-xs text-slate-400 uppercase tracking-wider">Machine</dt><dd class="font-mono text-slate-800 dark:text-slate-200 mt-0.5">{{ selectedNode.data.machine }}</dd></div>
              <div><dt class="text-xs text-slate-400 uppercase tracking-wider">Start</dt><dd class="text-slate-800 dark:text-slate-200 mt-0.5 tabular-nums">{{ selectedNode.data.start }}</dd></div>
              <div><dt class="text-xs text-slate-400 uppercase tracking-wider">End</dt><dd class="text-slate-800 dark:text-slate-200 mt-0.5 tabular-nums">{{ selectedNode.data.end }}</dd></div>
              <div>
                <dt class="text-xs text-slate-400 uppercase tracking-wider">Operator</dt>
                <dd class="mt-0.5 flex items-center gap-2">
                  <img v-if="store.getEmployee(selectedNode.data.operator)" :src="store.getEmployee(selectedNode.data.operator).avatar" class="w-7 h-7 rounded-full object-cover" />
                  <div>
                    <p class="text-slate-800 dark:text-slate-200">{{ store.getEmployee(selectedNode.data.operator)?.name }}</p>
                    <p class="text-xs text-slate-400">{{ store.getEmployee(selectedNode.data.operator)?.role }}</p>
                  </div>
                </dd>
              </div>
            </dl>
          </div>

          <!-- Downstream node -->
          <div v-else-if="selectedNode?.type === 'downstream'" class="space-y-4">
            <div class="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
              <p class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">{{ selectedNode.data.type }}</p>
              <p class="text-sm font-semibold text-slate-900 dark:text-white mt-1">{{ selectedNode.data.customer }}</p>
            </div>
            <dl class="space-y-3 text-sm">
              <div><dt class="text-xs text-slate-400 uppercase tracking-wider">Order ID</dt><dd class="font-mono text-slate-800 dark:text-slate-200 mt-0.5">{{ selectedNode.data.id }}</dd></div>
              <div><dt class="text-xs text-slate-400 uppercase tracking-wider">Quantity</dt><dd class="text-slate-800 dark:text-slate-200 mt-0.5">{{ selectedNode.data.qty }} pcs</dd></div>
              <div><dt class="text-xs text-slate-400 uppercase tracking-wider">Ship Date</dt><dd class="text-slate-800 dark:text-slate-200 mt-0.5 tabular-nums">{{ selectedNode.data.shipDate }}</dd></div>
              <div><dt class="text-xs text-slate-400 uppercase tracking-wider">Ship To</dt><dd class="text-slate-800 dark:text-slate-200 mt-0.5">{{ selectedNode.data.address }}</dd></div>
              <div>
                <dt class="text-xs text-slate-400 uppercase tracking-wider">Tracking Number</dt>
                <dd class="mt-0.5">
                  <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-mono text-xs font-medium">
                    <i class="pi pi-send text-[10px]"></i>{{ selectedNode.data.tracking }}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes slide-in-right {
  from { transform: translateX(100%); opacity: 0.6; }
  to { transform: translateX(0); opacity: 1; }
}
.animate-slide-in-right {
  animation: slide-in-right 0.25s ease-out;
}
</style>
