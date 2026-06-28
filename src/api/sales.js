import api from './client'

function toCamel(s) {
  return {
    id: s.id, productId: s.productId ?? s.product_id,
    productName: s.productName ?? s.product_name,
    quantity: s.quantity,
    unitPrice: Number(s.unitPrice ?? s.unit_price),
    totalAmount: Number(s.totalAmount ?? s.total_amount),
    cashier: s.cashier,
    createdAt: s.createdAt ?? s.created_at
  }
}

export const fetchSales = (start, end) => {
  const params = {}
  if (start) params.start = start
  if (end) params.end = end
  return api.get('/sales', { params }).then(r => r.data.map(toCamel))
}

export const createSale = data => {
  return api.post('/sales', {
    productId: data.productId,
    productName: data.productName,
    quantity: data.quantity,
    unitPrice: data.unitPrice,
    cashier: data.cashier
  }).then(r => r.data)
}
