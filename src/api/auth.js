import api from './client'

export const login = (username, password) => api.post('/auth/login', { username, password })
export const register = (username, password, email, code) => api.post('/auth/register', { username, password, email, code })
export const sendCode = (email) => api.post('/email/send-code', { email })
export const sendResetCode = (username, email) => api.post('/email/send-reset-code', { username, email })
export const resetPassword = (username, email, code, password) => api.post('/auth/reset-password', { username, email, code, password })
