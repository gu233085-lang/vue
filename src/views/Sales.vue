<template>
  <div>
    <el-card>
      <div class="toolbar">
        <el-date-picker
          v-model="dateRange" type="daterange" range-separator="至"
          start-placeholder="开始日期" end-placeholder="结束日期"
          value-format="YYYY-MM-DD" style="width: 280px"
        />
        <el-button type="primary" @click="openSaleDialog">新增销售</el-button>
      </div>

      <el-table :data="filteredSales" stripe style="margin-top: 16px" v-loading="saleStore.loading">
        <el-table-column prop="id" label="编号" width="60" />
        <el-table-column prop="productName" label="商品" />
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column prop="unitPrice" label="单价(¥)" width="100" />
        <el-table-column prop="totalAmount" label="金额(¥)" width="100" />
        <el-table-column prop="cashier" label="收银员" width="100" />
        <el-table-column label="时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.createdAt).toLocaleString('zh-CN') }}
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!filteredSales.length" description="暂无销售记录" />
    </el-card>

    <el-card style="margin-top: 20px">
      <template #header>销售额统计</template>
      <el-radio-group v-model="chartMode" style="margin-bottom: 12px">
        <el-radio-button value="daily">按日</el-radio-button>
        <el-radio-button value="monthly">按月</el-radio-button>
      </el-radio-group>
      <div ref="chartRef" style="height: 300px"></div>
    </el-card>

    <el-dialog v-model="dialogVisible" title="新增销售" width="450px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="商品" prop="productId">
          <el-select v-model="form.productId" style="width: 100%" @change="onProductChange">
            <el-option
              v-for="p in productStore.products" :key="p.id"
              :label="`${p.name} (库存: ${p.stock})`" :value="p.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="form.quantity" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="单价">
          <span>¥{{ form.unitPrice.toFixed(2) }}</span>
        </el-form-item>
        <el-form-item label="金额">
          <span style="font-weight: bold; font-size: 18px">¥{{ (form.quantity * form.unitPrice).toFixed(2) }}</span>
        </el-form-item>
        <el-form-item label="收银员" prop="cashier">
          <el-input v-model="form.cashier" placeholder="收银员工号或姓名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSale">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { useSaleStore } from '@/stores/sales'
import { useProductStore } from '@/stores/products'

const saleStore = useSaleStore()
const productStore = useProductStore()

const dateRange = ref([])
const chartMode = ref('daily')
const dialogVisible = ref(false)
const formRef = ref(null)
const chartRef = ref(null)
const form = reactive({ productId: null, quantity: 1, unitPrice: 0, cashier: '' })
const rules = {
  productId: [{ required: true, message: '请选择商品', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  cashier: [{ required: true, message: '请输入收银员', trigger: 'blur' }]
}

const filteredSales = computed(() => {
  if (dateRange.value && dateRange.value.length === 2) {
    return saleStore.getSalesByDateRange(dateRange.value[0], dateRange.value[1])
  }
  return saleStore.sales
})

function onProductChange(id) {
  const p = productStore.getById(id)
  if (p) form.unitPrice = p.sellPrice
}

function openSaleDialog() {
  Object.assign(form, { productId: null, quantity: 1, unitPrice: 0, cashier: '' })
  dialogVisible.value = true
}

async function handleSale() {
  try {
    await formRef.value.validate()
  } catch { return }
  const product = productStore.getById(form.productId)
  if (!product) {
    ElMessage.error('商品不存在')
    return
  }
  try {
    const result = await saleStore.addSale({
      productId: form.productId,
      productName: product.name,
      quantity: form.quantity,
      unitPrice: form.unitPrice,
      cashier: form.cashier
    })
    if (result.ok) {
      ElMessage.success('销售记录已添加')
      dialogVisible.value = false
    } else {
      ElMessage.error(result.error)
    }
  } catch (err) {
    ElMessage.error(err.response?.data?.error || '操作失败')
  }
}

function updateChart() {
  if (!chartRef.value) return
  const grouped = {}
  saleStore.sales.forEach(s => {
    const key = chartMode.value === 'daily'
      ? (s.createdAt || '').slice(0, 10)
      : (s.createdAt || '').slice(0, 7)
    grouped[key] = (grouped[key] || 0) + s.totalAmount
  })
  const keys = Object.keys(grouped).sort().slice(-14)
  const vals = keys.map(k => +grouped[k].toFixed(2))
  const chart = echarts.init(chartRef.value)
  chart.setOption({
    tooltip: {
      trigger: 'axis',
      valueFormatter: v => '¥' + (+v).toFixed(2)
    },
    xAxis: { type: 'category', data: keys },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: v => '¥' + (+v).toFixed(2) }
    },
    series: [{ data: vals, type: 'bar', color: '#67c23a' }]
  })
}

watch(chartMode, updateChart)
watch(() => saleStore.sales.length, () => nextTick(updateChart))
onMounted(() => nextTick(updateChart))
</script>

<style scoped>
.toolbar { display: flex; align-items: center; }
.toolbar .el-button { margin-left: auto; }
</style>
