import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as authApi from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('sm_token'))
  const user = ref(JSON.parse(localStorage.getItem('sm_user') || 'null'))

  const isLoggedIn = computed(() => !!token.value)

  async function login(username, password) {
    const res = await authApi.login(username, password)
    token.value = res.data.token
    user.value = res.data.user
    localStorage.setItem('sm_token', res.data.token)
    localStorage.setItem('sm_user', JSON.stringify(res.data.user))
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('sm_token')
    localStorage.removeItem('sm_user')
  }

  return { token, user, isLoggedIn, login, logout }
})
