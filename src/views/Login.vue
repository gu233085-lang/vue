<template>
  <div class="login-wrapper">
    <el-card class="login-card">
      <h1>超市管理系统</h1>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="0" size="large">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" show-password prefix-icon="Lock" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-btn" @click="handleLogin">登 录</el-button>
        </el-form-item>
        <el-form-item>
          <el-button class="register-btn" @click="$router.push('/register')">注 册</el-button>
        </el-form-item>
      </el-form>
      <p class="hint">
        忘记密码？
        <el-link type="primary" @click="$router.push('/forgot-password')">点击重置</el-link>
      </p>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref(null)

const form = reactive({ username: '', password: '' })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function handleLogin() {
  try {
    await formRef.value.validate()
  } catch { return }
  try {
    await authStore.login(form.username, form.password)
    ElMessage.success('登录成功')
    router.push('/dashboard')
  } catch (err) {
    const msg = err.response?.data?.error || '登录失败，请检查服务器是否启动'
    ElMessage.error(msg)
  }
}
</script>

<style scoped>
.login-wrapper {
  width: 100vw; height: 100vh;
  display: flex; align-items: center; justify-content: center;
  background: url('/bg-login.jpg') center / cover no-repeat;
}
.login-card {
  width: 400px; padding: 20px 30px 10px;
  background: rgba(255, 255, 255, 0.7) !important;
}
.login-card h1 {
  text-align: center; font-size: 24px; margin-bottom: 24px; color: #303133;
}
.login-btn { width: 100%; }
.register-btn { width: 100%; }
.hint { text-align: center; color: #909399; font-size: 13px; margin-top: 8px; display: flex; align-items: center; justify-content: center; gap: 4px; }
.hint :deep(.el-link) { font-size: 13px; }
.hint { text-align: center; color: #909399; font-size: 13px; margin-top: 8px; }
</style>
