import { Router } from 'express'
import pool from '../db.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

function mapSale(s) {
  return {
    id: s.id,
    productId: s.product_id,
    productName: s.product_name,
    quantity: s.quantity,
    unitPrice: Number(s.unit_price),
    totalAmount: Number(s.total_amount),
    cashier: s.cashier,
    createdAt: s.created_at
  }
}

router.get('/', async (req, res) => {
  try {
    const { start, end } = req.query
    let sql = 'SELECT * FROM sales'
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
    res.json(rows.map(mapSale))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch sales' })
  }
})

router.post('/', async (req, res) => {
  const conn = await pool.getConnection()
  try {
    const { productId, productName, quantity, unitPrice, cashier } = req.body
    const totalAmount = +(quantity * unitPrice).toFixed(2)

    await conn.beginTransaction()

    const [products] = await conn.query('SELECT stock FROM products WHERE id = ? FOR UPDATE', [productId])
    if (products.length === 0) {
      await conn.rollback()
      return res.status(400).json({ ok: false, error: '商品不存在' })
    }
    if (products[0].stock < quantity) {
      await conn.rollback()
      return res.status(400).json({ ok: false, error: '库存不足' })
    }

    await conn.query(
      'INSERT INTO sales (product_id, product_name, quantity, unit_price, total_amount, cashier) VALUES (?, ?, ?, ?, ?, ?)',
      [productId, productName, quantity, unitPrice, totalAmount, cashier]
    )
    await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [quantity, productId])

    await conn.commit()
    res.status(201).json({ ok: true })
  } catch (err) {
    await conn.rollback()
    console.error(err)
    res.status(500).json({ ok: false, error: 'Failed to create sale' })
  } finally {
    conn.release()
  }
})

export default router
