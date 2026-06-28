import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import config from './config.js'

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  multipleStatements: true
})

function ts(daysAgo, hour, min) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, min, 0, 0)
  return d.toISOString().slice(0, 19).replace('T', ' ')
}

async function run() {
  // Create database
  await pool.query("CREATE DATABASE IF NOT EXISTS supermarket DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
  await pool.query("USE supermarket")

  // Create tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      category VARCHAR(50) NOT NULL,
      sell_price DECIMAL(10,2) NOT NULL DEFAULT 0,
      cost_price DECIMAL(10,2) NOT NULL DEFAULT 0,
      stock INT NOT NULL DEFAULT 0,
      unit VARCHAR(20) NOT NULL DEFAULT '',
      threshold INT NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sales (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      product_name VARCHAR(100) NOT NULL,
      quantity INT NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      cashier VARCHAR(50) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS purchases (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      product_name VARCHAR(100) NOT NULL,
      quantity INT NOT NULL,
      cost_price DECIMAL(10,2) NOT NULL,
      total_cost DECIMAL(10,2) NOT NULL,
      supplier VARCHAR(100) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS employees (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      employee_no VARCHAR(20) NOT NULL UNIQUE,
      position VARCHAR(50) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      hire_date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      date DATE NOT NULL,
      clock_in TIME NULL,
      clock_out TIME NULL,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      UNIQUE KEY unique_emp_date (employee_id, date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(100) DEFAULT '',
      role VARCHAR(20) DEFAULT 'admin'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS verification_codes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(100) NOT NULL,
      code VARCHAR(5) NOT NULL,
      expires_at DATETIME NOT NULL,
      used TINYINT(1) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_email_code (email, code)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  // Insert default admin
  const hash = bcrypt.hashSync('admin123', 10)
  await pool.query(`INSERT IGNORE INTO users (username, password, email, role) VALUES (?, ?, ?, 'admin')`, ['admin', hash, 'admin@supermarket.com'])

  // Seed products
  const products = [
    [1, '红富士苹果', '水果', 8.8, 5.5, 150, '斤', 20],
    [2, '进口香蕉', '水果', 5.9, 3.5, 200, '斤', 30],
    [3, '赣南脐橙', '水果', 7.5, 4.8, 120, '斤', 15],
    [4, '巨峰葡萄', '水果', 12.9, 8.0, 6, '斤', 10],
    [5, '海南芒果', '水果', 15.8, 10.5, 5, '斤', 8],
    [6, '库尔勒香梨', '水果', 9.9, 6.5, 80, '斤', 12],
    [7, '大白菜', '蔬菜', 2.5, 1.2, 300, '斤', 50],
    [8, '西红柿', '蔬菜', 4.5, 2.8, 15, '斤', 25],
    [9, '土豆', '蔬菜', 3.0, 1.5, 250, '斤', 30],
    [10, '黄瓜', '蔬菜', 3.5, 2.0, 160, '斤', 20],
    [11, '茄子', '蔬菜', 4.0, 2.5, 100, '斤', 15],
    [12, '青椒', '蔬菜', 5.5, 3.5, 8, '斤', 12],
    [13, '猪五花肉', '肉类', 25.8, 18.0, 50, '斤', 8],
    [14, '牛腱子肉', '肉类', 45.9, 35.0, 3, '斤', 5],
    [15, '鸡胸肉', '肉类', 12.9, 8.5, 80, '斤', 10],
    [16, '猪排骨', '肉类', 35.8, 26.0, 40, '斤', 6],
    [17, '羊腿肉', '肉类', 48.0, 38.0, 3, '斤', 5],
    [18, '鸭肉', '肉类', 15.8, 10.5, 55, '斤', 8],
    [19, '维达抽纸三连包', '生活用品', 15.9, 10.0, 200, '提', 30],
    [20, '海飞丝洗发水', '生活用品', 39.9, 28.0, 6, '瓶', 10],
    [21, '蓝月亮洗衣液', '生活用品', 29.9, 21.0, 60, '瓶', 10],
    [22, '高露洁牙膏', '生活用品', 12.9, 8.0, 150, '支', 20],
    [23, '舒肤佳沐浴露', '生活用品', 25.9, 18.0, 5, '瓶', 10],
    [24, '立白洗洁精', '生活用品', 9.9, 6.0, 180, '瓶', 25],
    [25, '带鱼', '鱼类', 18.8, 12.0, 40, '斤', 8],
    [26, '鲈鱼', '鱼类', 28.0, 20.0, 3, '斤', 5],
    [27, '三文鱼', '鱼类', 68.0, 50.0, 2, '斤', 3],
    [28, '草鱼', '鱼类', 12.8, 8.0, 50, '斤', 8],
    [29, '鲫鱼', '鱼类', 15.0, 10.0, 45, '斤', 6],
    [30, '黄花鱼', '鱼类', 22.8, 16.0, 35, '斤', 5],
    [31, '纯棉圆领T恤', '服装', 49.9, 30.0, 120, '件', 15],
    [32, '弹力牛仔裤', '服装', 89.9, 55.0, 6, '条', 10],
    [33, '纯棉运动袜', '服装', 9.9, 5.0, 300, '双', 30],
    [34, '休闲运动鞋', '服装', 129.0, 85.0, 5, '双', 8],
    [35, '防晒冰袖', '服装', 15.9, 8.0, 200, '双', 20],
    [36, '保暖内衣套装', '服装', 79.9, 50.0, 60, '套', 10]
  ]
  for (const [id, name, category, sellPrice, costPrice, stock, unit, threshold] of products) {
    await pool.query(
      `INSERT IGNORE INTO products (id, name, category, sell_price, cost_price, stock, unit, threshold) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, category, sellPrice, costPrice, stock, unit, threshold]
    )
  }
  await pool.query('ALTER TABLE products AUTO_INCREMENT = 37')

  // Seed employees
  const employees = [
    [1, '张三', 'SM001', '收银员', '13800001111', '2025-03-15'],
    [2, '李四', 'SM002', '理货员', '13800002222', '2025-06-01'],
    [3, '王五', 'SM003', '店长', '13800003333', '2024-01-10'],
    [4, '赵六', 'SM004', '收银员', '13800004444', '2025-09-20'],
    [5, '孙七', 'SM005', '采购员', '13800005555', '2026-02-14']
  ]
  for (const [id, name, eno, pos, phone, hd] of employees) {
    await pool.query(
      `INSERT IGNORE INTO employees (id, name, employee_no, position, phone, hire_date) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, name, eno, pos, phone, hd]
    )
  }
  await pool.query('ALTER TABLE employees AUTO_INCREMENT = 6')

  // Seed sales
  const sales = [
    [1, '红富士苹果', 3, 8.8, 26.4, '张三', ts(0, 8, 15)],
    [2, '进口香蕉', 2, 5.9, 11.8, '张三', ts(0, 8, 30)],
    [7, '大白菜', 5, 2.5, 12.5, '赵六', ts(0, 9, 10)],
    [13, '猪五花肉', 2, 25.8, 51.6, '张三', ts(0, 10, 20)],
    [9, '土豆', 4, 3.0, 12.0, '赵六', ts(0, 11, 5)],
    [19, '维达抽纸三连包', 1, 15.9, 15.9, '赵六', ts(0, 12, 45)],
    [33, '纯棉运动袜', 3, 9.9, 29.7, '张三', ts(0, 14, 0)],
    [22, '高露洁牙膏', 2, 12.9, 25.8, '张三', ts(0, 15, 30)],
    [15, '鸡胸肉', 2, 12.9, 25.8, '赵六', ts(0, 16, 20)],
    [1, '红富士苹果', 5, 8.8, 44.0, '张三', ts(0, 17, 50)],
    [3, '赣南脐橙', 3, 7.5, 22.5, '赵六', ts(0, 18, 30)],
    [31, '纯棉圆领T恤', 1, 49.9, 49.9, '张三', ts(0, 19, 15)],
    [2, '进口香蕉', 4, 5.9, 23.6, '赵六', ts(1, 9, 0)],
    [13, '猪五花肉', 1, 25.8, 25.8, '张三', ts(1, 10, 30)],
    [7, '大白菜', 3, 2.5, 7.5, '张三', ts(1, 11, 45)],
    [28, '草鱼', 2, 12.8, 25.6, '赵六', ts(1, 13, 20)],
    [24, '立白洗洁精', 1, 9.9, 9.9, '张三', ts(1, 16, 0)],
    [6, '库尔勒香梨', 3, 9.9, 29.7, '赵六', ts(1, 18, 10)],
    [15, '鸡胸肉', 3, 12.9, 38.7, '张三', ts(2, 8, 40)],
    [11, '茄子', 2, 4.0, 8.0, '赵六', ts(2, 10, 15)],
    [35, '防晒冰袖', 2, 15.9, 31.8, '张三', ts(2, 12, 0)],
    [25, '带鱼', 3, 18.8, 56.4, '赵六', ts(2, 15, 30)],
    [1, '红富士苹果', 4, 8.8, 35.2, '赵六', ts(3, 9, 20)],
    [9, '土豆', 6, 3.0, 18.0, '张三', ts(3, 10, 0)],
    [16, '猪排骨', 1, 35.8, 35.8, '张三', ts(3, 14, 45)],
    [18, '鸭肉', 2, 15.8, 31.6, '赵六', ts(3, 17, 30)],
    [10, '黄瓜', 3, 3.5, 10.5, '张三', ts(4, 8, 50)],
    [31, '纯棉圆领T恤', 2, 49.9, 99.8, '赵六', ts(4, 11, 15)],
    [29, '鲫鱼', 2, 15.0, 30.0, '张三', ts(4, 16, 10)],
    [3, '赣南脐橙', 2, 7.5, 15.0, '赵六', ts(5, 9, 30)],
    [13, '猪五花肉', 3, 25.8, 77.4, '张三', ts(5, 12, 0)],
    [21, '蓝月亮洗衣液', 1, 29.9, 29.9, '赵六', ts(5, 15, 40)],
    [2, '进口香蕉', 3, 5.9, 17.7, '张三', ts(6, 8, 15)],
    [33, '纯棉运动袜', 5, 9.9, 49.5, '赵六', ts(6, 10, 45)],
    [28, '草鱼', 1, 12.8, 12.8, '张三', ts(6, 14, 20)],
    [19, '维达抽纸三连包', 2, 15.9, 31.8, '张三', ts(6, 17, 0)]
  ]
  for (const [pid, pname, qty, up, ta, cashier, created] of sales) {
    await pool.query(
      `INSERT IGNORE INTO sales (product_id, product_name, quantity, unit_price, total_amount, cashier, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [pid, pname, qty, up, ta, cashier, created]
    )
  }

  // Seed purchases
  const purchases = [
    [1, '红富士苹果', 80, 5.5, 440.0, '农副产品批发市场', ts(5, 8, 0)],
    [7, '大白菜', 200, 1.2, 240.0, '城北蔬菜基地', ts(5, 9, 30)],
    [13, '猪五花肉', 30, 18.0, 540.0, '双汇冷鲜肉', ts(4, 7, 0)],
    [15, '鸡胸肉', 50, 8.5, 425.0, '双汇冷鲜肉', ts(4, 8, 30)],
    [19, '维达抽纸三连包', 100, 10.0, 1000.0, '恒安纸业', ts(3, 10, 0)],
    [22, '高露洁牙膏', 80, 8.0, 640.0, '宝洁经销商', ts(3, 11, 20)],
    [25, '带鱼', 30, 12.0, 360.0, '海鲜批发市场', ts(2, 6, 0)],
    [28, '草鱼', 40, 8.0, 320.0, '海鲜批发市场', ts(2, 7, 15)],
    [31, '纯棉圆领T恤', 60, 30.0, 1800.0, '服装城批发商', ts(1, 9, 0)],
    [33, '纯棉运动袜', 200, 5.0, 1000.0, '服装城批发商', ts(1, 10, 30)],
    [9, '土豆', 150, 1.5, 225.0, '城北蔬菜基地', ts(0, 6, 30)],
    [2, '进口香蕉', 100, 3.5, 350.0, '农副产品批发市场', ts(0, 7, 45)]
  ]
  for (const [pid, pname, qty, cp, tc, supplier, created] of purchases) {
    await pool.query(
      `INSERT IGNORE INTO purchases (product_id, product_name, quantity, cost_price, total_cost, supplier, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [pid, pname, qty, cp, tc, supplier, created]
    )
  }

  console.log('Database setup complete!')
  console.log('- 36 products seeded')
  console.log('- 5 employees seeded')
  console.log('- 36 sales records seeded')
  console.log('- 12 purchases seeded')
  console.log('- Default admin: admin / admin123')
  await pool.end()
}

run().catch(err => {
  console.error('Setup failed:', err)
  process.exit(1)
})
