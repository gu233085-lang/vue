<template>
  <div class="forgot-wrapper">
    <el-card class="forgot-card">
      <h1>重置密码</h1>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="0" size="large">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="email">
          <el-input v-model="form.email" placeholder="注册时使用的邮箱" prefix-icon="Message" />
        </el-form-item>
        <el-form-item prop="code">
          <el-input v-model="form.code" placeholder="验证码" prefix-icon="Key" style="width: 55%" />
          <el-button
            class="code-btn"
            :disabled="codeCountdown > 0"
            @click="handleSendCode"
          >
            {{ codeCountdown > 0 ? codeCountdown + 's' : '获取验证码' }}
          </el-button>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="新密码（至少6位）" show-password prefix-icon="Lock" />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="确认新密码" show-password prefix-icon="Lock" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="reset-btn" :loading="loading" @click="handleReset">重 置 密 码</el-button>
        </el-form-item>
      </el-form>
      <p class="hint">
        <el-link type="primary" @click="$router.push('/login')">返回登录</el-link>
      </p>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { sendResetCode, resetPassword } from '@/api/auth'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const codeCountdown = ref(0)
let countdownTimer = null

const form = reactive({ username: '', email: '', code: '', password: '', confirmPassword: '' })

const validateConfirm = (rule, value, callback) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 5, message: '验证码为5位数字', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirm, trigger: 'blur' }
  ]
}

async function handleSendCode() {
  if (!form.username) {
    ElMessage.warning('请先输入用户名')
    return
  }
  if (!form.email) {
    ElMessage.warning('请先输入邮箱地址')
    return
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email)) {
    ElMessage.warning('请输入有效的邮箱地址')
    return
  }
  try {
    await sendResetCode(form.username, form.email)
    ElMessage.success('验证码已发送，请查收邮件')
    codeCountdown.value = 60
    countdownTimer = setInterval(() => {
      codeCountdown.value--
      if (codeCountdown.value <= 0) clearInterval(countdownTimer)
    }, 1000)
  } catch (err) {
    ElMessage.error(err.response?.data?.error || '发送失败')
  }
}

async function handleReset() {
  try {
    await formRef.value.validate()
  } catch { return }
  loading.value = true
  try {
    await resetPassword(form.username, form.email, form.code, form.password)
    ElMessage.success('密码已重置，请登录')
    router.push('/login')
  } catch (err) {
    const msg = err.response?.data?.error || '重置失败'
    ElMessage.error(msg)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.forgot-wrapper {
  width: 100vw; height: 100vh;
  display: flex; align-items: center; justify-content: center;
  background: url('/bg-login.jpg') center / cover no-repeat;
}
.forgot-card {
  width: 440px; padding: 20px 30px 10px;
  background: rgba(255, 255, 255, 0.7) !important;
}
.forgot-card h1 {
  text-align: center; font-size: 24px; margin-bottom: 24px; color: #303133;
}
.reset-btn { width: 100%; }
.code-btn { width: 42%; margin-left: 3%; }
.hint { text-align: center; color: #909399; font-size: 13px; margin-top: 8px; display: flex; align-items: center; justify-content: center; gap: 4px; }
.hint :deep(.el-link) { font-size: 13px; }
</style>
