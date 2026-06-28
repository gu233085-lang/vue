import { Router } from 'express'
import pool from '../db.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

function mapRecord(r) {
  return {
    id: r.id,
    employeeId: r.employee_id,
    date: r.date,
    clockIn: r.clock_in,
    clockOut: r.clock_out
  }
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function now() {
  return new Date().toTimeString().slice(0, 5)
}

router.get('/', async (req, res) => {
  try {
    const { employeeId, date } = req.query
    let sql = 'SELECT * FROM attendance WHERE 1=1'
    const params = []
    if (employeeId) {
      sql += ' AND employee_id = ?'
      params.push(employeeId)
    }
    if (date) {
      sql += ' AND date = ?'
      params.push(date)
    }
    sql += ' ORDER BY date DESC'
    const [rows] = await pool.query(sql, params)
    res.json(rows.map(mapRecord))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch attendance' })
  }
})

router.post('/clock-in', async (req, res) => {
  try {
    const { employeeId } = req.body
    const d = today()

    const [existing] = await pool.query('SELECT * FROM attendance WHERE employee_id = ? AND date = ?', [employeeId, d])
    if (existing.length > 0 && existing[0].clock_in) {
      return res.json({ ok: false, error: '今天已打卡' })
    }

    if (existing.length > 0) {
      await pool.query('UPDATE attendance SET clock_in = ? WHERE employee_id = ? AND date = ?', [now(), employeeId, d])
    } else {
      await pool.query('INSERT INTO attendance (employee_id, date, clock_in) VALUES (?, ?, ?)', [employeeId, d, now()])
    }
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ ok: false, error: '打卡失败' })
  }
})

router.post('/clock-out', async (req, res) => {
  try {
    const { employeeId } = req.body
    const d = today()

    const [existing] = await pool.query('SELECT * FROM attendance WHERE employee_id = ? AND date = ?', [employeeId, d])
    if (existing.length === 0 || !existing[0].clock_in) {
      return res.json({ ok: false, error: '请先打卡上班' })
    }
    if (existing[0].clock_out) {
      return res.json({ ok: false, error: '今天已签退' })
    }

    await pool.query('UPDATE attendance SET clock_out = ? WHERE employee_id = ? AND date = ?', [now(), employeeId, d])
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ ok: false, error: '签退失败' })
  }
})

export default router
