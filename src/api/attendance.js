import api from './client'

function toCamel(r) {
  return {
    id: r.id, employeeId: r.employeeId ?? r.employee_id,
    date: r.date,
    clockIn: r.clockIn ?? r.clock_in,
    clockOut: r.clockOut ?? r.clock_out
  }
}

export const fetchAttendance = (employeeId, date) => {
  const params = {}
  if (employeeId) params.employeeId = employeeId
  if (date) params.date = date
  return api.get('/attendance', { params }).then(r => r.data.map(toCamel))
}

export const clockIn = employeeId => api.post('/attendance/clock-in', { employeeId }).then(r => r.data)
export const clockOut = employeeId => api.post('/attendance/clock-out', { employeeId }).then(r => r.data)
