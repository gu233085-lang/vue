import api from './client'

function toCamel(p) {
  return {
    id: p.id, productId: p.productId ?? p.product_id,
    productName: p.productName ?? p.product_name,
    quantity: p.quantity,
    costPrice: Number(p.costPrice ?? p.cost_price),
    totalCost: Number(p.totalCost ?? p.total_cost),
    supplier: p.supplier,
    createdAt: p.createdAt ?? p.created_at
  }
}

export const fetchPurchases = (start, end) => {
  const params = {}
  if (start) params.start = start
  if (end) params.end = end
  return api.get('/purchases', { params }).then(r => r.data.map(toCamel))
}

export const createPurchase = data => {
  return api.post('/purchases', {
    productId: data.productId,
    productName: data.productName,
    quantity: data.quantity,
    costPrice: data.costPrice,
    supplier: data.supplier
  }).then(r => r.data)
}
