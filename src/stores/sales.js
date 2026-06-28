import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/sales'

export const useSaleStore = defineStore('sales', () => {
  const sales = ref([])
  const loading = ref(false)

  async function fetchSales(start, end) {
    loading.value = true
    try {
      sales.value = await api.fetchSales(start, end)
    } finally {
      loading.value = false
    }
  }

  async function addSale({ productId, productName, quantity, unitPrice, cashier }) {
    const result = await api.createSale({ productId, productName, quantity, unitPrice, cashier })
    if (result.ok) {
      await fetchSales()
      const { useProductStore } = await import('./products')
      await useProductStore().fetchProducts()
    }
    return result
  }

  function getSalesByDateRange(start, end) {
    const s = start ? new Date(start + 'T00:00:00') : null
    const e = end ? new Date(end + 'T23:59:59') : null
    return sales.value.filter(sale => {
      const d = new Date(sale.createdAt)
      if (s && d < s) return false
      if (e && d > e) return false
      return true
    })
  }

  return { sales, loading, fetchSales, addSale, getSalesByDateRange }
})
