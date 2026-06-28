export function seedProducts() {
  return [
    // 水果
    { id: 1, name: '红富士苹果', category: '水果', sellPrice: 8.8, costPrice: 5.5, stock: 150, unit: '斤', threshold: 20 },
    { id: 2, name: '进口香蕉', category: '水果', sellPrice: 5.9, costPrice: 3.5, stock: 200, unit: '斤', threshold: 30 },
    { id: 3, name: '赣南脐橙', category: '水果', sellPrice: 7.5, costPrice: 4.8, stock: 120, unit: '斤', threshold: 15 },
    { id: 4, name: '巨峰葡萄', category: '水果', sellPrice: 12.9, costPrice: 8.0, stock: 6, unit: '斤', threshold: 10 },
    { id: 5, name: '海南芒果', category: '水果', sellPrice: 15.8, costPrice: 10.5, stock: 5, unit: '斤', threshold: 8 },
    { id: 6, name: '库尔勒香梨', category: '水果', sellPrice: 9.9, costPrice: 6.5, stock: 80, unit: '斤', threshold: 12 },
    // 蔬菜
    { id: 7, name: '大白菜', category: '蔬菜', sellPrice: 2.5, costPrice: 1.2, stock: 300, unit: '斤', threshold: 50 },
    { id: 8, name: '西红柿', category: '蔬菜', sellPrice: 4.5, costPrice: 2.8, stock: 15, unit: '斤', threshold: 25 },
    { id: 9, name: '土豆', category: '蔬菜', sellPrice: 3.0, costPrice: 1.5, stock: 250, unit: '斤', threshold: 30 },
    { id: 10, name: '黄瓜', category: '蔬菜', sellPrice: 3.5, costPrice: 2.0, stock: 160, unit: '斤', threshold: 20 },
    { id: 11, name: '茄子', category: '蔬菜', sellPrice: 4.0, costPrice: 2.5, stock: 100, unit: '斤', threshold: 15 },
    { id: 12, name: '青椒', category: '蔬菜', sellPrice: 5.5, costPrice: 3.5, stock: 8, unit: '斤', threshold: 12 },
    // 肉类
    { id: 13, name: '猪五花肉', category: '肉类', sellPrice: 25.8, costPrice: 18.0, stock: 50, unit: '斤', threshold: 8 },
    { id: 14, name: '牛腱子肉', category: '肉类', sellPrice: 45.9, costPrice: 35.0, stock: 3, unit: '斤', threshold: 5 },
    { id: 15, name: '鸡胸肉', category: '肉类', sellPrice: 12.9, costPrice: 8.5, stock: 80, unit: '斤', threshold: 10 },
    { id: 16, name: '猪排骨', category: '肉类', sellPrice: 35.8, costPrice: 26.0, stock: 40, unit: '斤', threshold: 6 },
    { id: 17, name: '羊腿肉', category: '肉类', sellPrice: 48.0, costPrice: 38.0, stock: 3, unit: '斤', threshold: 5 },
    { id: 18, name: '鸭肉', category: '肉类', sellPrice: 15.8, costPrice: 10.5, stock: 55, unit: '斤', threshold: 8 },
    // 生活用品
    { id: 19, name: '维达抽纸三连包', category: '生活用品', sellPrice: 15.9, costPrice: 10.0, stock: 200, unit: '提', threshold: 30 },
    { id: 20, name: '海飞丝洗发水', category: '生活用品', sellPrice: 39.9, costPrice: 28.0, stock: 6, unit: '瓶', threshold: 10 },
    { id: 21, name: '蓝月亮洗衣液', category: '生活用品', sellPrice: 29.9, costPrice: 21.0, stock: 60, unit: '瓶', threshold: 10 },
    { id: 22, name: '高露洁牙膏', category: '生活用品', sellPrice: 12.9, costPrice: 8.0, stock: 150, unit: '支', threshold: 20 },
    { id: 23, name: '舒肤佳沐浴露', category: '生活用品', sellPrice: 25.9, costPrice: 18.0, stock: 5, unit: '瓶', threshold: 10 },
    { id: 24, name: '立白洗洁精', category: '生活用品', sellPrice: 9.9, costPrice: 6.0, stock: 180, unit: '瓶', threshold: 25 },
    // 鱼类
    { id: 25, name: '带鱼', category: '鱼类', sellPrice: 18.8, costPrice: 12.0, stock: 40, unit: '斤', threshold: 8 },
    { id: 26, name: '鲈鱼', category: '鱼类', sellPrice: 28.0, costPrice: 20.0, stock: 3, unit: '斤', threshold: 5 },
    { id: 27, name: '三文鱼', category: '鱼类', sellPrice: 68.0, costPrice: 50.0, stock: 2, unit: '斤', threshold: 3 },
    { id: 28, name: '草鱼', category: '鱼类', sellPrice: 12.8, costPrice: 8.0, stock: 50, unit: '斤', threshold: 8 },
    { id: 29, name: '鲫鱼', category: '鱼类', sellPrice: 15.0, costPrice: 10.0, stock: 45, unit: '斤', threshold: 6 },
    { id: 30, name: '黄花鱼', category: '鱼类', sellPrice: 22.8, costPrice: 16.0, stock: 35, unit: '斤', threshold: 5 },
    // 服装
    { id: 31, name: '纯棉圆领T恤', category: '服装', sellPrice: 49.9, costPrice: 30.0, stock: 120, unit: '件', threshold: 15 },
    { id: 32, name: '弹力牛仔裤', category: '服装', sellPrice: 89.9, costPrice: 55.0, stock: 6, unit: '条', threshold: 10 },
    { id: 33, name: '纯棉运动袜', category: '服装', sellPrice: 9.9, costPrice: 5.0, stock: 300, unit: '双', threshold: 30 },
    { id: 34, name: '休闲运动鞋', category: '服装', sellPrice: 129.0, costPrice: 85.0, stock: 5, unit: '双', threshold: 8 },
    { id: 35, name: '防晒冰袖', category: '服装', sellPrice: 15.9, costPrice: 8.0, stock: 200, unit: '双', threshold: 20 },
    { id: 36, name: '保暖内衣套装', category: '服装', sellPrice: 79.9, costPrice: 50.0, stock: 60, unit: '套', threshold: 10 }
  ]
}

