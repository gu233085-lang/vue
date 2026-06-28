<template>
  <el-container class="layout">
    <el-aside width="220px">
      <div class="logo">
        <img src="/logo.jpg" alt="logo" class="logo-img" />
        <span>AAA超市管理系统</span>
      </div>
      <el-menu
        :default-active="route.path"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/products">
          <el-icon><Goods /></el-icon>
          <span>商品库存</span>
        </el-menu-item>
        <el-menu-item index="/sales">
          <el-icon><Sell /></el-icon>
          <span>销售记录</span>
        </el-menu-item>
        <el-menu-item index="/purchases">
          <el-icon><Box /></el-icon>
          <span>进货记录</span>
        </el-menu-item>
        <el-menu-item index="/employees">
          <el-icon><UserFilled /></el-icon>
          <span>员工管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="topbar">
        <span class="breadcrumb">{{ route.meta.title }}</span>
        <el-button type="danger" size="small" @click="logout">退出登录</el-button>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DataAnalysis, Goods, Sell, Box, UserFilled } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useProductStore } from '@/stores/products'
import { useSaleStore } from '@/stores/sales'
import { usePurchaseStore } from '@/stores/purchases'
import { useEmployeeStore } from '@/stores/employees'
import { useAttendanceStore } from '@/stores/attendance'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

function logout() {
  authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  try {
    await Promise.all([
      useProductStore().fetchProducts(),
      useSaleStore().fetchSales(),
      usePurchaseStore().fetchPurchases(),
      useEmployeeStore().fetchEmployees(),
      useAttendanceStore().fetchAll()
    ])
  } catch (err) {
    console.error('Failed to load data:', err)
  }
})
</script>

<style scoped>
.layout { height: 100vh; }
.logo {
  height: 60px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  color: #fff; font-size: 16px; font-weight: bold;
  background: #263445; padding: 0 10px;
}
.logo-img {
  height: 36px; width: 36px;
  object-fit: contain; border-radius: 4px;
}
.el-aside { background: #304156; overflow: hidden; }
.topbar {
  background: #fff; display: flex;
  align-items: center; justify-content: space-between;
  border-bottom: 1px solid #e6e6e6; padding: 0 20px;
}
.breadcrumb { font-size: 16px; font-weight: 500; }
.el-main {
  position: relative;
  padding: 20px;
  background:
    linear-gradient(rgba(240, 242, 245, 0.3), rgba(240, 242, 245, 0.3)),
    url('/bg.gif') center / cover no-repeat fixed;
}
:deep(.el-main > *) {
  position: relative; z-index: 1;
}
:deep(.el-card) {
  background: rgba(255, 255, 255, 0.75);
}
:deep(.el-card__header) {
  background: rgba(255, 255, 255, 0.6);
}
:deep(.el-table) {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(255, 255, 255, 0.5);
  --el-table-row-hover-bg-color: rgba(255, 255, 255, 0.6);
}
:deep(.el-table tr) {
  background: transparent;
}
:deep(.el-table__body tr.el-table__row--striped td) {
  background: rgba(255, 255, 255, 0.25);
}
</style>
