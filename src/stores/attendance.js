import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/attendance'

export const useAttendanceStore = defineStore('attendance', () => {
  const records = ref([])
  const loading = ref(false)

  function today() {
    return new Date().toISOString().slice(0, 10)
  }

  async function fetchAttendance(employeeId, date) {
    loading.value = true
    try {
      records.value = await api.fetchAttendance(employeeId, date)
    } finally {
      loading.value = false
    }
  }

  async function fetchAll() {
    loading.value = true
    try {
      records.value = await api.fetchAttendance()
    } finally {
      loading.value = false
    }
  }

  function getTodayRecord(employeeId) {
    const d = today()
    return records.value.find(r => r.employeeId === employeeId && r.date === d) || null
  }

  async function clockIn(employeeId) {
    const result = await api.clockIn(employeeId)
    if (result.ok) {
      const d = today()
      const fresh = await api.fetchAttendance(employeeId, d)
      if (fresh.length > 0) {
        const idx = records.value.findIndex(r => r.employeeId === employeeId && r.date === d)
        if (idx !== -1) records.value[idx] = fresh[0]
        else records.value.push(fresh[0])
      }
    }
    return result
  }

  async function clockOut(employeeId) {
    const result = await api.clockOut(employeeId)
    if (result.ok) {
      const d = today()
      const fresh = await api.fetchAttendance(employeeId, d)
      if (fresh.length > 0) {
        const idx = records.value.findIndex(r => r.employeeId === employeeId && r.date === d)
        if (idx !== -1) records.value[idx] = fresh[0]
      }
    }
    return result
  }

  function getRecordsByEmployee(employeeId) {
    return records.value
      .filter(r => r.employeeId === employeeId)
      .sort((a, b) => b.date.localeCompare(a.date))
  }

  return { records, loading, fetchAttendance, fetchAll, clockIn, clockOut, getTodayRecord, getRecordsByEmployee }
})
