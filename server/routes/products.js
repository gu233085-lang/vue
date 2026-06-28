import { Router } from 'express'
import pool from '../db.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

function mapProduct(p) {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    sellPrice: Number(p.sell_price),
    costPrice: Number(p.cost_price),
    stock: p.stock,
    unit: p.unit,
    threshold: p.threshold,
    createdAt: p.created_at,
    updatedAt: p.updated_at
  }
}

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY id')
    res.json(rows.map(mapProduct))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { name, category, sellPrice, costPrice, stock, unit, threshold } = req.body
    const [result] = await pool.query(
      'INSERT INTO products (name, category, sell_price, cost_price, stock, unit, threshold) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, category, sellPrice, costPrice, stock, unit, threshold]
    )
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId])
    res.status(201).json(mapProduct(rows[0]))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create product' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, category, sellPrice, costPrice, stock, unit, threshold } = req.body
    await pool.query(
      'UPDATE products SET name=?, category=?, sell_price=?, cost_price=?, stock=?, unit=?, threshold=? WHERE id=?',
      [name, category, sellPrice, costPrice, stock, unit, threshold, id]
    )
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id])
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' })
    res.json(mapProduct(rows[0]))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update product' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await pool.query('DELETE FROM products WHERE id = ?', [id])
    res.json({ success: true })
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ error: '该商品存在关联的销售或进货记录，无法删除' })
    }
    console.error(err)
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

export default router
