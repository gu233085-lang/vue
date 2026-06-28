import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/employees'

export const useEmployeeStore = defineStore('employees', () => {
  const employees = ref([])
  const loading = ref(false)

  async function fetchEmployees() {
    loading.value = true
    try {
      employees.value = await api.fetchEmployees()
    } finally {
      loading.value = false
    }
  }

  async function addEmployee(e) {
    const created = await api.createEmployee(e)
    employees.value.push(created)
  }

  async function updateEmployee(id, data) {
    const updated = await api.updateEmployee(id, data)
    const idx = employees.value.findIndex(e => e.id === id)
    if (idx !== -1) employees.value[idx] = updated
  }

  async function deleteEmployee(id) {
    await api.deleteEmployee(id)
    employees.value = employees.value.filter(e => e.id !== id)
  }

  return { employees, loading, fetchEmployees, addEmployee, updateEmployee, deleteEmployee }
})