function ts(daysAgo, hour, min) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, min, 0, 0)
  return d.toISOString()
}

export function seedSales() {
  let id = 0
  return [
    // Today
    { id: ++id, productId: 1, productName: '红富士苹果', quantity: 3, unitPrice: 8.8, totalAmount: 26.4, cashier: '张三', timestamp: ts(0, 8, 15) },
    { id: ++id, productId: 2, productName: '进口香蕉', quantity: 2, unitPrice: 5.9, totalAmount: 11.8, cashier: '张三', timestamp: ts(0, 8, 30) },
    { id: ++id, productId: 7, productName: '大白菜', quantity: 5, unitPrice: 2.5, totalAmount: 12.5, cashier: '赵六', timestamp: ts(0, 9, 10) },
    { id: ++id, productId: 13, productName: '猪五花肉', quantity: 2, unitPrice: 25.8, totalAmount: 51.6, cashier: '张三', timestamp: ts(0, 10, 20) },
    { id: ++id, productId: 9, productName: '土豆', quantity: 4, unitPrice: 3.0, totalAmount: 12.0, cashier: '赵六', timestamp: ts(0, 11, 5) },
    { id: ++id, productId: 19, productName: '维达抽纸三连包', quantity: 1, unitPrice: 15.9, totalAmount: 15.9, cashier: '赵六', timestamp: ts(0, 12, 45) },
    { id: ++id, productId: 33, productName: '纯棉运动袜', quantity: 3, unitPrice: 9.9, totalAmount: 29.7, cashier: '张三', timestamp: ts(0, 14, 0) },
    { id: ++id, productId: 22, productName: '高露洁牙膏', quantity: 2, unitPrice: 12.9, totalAmount: 25.8, cashier: '张三', timestamp: ts(0, 15, 30) },
    { id: ++id, productId: 15, productName: '鸡胸肉', quantity: 2, unitPrice: 12.9, totalAmount: 25.8, cashier: '赵六', timestamp: ts(0, 16, 20) },
    { id: ++id, productId: 1, productName: '红富士苹果', quantity: 5, unitPrice: 8.8, totalAmount: 44.0, cashier: '张三', timestamp: ts(0, 17, 50) },
    { id: ++id, productId: 3, productName: '赣南脐橙', quantity: 3, unitPrice: 7.5, totalAmount: 22.5, cashier: '赵六', timestamp: ts(0, 18, 30) },
    { id: ++id, productId: 31, productName: '纯棉圆领T恤', quantity: 1, unitPrice: 49.9, totalAmount: 49.9, cashier: '张三', timestamp: ts(0, 19, 15) },
    // 1 day ago
    { id: ++id, productId: 2, productName: '进口香蕉', quantity: 4, unitPrice: 5.9, totalAmount: 23.6, cashier: '赵六', timestamp: ts(1, 9, 0) },
    { id: ++id, productId: 13, productName: '猪五花肉', quantity: 1, unitPrice: 25.8, totalAmount: 25.8, cashier: '张三', timestamp: ts(1, 10, 30) },
    { id: ++id, productId: 7, productName: '大白菜', quantity: 3, unitPrice: 2.5, totalAmount: 7.5, cashier: '张三', timestamp: ts(1, 11, 45) },
    { id: ++id, productId: 28, productName: '草鱼', quantity: 2, unitPrice: 12.8, totalAmount: 25.6, cashier: '赵六', timestamp: ts(1, 13, 20) },
    { id: ++id, productId: 24, productName: '立白洗洁精', quantity: 1, unitPrice: 9.9, totalAmount: 9.9, cashier: '张三', timestamp: ts(1, 16, 0) },
    { id: ++id, productId: 6, productName: '库尔勒香梨', quantity: 3, unitPrice: 9.9, totalAmount: 29.7, cashier: '赵六', timestamp: ts(1, 18, 10) },
    // 2 days ago
    { id: ++id, productId: 15, productName: '鸡胸肉', quantity: 3, unitPrice: 12.9, totalAmount: 38.7, cashier: '张三', timestamp: ts(2, 8, 40) },
    { id: ++id, productId: 11, productName: '茄子', quantity: 2, unitPrice: 4.0, totalAmount: 8.0, cashier: '赵六', timestamp: ts(2, 10, 15) },
    { id: ++id, productId: 35, productName: '防晒冰袖', quantity: 2, unitPrice: 15.9, totalAmount: 31.8, cashier: '张三', timestamp: ts(2, 12, 0) },
    { id: ++id, productId: 25, productName: '带鱼', quantity: 3, unitPrice: 18.8, totalAmount: 56.4, cashier: '赵六', timestamp: ts(2, 15, 30) },
    // 3 days ago
    { id: ++id, productId: 1, productName: '红富士苹果', quantity: 4, unitPrice: 8.8, totalAmount: 35.2, cashier: '赵六', timestamp: ts(3, 9, 20) },
    { id: ++id, productId: 9, productName: '土豆', quantity: 6, unitPrice: 3.0, totalAmount: 18.0, cashier: '张三', timestamp: ts(3, 10, 0) },
    { id: ++id, productId: 16, productName: '猪排骨', quantity: 1, unitPrice: 35.8, totalAmount: 35.8, cashier: '张三', timestamp: ts(3, 14, 45) },
    { id: ++id, productId: 18, productName: '鸭肉', quantity: 2, unitPrice: 15.8, totalAmount: 31.6, cashier: '赵六', timestamp: ts(3, 17, 30) },
    // 4 days ago
    { id: ++id, productId: 10, productName: '黄瓜', quantity: 3, unitPrice: 3.5, totalAmount: 10.5, cashier: '张三', timestamp: ts(4, 8, 50) },
    { id: ++id, productId: 31, productName: '纯棉圆领T恤', quantity: 2, unitPrice: 49.9, totalAmount: 99.8, cashier: '赵六', timestamp: ts(4, 11, 15) },
    { id: ++id, productId: 29, productName: '鲫鱼', quantity: 2, unitPrice: 15.0, totalAmount: 30.0, cashier: '张三', timestamp: ts(4, 16, 10) },
    // 5 days ago
    { id: ++id, productId: 3, productName: '赣南脐橙', quantity: 2, unitPrice: 7.5, totalAmount: 15.0, cashier: '赵六', timestamp: ts(5, 9, 30) },
    { id: ++id, productId: 13, productName: '猪五花肉', quantity: 3, unitPrice: 25.8, totalAmount: 77.4, cashier: '张三', timestamp: ts(5, 12, 0) },
    { id: ++id, productId: 21, productName: '蓝月亮洗衣液', quantity: 1, unitPrice: 29.9, totalAmount: 29.9, cashier: '赵六', timestamp: ts(5, 15, 40) },
    // 6 days ago
    { id: ++id, productId: 2, productName: '进口香蕉', quantity: 3, unitPrice: 5.9, totalAmount: 17.7, cashier: '张三', timestamp: ts(6, 8, 15) },
    { id: ++id, productId: 33, productName: '纯棉运动袜', quantity: 5, unitPrice: 9.9, totalAmount: 49.5, cashier: '赵六', timestamp: ts(6, 10, 45) },
    { id: ++id, productId: 28, productName: '草鱼', quantity: 1, unitPrice: 12.8, totalAmount: 12.8, cashier: '张三', timestamp: ts(6, 14, 20) },
    { id: ++id, productId: 19, productName: '维达抽纸三连包', quantity: 2, unitPrice: 15.9, totalAmount: 31.8, cashier: '张三', timestamp: ts(6, 17, 0) }
  ]
}

