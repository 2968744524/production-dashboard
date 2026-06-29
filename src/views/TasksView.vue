<template>
  <div class="tasks-page">
    <el-row :gutter="16" style="margin-bottom: 16px;">
      <el-col :span="16">
        <div class="filter-bar">
          <el-input v-model="search" placeholder="Search tasks..." prefix-icon="Search" clearable style="width: 260px;" />
          <el-select v-model="statusFilter" placeholder="All Statuses" clearable style="width: 160px;">
            <el-option label="Pending" value="pending" />
            <el-option label="In Progress" value="in-progress" />
            <el-option label="Completed" value="completed" />
          </el-select>
          <el-select v-model="priorityFilter" placeholder="All Priorities" clearable style="width: 160px;">
            <el-option label="High" value="high" />
            <el-option label="Medium" value="medium" />
            <el-option label="Low" value="low" />
          </el-select>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="action-bar">
          <el-button type="primary" icon="Plus" @click="showDialog()">New Task</el-button>
          <el-button icon="Refresh" @click="refreshTasks">Refresh</el-button>
        </div>
      </el-col>
    </el-row>

    <el-card class="table-card">
      <el-table
        :data="filteredTasks"
        stripe
        style="width: 100%"
        :header-cell-style="{ background: '#1a2634', color: '#8a9bb0' }"
      >
        <el-table-column prop="id" label="#" width="50" />
        <el-table-column prop="title" label="Task Name" min-width="220" show-overflow-tooltip />
        <el-table-column prop="category" label="Category" width="120">
          <template #default="{ row }">
            <el-tag size="small" effect="dark">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="Priority" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              size="small"
              :type="row.priority === 'high' ? 'danger' : row.priority === 'medium' ? 'warning' : 'info'"
              effect="dark"
            >
              {{ row.priority }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="130" align="center">
          <template #default="{ row }">
            <el-tag
              size="small"
              :type="statusType(row.status)"
              effect="dark"
            >
              {{ formatStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="assignee" label="Assignee" width="110" />
        <el-table-column prop="deadline" label="Deadline" width="110" />
        <el-table-column label="Actions" width="160" fixed="right">
          <template #default="{ row }">
            <el-button-group size="small">
              <el-button type="primary" link @click="showDialog(row)">Edit</el-button>
              <el-button type="primary" link @click="toggleComplete(row)">
                {{ row.status === 'completed' ? 'Reopen' : 'Done' }}
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-area">
        <span class="total-info">Total: {{ filteredTasks.length }} tasks</span>
      </div>
    </el-card>

    <!-- Task Dialog -->
    <el-dialog v-model="dialogVisible" :title="editingTask ? 'Edit Task' : 'New Task'" width="520px">
      <el-form :model="taskForm" label-width="100px">
        <el-form-item label="Title">
          <el-input v-model="taskForm.title" placeholder="Enter task title..." />
        </el-form-item>
        <el-form-item label="Category">
          <el-select v-model="taskForm.category" placeholder="Select category">
            <el-option label="Maintenance" value="Maintenance" />
            <el-option label="Quality" value="Quality" />
            <el-option label="Development" value="Development" />
            <el-option label="Operations" value="Operations" />
            <el-option label="Training" value="Training" />
            <el-option label="IT" value="IT" />
            <el-option label="Reporting" value="Reporting" />
          </el-select>
        </el-form-item>
        <el-form-item label="Priority">
          <el-radio-group v-model="taskForm.priority">
            <el-radio value="high">High</el-radio>
            <el-radio value="medium">Medium</el-radio>
            <el-radio value="low">Low</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Assignee">
          <el-input v-model="taskForm.assignee" placeholder="Assign to..." />
        </el-form-item>
        <el-form-item label="Deadline">
          <el-date-picker v-model="taskForm.deadline" type="date" placeholder="Pick deadline" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="saveTask">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { taskList as originalTasks } from '../stores/data'

const search = ref('')
const statusFilter = ref('')
const priorityFilter = ref('')
const dialogVisible = ref(false)
const editingTask = ref(null)

const tasks = ref([...originalTasks])

const taskForm = reactive({
  title: '', category: 'Development', priority: 'medium',
  assignee: '', deadline: ''
})

const filteredTasks = computed(() => {
  return tasks.value.filter(t => {
    const matchSearch = !search.value || t.title.toLowerCase().includes(search.value.toLowerCase())
    const matchStatus = !statusFilter.value || t.status === statusFilter.value
    const matchPriority = !priorityFilter.value || t.priority === priorityFilter.value
    return matchSearch && matchStatus && matchPriority
  })
})

function statusType(status) {
  const map = { completed: 'success', 'in-progress': 'warning', pending: 'info' }
  return map[status] || 'info'
}

function formatStatus(s) {
  const map = { 'in-progress': 'In Progress', pending: 'Pending', completed: 'Completed' }
  return map[s] || s
}

function showDialog(task) {
  editingTask.value = task || null
  if (task) {
    Object.assign(taskForm, { ...task })
  } else {
    Object.assign(taskForm, { title: '', category: 'Development', priority: 'medium', assignee: '', deadline: '' })
  }
  dialogVisible.value = true
}

function saveTask() {
  if (!taskForm.title) { ElMessage.warning('Please enter a task title'); return }
  if (editingTask.value) {
    const idx = tasks.value.findIndex(t => t.id === editingTask.value.id)
    tasks.value[idx] = { ...tasks.value[idx], ...taskForm }
    ElMessage.success('Task updated')
  } else {
    tasks.value.push({
      id: Date.now(),
      status: 'pending',
      ...taskForm,
      deadline: typeof taskForm.deadline === 'string' ? taskForm.deadline : (taskForm.deadline?.toISOString().slice(0,10) || '')
    })
    ElMessage.success('Task created')
  }
  dialogVisible.value = false
}

function toggleComplete(row) {
  row.status = row.status === 'completed' ? 'in-progress' : 'completed'
  ElMessage.success(row.status === 'completed' ? 'Task marked complete!' : 'Task reopened')
}

function refreshTasks() {
  ElMessage.info('Data refreshed (simulated)')
}
</script>

<style scoped>
.filter-bar, .action-bar {
  display: flex;
  gap: 12px;
  align-items: center;
}
.action-bar { justify-content: flex-end; }

.table-card :deep(.el-card__body) { padding: 0; }
.pagination-area {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  border-top: 1px solid var(--border-color);
}
.total-info {
  color: var(--text-secondary);
  font-size: 13px;
}
</style>
