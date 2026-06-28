import mysql from 'mysql2/promise'
import config from './config.js'

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database
})

function rand(min, max) { return +(min + Math.random() * (max - min)).toFixed(2) }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function ts(daysAgo, hour, min) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, min, randInt(0, 59), 0)
  return d.toISOString().slice(0, 19).replace('T', ' ')
}

async function run() {
  console.log('Clearing existing data...')
  await pool.query('DELETE FROM sales')
  await pool.query('DELETE FROM purchases')
  await pool.query('DELETE FROM attendance')

  // Set realistic stock levels (much higher to handle 7 days of sales)
  console.log('Setting inventory...')
  const stockLevels = {
    1: 5000, 2: 4000, 3: 3000, 4: 2000, 5: 1500, 6: 2500,
    7: 12000, 8: 5000, 9: 10000, 10: 4000, 11: 3000, 12: 2500,
    13: 2000, 14: 800, 15: 2500, 16: 1200, 17: 500, 18: 1200,
    19: 5000, 20: 1500, 21: 2000, 22: 3000, 23: 1200, 24: 3000,
    25: 1000, 26: 500, 27: 300, 28: 800, 29: 600, 30: 500,
    31: 2000, 32: 1000, 33: 4000, 34: 800, 35: 2000, 36: 1200
  }
  for (const [id, stock] of Object.entries(stockLevels)) {
    await pool.query('UPDATE products SET stock = ? WHERE id = ?', [stock, id])
  }

  const cashiers = ['张三', '赵六']
  const products = [
    { id: 1, name: '红富士苹果', price: 8.8, cat: '水果' },
    { id: 2, name: '进口香蕉', price: 5.9, cat: '水果' },
    { id: 3, name: '赣南脐橙', price: 7.5, cat: '水果' },
    { id: 4, name: '巨峰葡萄', price: 12.9, cat: '水果' },
    { id: 5, name: '海南芒果', price: 15.8, cat: '水果' },
    { id: 6, name: '库尔勒香梨', price: 9.9, cat: '水果' },
    // cheap daily veg - high volume
    { id: 7, name: '大白菜', price: 2.5, cat: '蔬菜' },
    { id: 8, name: '西红柿', price: 4.5, cat: '蔬菜' },
    { id: 9, name: '土豆', price: 3.0, cat: '蔬菜' },
    { id: 10, name: '黄瓜', price: 3.5, cat: '蔬菜' },
    { id: 11, name: '茄子', price: 4.0, cat: '蔬菜' },
    { id: 12, name: '青椒', price: 5.5, cat: '蔬菜' },
    { id: 13, name: '猪五花肉', price: 25.8, cat: '肉类' },
    { id: 14, name: '牛腱子肉', price: 45.9, cat: '肉类' },
    { id: 15, name: '鸡胸肉', price: 12.9, cat: '肉类' },
    { id: 16, name: '猪排骨', price: 35.8, cat: '肉类' },
    { id: 17, name: '羊腿肉', price: 48.0, cat: '肉类' },
    { id: 18, name: '鸭肉', price: 15.8, cat: '肉类' },
    { id: 19, name: '维达抽纸三连包', price: 15.9, cat: '生活用品' },
    { id: 20, name: '海飞丝洗发水', price: 39.9, cat: '生活用品' },
    { id: 21, name: '蓝月亮洗衣液', price: 29.9, cat: '生活用品' },
    { id: 22, name: '高露洁牙膏', price: 12.9, cat: '生活用品' },
    { id: 23, name: '舒肤佳沐浴露', price: 25.9, cat: '生活用品' },
    { id: 24, name: '立白洗洁精', price: 9.9, cat: '生活用品' },
    { id: 25, name: '带鱼', price: 18.8, cat: '鱼类' },
    { id: 26, name: '鲈鱼', price: 28.0, cat: '鱼类' },
    { id: 27, name: '三文鱼', price: 68.0, cat: '鱼类' },
    { id: 28, name: '草鱼', price: 12.8, cat: '鱼类' },
    { id: 29, name: '鲫鱼', price: 15.0, cat: '鱼类' },
    { id: 30, name: '黄花鱼', price: 22.8, cat: '鱼类' },
    { id: 31, name: '纯棉圆领T恤', price: 49.9, cat: '服装' },
    { id: 32, name: '弹力牛仔裤', price: 89.9, cat: '服装' },
    { id: 33, name: '纯棉运动袜', price: 9.9, cat: '服装' },
    { id: 34, name: '休闲运动鞋', price: 129.0, cat: '服装' },
    { id: 35, name: '防晒冰袖', price: 15.9, cat: '服装' },
    { id: 36, name: '保暖内衣套装', price: 79.9, cat: '服装' }
  ]

  // Product frequency tiers for realistic shopping patterns
  const highFreq = [1, 2, 7, 8, 9, 10, 13, 15, 18, 19, 22, 24, 33]
  const medFreq = [3, 4, 6, 11, 12, 16, 21, 25, 28, 29, 31, 35]
  const lowFreq = [5, 14, 17, 20, 23, 26, 27, 30, 32, 34, 36]

  // Track sales quantity per product to generate matching purchases
  const salesPerProduct = {} // productId -> totalQuantitySold

  // Generate sales - aim for daily revenue ¥15,000-25,000
  console.log('Generating sales...')
  const salesInserts = []

  for (let day = 6; day >= 0; day--) {
    // Target: ¥15,000-22,000 per day, ~100-150 transactions averaging ¥130-180 each
    const targetRevenue = rand(15000, 22000)
    let dayRevenue = 0
    const daySalesInserts = []

    // Generate a mix of small, medium, and large transactions
    // 30% small (¥30-80), 40% medium (¥80-200), 20% large (¥200-500), 10% very large (¥500-1200)
    let txCount = 0
    while (dayRevenue < targetRevenue) {
      txCount++
      // Pick transaction size tier
      const tier = Math.random()
      let targetAmount
      if (tier < 0.30) targetAmount = rand(30, 80)
      else if (tier < 0.70) targetAmount = rand(80, 200)
      else if (tier < 0.90) targetAmount = rand(200, 500)
      else targetAmount = rand(500, 1200)

      // Pick 1-3 products for this transaction
      const itemsInTx = Math.random() < 0.3 ? randInt(2, 3) : 1
      const txProducts = []
      let txAmount = 0

      for (let j = 0; j < itemsInTx; j++) {
        let poolArr
        const r = Math.random()
        if (r < 0.55) poolArr = highFreq
        else if (r < 0.85) poolArr = medFreq
        else poolArr = lowFreq

        const prodIdx = poolArr[randInt(0, poolArr.length - 1)]
        const prod = products[prodIdx - 1]

        // Calculate quantity to help reach target
        const remainingForItem = (targetAmount - txAmount) / (itemsInTx - j)
        let qty = Math.max(1, Math.round(remainingForItem / prod.price))
        // Add some randomness
        qty = randInt(Math.max(1, qty - 2), qty + 3)

        const amount = +(qty * prod.price).toFixed(2)
        txAmount += amount

        txProducts.push({ prod, qty, amount })

        // Track sales for purchase planning
        salesPerProduct[prod.id] = (salesPerProduct[prod.id] || 0) + qty
      }

      // If total is too low, boost the last item
      if (txAmount < targetAmount * 0.5 && txProducts.length > 0) {
        const last = txProducts[txProducts.length - 1]
        const extraQty = Math.round((targetAmount * 0.7 - txAmount) / last.prod.price)
        if (extraQty > 0) {
          last.qty += extraQty
          last.amount = +(last.qty * last.prod.price).toFixed(2)
          txAmount = txProducts.reduce((s, t) => s + t.amount, 0)
          salesPerProduct[last.prod.id] += extraQty
        }
      }

      dayRevenue += txAmount
      const hour = randInt(7, 21)
      const minute = randInt(0, 59)
      const cashier = cashiers[randInt(0, 1)]

      for (const item of txProducts) {
        daySalesInserts.push([
          item.prod.id, item.prod.name, item.qty, item.prod.price, item.amount,
          cashier, ts(day, hour, minute)
        ])
      }
    }
    // Sort by time
    daySalesInserts.sort((a, b) => a[6].localeCompare(b[6]))
    salesInserts.push(...daySalesInserts)
    console.log(`  Day ${6-day+1}: ${txCount} transactions (${daySalesInserts.length} line items), ¥${dayRevenue.toFixed(2)}`)
  }

  // Batch insert sales
  console.log(`Inserting ${salesInserts.length} sales records...`)
  let batch = []
  for (const s of salesInserts) {
    batch.push(s)
    if (batch.length >= 200) {
      await pool.query(
        'INSERT INTO sales (product_id, product_name, quantity, unit_price, total_amount, cashier, created_at) VALUES ?',
        [batch]
      )
      batch = []
    }
  }
  if (batch.length > 0) {
    await pool.query(
      'INSERT INTO sales (product_id, product_name, quantity, unit_price, total_amount, cashier, created_at) VALUES ?',
      [batch]
    )
  }

  // Generate purchases (restock to cover sales + buffer)
  console.log('Generating purchases...')
  const suppliers = ['农副产品批发市场', '城北蔬菜基地', '双汇冷鲜肉', '恒安纸业', '宝洁经销商', '海鲜批发市场', '服装城批发商']
  const purchaseInserts = []

  // Generate daily restocking purchases
  for (let day = 7; day >= 1; day--) {
    // 5-8 purchase orders per day
    const purCount = randInt(5, 8)
    const dayPurProdIds = new Set()

    for (let i = 0; i < purCount; i++) {
      // Prioritize high-frequency products that are running low
      let prodId
      if (Math.random() < 0.7) {
        prodId = highFreq[randInt(0, highFreq.length - 1)]
      } else if (Math.random() < 0.7) {
        prodId = medFreq[randInt(0, medFreq.length - 1)]
      } else {
        prodId = lowFreq[randInt(0, lowFreq.length - 1)]
      }

      if (dayPurProdIds.has(prodId)) continue // don't restock same product twice in a day
      dayPurProdIds.add(prodId)

      const prod = products[prodId - 1]
      // Restock enough to cover ~2 days of sales
      const dailySales = (salesPerProduct[prodId] || 0) / 7
      const restockQty = Math.max(50, Math.round(dailySales * rand(3, 6)))

      const costPrice = +(prod.price * rand(0.48, 0.68)).toFixed(2)
      const totalCost = +(restockQty * costPrice).toFixed(2)
      const supplier = suppliers[randInt(0, suppliers.length - 1)]

      purchaseInserts.push([
        prodId, prod.name, restockQty, costPrice, totalCost,
        supplier, ts(day, randInt(5, 9), randInt(0, 59))
      ])
    }
  }

  // Batch insert purchases
  console.log(`Inserting ${purchaseInserts.length} purchase records...`)
  batch = []
  for (const p of purchaseInserts) {
    batch.push(p)
    if (batch.length >= 100) {
      await pool.query(
        'INSERT INTO purchases (product_id, product_name, quantity, cost_price, total_cost, supplier, created_at) VALUES ?',
        [batch]
      )
      batch = []
    }
  }
  if (batch.length > 0) {
    await pool.query(
      'INSERT INTO purchases (product_id, product_name, quantity, cost_price, total_cost, supplier, created_at) VALUES ?',
      [batch]
    )
  }

  // Apply stock changes: + purchases, - sales
  console.log('Updating stock...')
  // Add purchases
  for (const p of purchaseInserts) {
    await pool.query('UPDATE products SET stock = stock + ? WHERE id = ?', [p[2], p[0]])
  }
  // Deduct sales
  for (const s of salesInserts) {
    await pool.query('UPDATE products SET stock = GREATEST(stock - ?, 0) WHERE id = ?', [s[2], s[0]])
  }

  // Verify no negative stock and print summary
  console.log('\n=== Final Summary ===')
  const [daily] = await pool.query('SELECT DATE(created_at) as d, COUNT(*) as tx, SUM(total_amount) as rev FROM sales GROUP BY DATE(created_at) ORDER BY d')
  let totalRev = 0
  daily.forEach(r => {
    const rev = Number(r.rev)
    totalRev += rev
    const dayName = new Date(r.d).toLocaleDateString('zh-CN', { weekday: 'short', month: 'numeric', day: 'numeric' })
    console.log(`${dayName} | ${String(r.tx).padStart(3)} 笔 | ¥${rev.toFixed(2)}`)
  })

  const [lowStock] = await pool.query('SELECT id,name,stock,threshold FROM products WHERE stock <= threshold')
  if (lowStock.length > 0) {
    console.log(`\n⚠ ${lowStock.length} low-stock items:`)
    lowStock.forEach(p => console.log(`  ${p.name}: stock ${p.stock} (threshold ${p.threshold})`))
  } else {
    console.log('\n✓ All products have sufficient stock')
  }

  const [totalPur] = await pool.query('SELECT COUNT(*) as c, SUM(total_cost) as tc FROM purchases')
  console.log(`\nTotal: ${salesInserts.length} sales (¥${totalRev.toFixed(2)}), ${purchaseInserts.length} purchases (¥${Number(totalPur[0].tc).toFixed(2)})`)
  console.log('Done!')

  await pool.end()
}

run().catch(err => { console.error(err); process.exit(1) })
