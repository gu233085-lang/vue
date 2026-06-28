import api from './client'

function toCamel(e) {
  return {
    id: e.id, name: e.name,
    employeeNo: e.employeeNo ?? e.employee_no,
    position: e.position, phone: e.phone,
    hireDate: e.hireDate ?? e.hire_date,
    createdAt: e.createdAt ?? e.created_at
  }
}

function toSnake(e) {
  return {
    name: e.name, employee_no: e.employeeNo,
    position: e.position, phone: e.phone, hire_date: e.hireDate
  }
}

export const fetchEmployees = () => api.get('/employees').then(r => r.data.map(toCamel))
export const createEmployee = data => api.post('/employees', toSnake(data)).then(r => toCamel(r.data))
export const updateEmployee = (id, data) => api.put(`/employees/${id}`, toSnake(data)).then(r => toCamel(r.data))
export const deleteEmployee = id => api.delete(`/employees/${id}`)
