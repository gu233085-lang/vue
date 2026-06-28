import { Router } from 'express'
import pool from '../db.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

function mapPurchase(p) {
  return {
    id: p.id,
    productId: p.product_id,
    productName: p.product_name,
    quantity: p.quantity,
    costPrice: Number(p.cost_price),
    totalCost: Number(p.total_cost),
    supplier: p.supplier,
    createdAt: p.created_at
  }
}

router.get('/', async (req, res) => {
  try {
    const { start, end } = req.query
    let sql = 'SELECT * FROM purchases'
    const params = []
    if (start && end) {
      sql += ' WHERE DATE(created_at) BETWEEN ? AND ?'
      params.push(start, end)
    } else if (start) {
      sql += ' WHERE DATE(created_at) >= ?'
      params.push(start)
    } else if (end) {
      sql += ' WHERE DATE(created_at) <= ?'
      params.push(end)
    }
    sql += ' ORDER BY created_at DESC'
    const [rows] = await pool.query(sql, params)
    res.json(rows.map(mapPurchase))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch purchases' })
  }
})

router.post('/', async (req, res) => {
  const conn = await pool.getConnection()
  try {
    const { productId, productName, quantity, costPrice, supplier } = req.body
    const totalCost = +(quantity * costPrice).toFixed(2)

    await conn.beginTransaction()

    await conn.query(
      'INSERT INTO purchases (product_id, product_name, quantity, cost_price, total_cost, supplier) VALUES (?, ?, ?, ?, ?, ?)',
      [productId, productName, quantity, costPrice, totalCost, supplier]
    )
    await conn.query('UPDATE products SET stock = stock + ? WHERE id = ?', [quantity, productId])

    await conn.commit()
    res.status(201).json({ ok: true })
  } catch (err) {
    await conn.rollback()
    console.error(err)
    res.status(500).json({ ok: false, error: 'Failed to create purchase' })
  } finally {
    conn.release()
  }
})

export default router
