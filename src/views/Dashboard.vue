<template>
  <div class="dashboard" v-loading="loading">
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-num">{{ productStore.products.length }}</div>
          <div class="stat-label">商品种类</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-num">{{ totalStock }}</div>
          <div class="stat-label">库存总量</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-num">¥{{ todaySales.toFixed(2) }}</div>
          <div class="stat-label">今日销售额</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-num">{{ clockedInToday }} / {{ employeeStore.employees.length }}</div>
          <div class="stat-label">今日在岗 / 员工总数</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="14">
        <el-card class="equal-card">
          <template #header>近7天销售趋势</template>
          <div ref="trendChartRef" class="chart-body"></div>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card class="equal-card">
          <template #header>库存预警</template>
          <div class="card-body-fixed">
            <el-table
              v-if="lowStockProducts.length"
              :data="pagedLowStock" size="small"
              style="width: 100%"
            >
              <el-table-column prop="name" label="商品" />
              <el-table-column prop="category" label="分类" width="80" />
              <el-table-column prop="stock" label="库存" width="60" />
              <el-table-column prop="threshold" label="阈值" width="60" />
            </el-table>
            <el-empty v-if="!lowStockProducts.length" description="暂无库存预警" />
            <el-pagination
              v-if="lowStockProducts.length > pageSize"
              small layout="prev, pager, next"
              :total="lowStockProducts.length"
              :page-size="pageSize"
              v-model:current-page="currentPage"
              style="justify-content: center; margin-top: 8px"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="10">
        <el-card class="equal-card">
          <template #header>各分类库存占比</template>
          <div ref="pieChartRef" class="chart-body"></div>
        </el-card>
      </el-col>
      <el-col :span="14">
        <el-card class="equal-card">
          <template #header>分类汇总</template>
          <div class="card-body-fixed">
            <el-table :data="categoryStats" row-class-name="summary-row">
              <el-table-column label="分类" width="120">
                <template #default="{ row }">
                  <span class="category-dot" :style="{ background: row.color }"></span>
                  {{ row.category }}
                </template>
              </el-table-column>
              <el-table-column prop="count" label="商品数" width="80" />
              <el-table-column prop="totalStock" label="库存总量" width="100" />
              <el-table-column prop="totalValue" label="库存总值(¥)" width="120">
                <template #default="{ row }">¥{{ row.totalValue.toFixed(2) }}</template>
              </el-table-column>
              <el-table-column label="库存占比" min-width="200">
                <template #default="{ row }">
                  <div class="progress-cell">
                    <el-progress
                      :percentage="+(row.stockPercent).toFixed(1)"
                      :color="row.color"
                      :stroke-width="18"
                    />
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import { useProductStore } from '@/stores/products'
import { useSaleStore } from '@/stores/sales'
import { useEmployeeStore } from '@/stores/employees'
import { useAttendanceStore } from '@/stores/attendance'

const productStore = useProductStore()
const saleStore = useSaleStore()
const employeeStore = useEmployeeStore()
const attendanceStore = useAttendanceStore()
const trendChartRef = ref(null)
const pieChartRef = ref(null)

const loading = computed(() =>
  productStore.loading || saleStore.loading || employeeStore.loading || attendanceStore.loading
)

const categoryColors = {
  '水果': '#f56c6c',
  '蔬菜': '#67c23a',
  '肉类': '#e6a23c',
  '生活用品': '#409eff',
  '鱼类': '#40c9c6',
  '服装': '#b37feb'
}

const totalStock = computed(() => productStore.products.reduce((s, p) => s + p.stock, 0))

const todaySales = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return saleStore.sales
    .filter(s => (s.createdAt || '').startsWith(today))
    .reduce((sum, s) => sum + s.totalAmount, 0)
})

const clockedInToday = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return new Set(
    attendanceStore.records
      .filter(r => r.date === today && r.clockIn)
      .map(r => r.employeeId)
  ).size
})

const lowStockProducts = computed(() =>
  productStore.products.filter(p => p.stock <= p.threshold)
)

const pageSize = 8
const currentPage = ref(1)
const pagedLowStock = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return lowStockProducts.value.slice(start, start + pageSize)
})

const categoryStats = computed(() => {
  const map = {}
  productStore.products.forEach(p => {
    if (!map[p.category]) {
      map[p.category] = { category: p.category, count: 0, totalStock: 0, totalValue: 0 }
    }
    map[p.category].count++
    map[p.category].totalStock += p.stock
    map[p.category].totalValue += p.stock * p.costPrice
  })
  return Object.values(map).map(c => ({
    ...c,
    stockPercent: totalStock.value ? (c.totalStock / totalStock.value) * 100 : 0,
    color: categoryColors[c.category] || '#909399'
  }))
})

function renderCharts() {
  if (!trendChartRef.value || !pieChartRef.value) return

  const days = []
  const values = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    const dateStr = d.toISOString().slice(0, 10)
    days.push(dateStr.slice(5))
    values.push(+(
      saleStore.sales
        .filter(s => (s.createdAt || '').startsWith(dateStr))
        .reduce((sum, s) => sum + s.totalAmount, 0)
    ).toFixed(2))
  }
  const trendChart = echarts.init(trendChartRef.value)
  trendChart.setOption({
    tooltip: {
      trigger: 'axis',
      valueFormatter: v => '¥' + (+v).toFixed(2)
    },
    xAxis: { type: 'category', data: days },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: v => '¥' + (+v).toFixed(2) }
    },
    series: [{ data: values, type: 'line', smooth: true, areaStyle: { color: 'rgba(64,158,255,0.2)' } }]
  })

  const pieData = categoryStats.value.map(c => ({
    name: c.category,
    value: c.totalStock
  }))
  const pieChart = echarts.init(pieChartRef.value)
  pieChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      data: pieData,
      itemStyle: {
        color: params => categoryColors[params.name] || '#909399'
      },
      label: { formatter: '{b}\n{d}%' },
      emphasis: {
        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.3)' }
      }
    }]
  })
}

watch([() => saleStore.sales.length, () => productStore.products.length], () => {
  nextTick(renderCharts)
})

onMounted(() => {
  nextTick(renderCharts)
})
</script>

<style scoped>
.stat-card { text-align: center; }
.stat-num { font-size: 28px; font-weight: bold; color: #409EFF; }
.stat-label { font-size: 14px; color: #909399; margin-top: 8px; }
.progress-cell { padding-top: 4px; }
.category-dot {
  display: inline-block; width: 10px; height: 10px;
  border-radius: 50%; margin-right: 6px;
}
.equal-card { display: flex; flex-direction: column; }
.equal-card :deep(.el-card__body) { flex: 1; display: flex; flex-direction: column; }
.chart-body { height: 320px; width: 100%; }
.card-body-fixed { height: 320px; display: flex; flex-direction: column; }
.card-body-fixed .el-table { flex: 1; }
:deep(.summary-row) { height: 48px; }

</style>

<style>
.dashboard .el-progress__text { font-size: 14px !important; }
</style>