export function seedPurchases() {
  let id = 0
  return [
    { id: ++id, productId: 1, productName: '红富士苹果', quantity: 80, costPrice: 5.5, totalCost: 440.0, supplier: '农副产品批发市场', timestamp: ts(5, 8, 0) },
    { id: ++id, productId: 7, productName: '大白菜', quantity: 200, costPrice: 1.2, totalCost: 240.0, supplier: '城北蔬菜基地', timestamp: ts(5, 9, 30) },
    { id: ++id, productId: 13, productName: '猪五花肉', quantity: 30, costPrice: 18.0, totalCost: 540.0, supplier: '双汇冷鲜肉', timestamp: ts(4, 7, 0) },
    { id: ++id, productId: 15, productName: '鸡胸肉', quantity: 50, costPrice: 8.5, totalCost: 425.0, supplier: '双汇冷鲜肉', timestamp: ts(4, 8, 30) },
    { id: ++id, productId: 19, productName: '维达抽纸三连包', quantity: 100, costPrice: 10.0, totalCost: 1000.0, supplier: '恒安纸业', timestamp: ts(3, 10, 0) },
    { id: ++id, productId: 22, productName: '高露洁牙膏', quantity: 80, costPrice: 8.0, totalCost: 640.0, supplier: '宝洁经销商', timestamp: ts(3, 11, 20) },
    { id: ++id, productId: 25, productName: '带鱼', quantity: 30, costPrice: 12.0, totalCost: 360.0, supplier: '海鲜批发市场', timestamp: ts(2, 6, 0) },
    { id: ++id, productId: 28, productName: '草鱼', quantity: 40, costPrice: 8.0, totalCost: 320.0, supplier: '海鲜批发市场', timestamp: ts(2, 7, 15) },
    { id: ++id, productId: 31, productName: '纯棉圆领T恤', quantity: 60, costPrice: 30.0, totalCost: 1800.0, supplier: '服装城批发商', timestamp: ts(1, 9, 0) },
    { id: ++id, productId: 33, productName: '纯棉运动袜', quantity: 200, costPrice: 5.0, totalCost: 1000.0, supplier: '服装城批发商', timestamp: ts(1, 10, 30) },
    { id: ++id, productId: 9, productName: '土豆', quantity: 150, costPrice: 1.5, totalCost: 225.0, supplier: '城北蔬菜基地', timestamp: ts(0, 6, 30) },
    { id: ++id, productId: 2, productName: '进口香蕉', quantity: 100, costPrice: 3.5, totalCost: 350.0, supplier: '农副产品批发市场', timestamp: ts(0, 7, 45) }
  ]
}

export function seedEmployees() {
  return [
    { id: 1, name: '张三', employeeNo: 'SM001', position: '收银员', phone: '13800001111', hireDate: '2025-03-15' },
    { id: 2, name: '李四', employeeNo: 'SM002', position: '理货员', phone: '13800002222', hireDate: '2025-06-01' },
    { id: 3, name: '王五', employeeNo: 'SM003', position: '店长', phone: '13800003333', hireDate: '2024-01-10' },
    { id: 4, name: '赵六', employeeNo: 'SM004', position: '收银员', phone: '13800004444', hireDate: '2025-09-20' },
    { id: 5, name: '孙七', employeeNo: 'SM005', position: '采购员', phone: '13800005555', hireDate: '2026-02-14' }
  ]
}

export function seedAttendance() {
  return []
}
