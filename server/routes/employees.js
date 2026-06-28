import { Router } from 'express'
import pool from '../db.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

function mapEmployee(e) {
  return {
    id: e.id,
    name: e.name,
    employeeNo: e.employee_no,
    position: e.position,
    phone: e.phone,
    hireDate: e.hire_date,
    createdAt: e.created_at
  }
}

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM employees ORDER BY id')
    res.json(rows.map(mapEmployee))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch employees' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { name, employeeNo, position, phone, hireDate } = req.body
    const [result] = await pool.query(
      'INSERT INTO employees (name, employee_no, position, phone, hire_date) VALUES (?, ?, ?, ?, ?)',
      [name, employeeNo, position, phone, hireDate]
    )
    const [rows] = await pool.query('SELECT * FROM employees WHERE id = ?', [result.insertId])
    res.status(201).json(mapEmployee(rows[0]))
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: '员工编号已存在' })
    }
    console.error(err)
    res.status(500).json({ error: 'Failed to create employee' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, employeeNo, position, phone, hireDate } = req.body
    await pool.query(
      'UPDATE employees SET name=?, employee_no=?, position=?, phone=?, hire_date=? WHERE id=?',
      [name, employeeNo, position, phone, hireDate, id]
    )
    const [rows] = await pool.query('SELECT * FROM employees WHERE id = ?', [id])
    if (rows.length === 0) return res.status(404).json({ error: 'Employee not found' })
    res.json(mapEmployee(rows[0]))
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: '员工编号已存在' })
    }
    console.error(err)
    res.status(500).json({ error: 'Failed to update employee' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await pool.query('DELETE FROM employees WHERE id = ?', [id])
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete employee' })
  }
})

export default router
