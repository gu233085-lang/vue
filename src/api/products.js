import api from './client'

function toCamel(p) {
  return {
    id: p.id, name: p.name, category: p.category,
    sellPrice: Number(p.sellPrice ?? p.sell_price),
    costPrice: Number(p.costPrice ?? p.cost_price),
    stock: p.stock, unit: p.unit, threshold: p.threshold,
    createdAt: p.createdAt ?? p.created_at,
    updatedAt: p.updatedAt ?? p.updated_at
  }
}

function toSnake(p) {
  return {
    name: p.name, category: p.category,
    sell_price: p.sellPrice, cost_price: p.costPrice,
    stock: p.stock, unit: p.unit, threshold: p.threshold
  }
}

export const fetchProducts = () => api.get('/products').then(r => r.data.map(toCamel))
export const createProduct = data => api.post('/products', toSnake(data)).then(r => toCamel(r.data))
export const updateProduct = (id, data) => api.put(`/products/${id}`, toSnake(data)).then(r => toCamel(r.data))
export const deleteProduct = id => api.delete(`/products/${id}`)
