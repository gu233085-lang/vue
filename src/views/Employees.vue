<template>
  <div>
    <el-card>
      <div class="toolbar">
        <el-date-picker
          v-model="selectedDate"
          type="date"
          placeholder="选择日期查看考勤"
          value-format="YYYY-MM-DD"
          style="width: 200px"
          @change="onDateChange"
        />
        <el-button @click="selectedDate = ''; onDateChange()">清除日期</el-button>
        <el-button type="primary" @click="openDialog(null)">新增员工</el-button>
      </div>

      <el-table :data="store.employees" stripe style="margin-top: 16px" row-key="id" v-loading="store.loading">
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="attendance-log">
              <h4>{{ row.name }} 的考勤记录 <span v-if="selectedDate">({{ selectedDate }})</span></h4>
              <el-table :data="getFilteredRecords(row.id)" size="small">
                <el-table-column prop="date" label="日期" width="120" />
                <el-table-column prop="clockIn" label="上班打卡" width="100" />
                <el-table-column prop="clockOut" label="下班签退" width="100" />
              </el-table>
              <el-empty v-if="!getFilteredRecords(row.id).length" description="暂无考勤记录" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="employeeNo" label="工号" width="100" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="position" label="职位" width="100" />
        <el-table-column prop="phone" label="电话" width="130" />
        <el-table-column prop="hireDate" label="入职日期" width="120" />
        <el-table-column label="打卡状态" width="180">
          <template #default="{ row }">
            <template v-if="dateRecord(row.id)">
              <el-tag type="success" size="small">上班: {{ dateRecord(row.id).clockIn }}</el-tag>
              <el-tag v-if="dateRecord(row.id).clockOut" type="info" size="small" style="margin-left: 4px">
                下班: {{ dateRecord(row.id).clockOut }}
              </el-tag>
            </template>
            <template v-else>
              <span class="not-clocked">{{ selectedDate ? '未打卡' : '未打卡' }}</span>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260">
          <template #default="{ row }">
            <el-button size="small" type="success" @click="handleClockIn(row.id)" :disabled="!!dateInRecord(row.id)">上班</el-button>
            <el-button size="small" type="warning" @click="handleClockOut(row.id)" :disabled="!dateInRecord(row.id) || !!dateOutRecord(row.id)">下班</el-button>
            <el-button size="small" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑员工' : '新增员工'" width="450px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="工号" prop="employeeNo">
          <el-input v-model="form.employeeNo" />
        </el-form-item>
        <el-form-item label="职位" prop="position">
          <el-input v-model="form.position" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="入职日期" prop="hireDate">
          <el-date-picker v-model="form.hireDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useEmployeeStore } from '@/stores/employees'
import { useAttendanceStore } from '@/stores/attendance'

const store = useEmployeeStore()
const attendanceStore = useAttendanceStore()
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const formRef = ref(null)
const selectedDate = ref('')

const form = reactive({ name: '', employeeNo: '', position: '', phone: '', hireDate: '' })
const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  employeeNo: [{ required: true, message: '请输入工号', trigger: 'blur' }],
  position: [{ required: true, message: '请输入职位', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入电话', trigger: 'blur' }],
  hireDate: [{ required: true, message: '请选择入职日期', trigger: 'change' }]
}

function currentDate() {
  return selectedDate.value || new Date().toISOString().slice(0, 10)
}

function dateRecord(empId) {
  const d = currentDate()
  return attendanceStore.records.find(r => r.employeeId === empId && r.date === d) || null
}

function dateInRecord(empId) {
  const r = dateRecord(empId)
  return r && r.clockIn
}

function dateOutRecord(empId) {
  const r = dateRecord(empId)
  return r && r.clockOut
}

function getFilteredRecords(empId) {
  let list = attendanceStore.records.filter(r => r.employeeId === empId)
  if (selectedDate.value) {
    list = list.filter(r => r.date === selectedDate.value)
  }
  return list.sort((a, b) => b.date.localeCompare(a.date))
}

async function onDateChange() {
  if (selectedDate.value) {
    await attendanceStore.fetchAttendance(null, selectedDate.value)
  } else {
    await attendanceStore.fetchAll()
  }
}

async function handleClockIn(empId) {
  try {
    const r = await attendanceStore.clockIn(empId)
    r.ok ? ElMessage.success('打卡成功') : ElMessage.warning(r.error)
  } catch (err) {
    ElMessage.error('打卡失败')
  }
}

async function handleClockOut(empId) {
  try {
    const r = await attendanceStore.clockOut(empId)
    r.ok ? ElMessage.success('签退成功') : ElMessage.warning(r.error)
  } catch (err) {
    ElMessage.error('签退失败')
  }
}

function openDialog(row) {
  if (row) {
    isEdit.value = true
    editId.value = row.id
    Object.assign(form, row)
  } else {
    isEdit.value = false
    editId.value = null
    Object.assign(form, { name: '', employeeNo: '', position: '', phone: '', hireDate: '' })
  }
  dialogVisible.value = true
}

async function handleSave() {
  try {
    await formRef.value.validate()
  } catch { return }
  try {
    if (isEdit.value) {
      await store.updateEmployee(editId.value, { ...form })
      ElMessage.success('员工信息已更新')
    } else {
      await store.addEmployee({ ...form })
      ElMessage.success('员工已添加')
    }
    dialogVisible.value = false
  } catch (err) {
    ElMessage.error(err.response?.data?.error || '操作失败')
  }
}

async function handleDelete(id) {
  try {
    await ElMessageBox.confirm('确定删除该员工吗？', '确认', { type: 'warning' })
    await store.deleteEmployee(id)
    ElMessage.success('已删除')
  } catch (err) {
    if (err !== 'cancel' && err !== 'close') {
      ElMessage.error(err.response?.data?.error || '删除失败')
    }
  }
}
</script>

<style scoped>
.toolbar { display: flex; align-items: center; gap: 12px; }
.toolbar .el-button:last-child { margin-left: auto; }
.attendance-log { padding: 12px 24px; }
.attendance-log h4 { margin-bottom: 8px; }
.not-clocked { color: #909399; font-size: 13px; }
</style>
