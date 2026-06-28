import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/ForgotPassword.vue'),
    meta: { title: '找回密码' }
  },
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '仪表盘' }
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('@/views/Products.vue'),
        meta: { title: '商品库存' }
      },
      {
        path: 'sales',
        name: 'Sales',
        component: () => import('@/views/Sales.vue'),
        meta: { title: '销售记录' }
      },
      {
        path: 'purchases',
        name: 'Purchases',
        component: () => import('@/views/Purchases.vue'),
        meta: { title: '进货记录' }
      },
      {
        path: 'employees',
        name: 'Employees',
        component: () => import('@/views/Employees.vue'),
        meta: { title: '员工管理' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('sm_token')
  if (to.path !== '/login' && to.path !== '/register' && to.path !== '/forgot-password' && !token) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register' || to.path === '/forgot-password') && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
