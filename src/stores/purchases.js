import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/purchases'

export const usePurchaseStore = defineStore('purchases', () => {
  const purchases = ref([])
  const loading = ref(false)

  async function fetchPurchases(start, end) {
    loading.value = true
    try {
      purchases.value = await api.fetchPurchases(start, end)
    } finally {
      loading.value = false
    }
  }

  async function addPurchase({ productId, productName, quantity, costPrice, supplier }) {
    const result = await api.createPurchase({ productId, productName, quantity, costPrice, supplier })
    if (result.ok) {
      await fetchPurchases()
      const { useProductStore } = await import('./products')
      await useProductStore().fetchProducts()
    }
    return result
  }

  function getByDateRange(start, end) {
    const s = start ? new Date(start + 'T00:00:00') : null
    const e = end ? new Date(end + 'T23:59:59') : null
    return purchases.value.filter(p => {
      const d = new Date(p.createdAt)
      if (s && d < s) return false
      if (e && d > e) return false
      return true
    })
  }

  return { purchases, loading, fetchPurchases, addPurchase, getByDateRange }
})
