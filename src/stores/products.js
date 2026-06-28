import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/products'

export const useProductStore = defineStore('products', () => {
  const products = ref([])
  const loading = ref(false)

  async function fetchProducts() {
    loading.value = true
    try {
      products.value = await api.fetchProducts()
    } finally {
      loading.value = false
    }
  }

  async function addProduct(p) {
    const created = await api.createProduct(p)
    products.value.push(created)
  }

  async function updateProduct(id, data) {
    const updated = await api.updateProduct(id, data)
    const idx = products.value.findIndex(p => p.id === id)
    if (idx !== -1) products.value[idx] = updated
  }

  async function deleteProduct(id) {
    await api.deleteProduct(id)
    products.value = products.value.filter(p => p.id !== id)
  }

  function getById(id) {
    return products.value.find(p => p.id === id)
  }

  return { products, loading, fetchProducts, addProduct, updateProduct, deleteProduct, getById }
})
