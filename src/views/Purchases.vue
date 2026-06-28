<template>
  <div>
    <el-card>
      <div class="toolbar">
        <el-date-picker
          v-model="dateRange" type="daterange" range-separator="至"
          start-placeholder="开始日期" end-placeholder="结束日期"
          value-format="YYYY-MM-DD" style="width: 280px"
        />
        <el-button type="primary" @click="openDialog">新增进货</el-button>
      </div>

      <el-table :data="filteredPurchases" stripe style="margin-top: 16px" v-loading="purchaseStore.loading">
        <el-table-column prop="id" label="编号" width="60" />
        <el-table-column prop="productName" label="商品" />
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column prop="costPrice" label="进价(¥)" width="100" />
        <el-table-column prop="totalCost" label="总金额(¥)" width="110" />
        <el-table-column prop="supplier" label="供应商" width="140" />
        <el-table-column label="时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.createdAt).toLocaleString('zh-CN') }}
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!filteredPurchases.length" description="暂无进货记录" />
    </el-card>

    <el-dialog v-model="dialogVisible" title="新增进货" width="450px">
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
        <el-form-item label="进价" prop="costPrice">
          <el-input-number v-model="form.costPrice" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="总金额">
          <span style="font-weight: bold; font-size: 18px">¥{{ (form.quantity * form.costPrice).toFixed(2) }}</span>
        </el-form-item>
        <el-form-item label="供应商" prop="supplier">
          <el-input v-model="form.supplier" placeholder="供应商名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handlePurchase">确认入库</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { usePurchaseStore } from '@/stores/purchases'
import { useProductStore } from '@/stores/products'

const purchaseStore = usePurchaseStore()
const productStore = useProductStore()

const dateRange = ref([])
const dialogVisible = ref(false)
const formRef = ref(null)
const form = reactive({ productId: null, quantity: 1, costPrice: 0, supplier: '' })
const rules = {
  productId: [{ required: true, message: '请选择商品', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  costPrice: [{ required: true, message: '请输入进价', trigger: 'blur' }],
  supplier: [{ required: true, message: '请输入供应商', trigger: 'blur' }]
}

const filteredPurchases = computed(() => {
  if (dateRange.value && dateRange.value.length === 2) {
    return purchaseStore.getByDateRange(dateRange.value[0], dateRange.value[1])
  }
  return purchaseStore.purchases
})

function onProductChange(id) {
  const p = productStore.getById(id)
  if (p) form.costPrice = p.costPrice
}

function openDialog() {
  Object.assign(form, { productId: null, quantity: 1, costPrice: 0, supplier: '' })
  dialogVisible.value = true
}

async function handlePurchase() {
  try {
    await formRef.value.validate()
  } catch { return }
  const product = productStore.getById(form.productId)
  const productName = product ? product.name : '未知商品'
  try {
    const result = await purchaseStore.addPurchase({
      productId: form.productId,
      productName,
      quantity: form.quantity,
      costPrice: form.costPrice,
      supplier: form.supplier
    })
    if (result.ok) {
      ElMessage.success('进货入库成功，库存已更新')
      dialogVisible.value = false
    } else {
      ElMessage.error(result.error)
    }
  } catch (err) {
    ElMessage.error(err.response?.data?.error || '操作失败')
  }
}
</script>

<style scoped>
.toolbar { display: flex; align-items: center; }
.toolbar .el-button { margin-left: auto; }
</style>
