<template>
  <div>
    <el-card>
      <div class="toolbar">
        <el-input v-model="search" placeholder="搜索商品名称" clearable style="width: 220px" />
        <el-select v-model="filterCategory" placeholder="商品分类" clearable style="width: 160px; margin-left: 12px">
          <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
        </el-select>
        <el-button type="primary" @click="openDialog(null)">新增商品</el-button>
      </div>

      <el-table :data="filteredProducts" stripe style="margin-top: 16px" v-loading="store.loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="sellPrice" label="售价(¥)" width="100" />
        <el-table-column prop="costPrice" label="进价(¥)" width="100" />
        <el-table-column prop="stock" label="库存" width="80">
          <template #default="{ row }">
            <el-tag :type="row.stock <= row.threshold ? 'danger' : 'success'">{{ row.stock }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="单位" width="70" />
        <el-table-column prop="threshold" label="预警阈值" width="90" />
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button size="small" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑商品' : '新增商品'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" style="width: 100%">
            <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="售价" prop="sellPrice">
          <el-input-number v-model="form.sellPrice" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="进价" prop="costPrice">
          <el-input-number v-model="form.costPrice" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="form.stock" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="form.unit" placeholder="如：袋、瓶、箱" />
        </el-form-item>
        <el-form-item label="预警阈值" prop="threshold">
          <el-input-number v-model="form.threshold" :min="0" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useProductStore } from '@/stores/products'

const store = useProductStore()
const search = ref('')
const filterCategory = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const formRef = ref(null)

const categories = ['水果', '蔬菜', '肉类', '生活用品', '鱼类', '服装']

const form = reactive({ name: '', category: '', sellPrice: 0, costPrice: 0, stock: 0, unit: '', threshold: 0 })
const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  sellPrice: [{ required: true, message: '请输入售价', trigger: 'blur' }],
  costPrice: [{ required: true, message: '请输入进价', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
  unit: [{ required: true, message: '请输入单位', trigger: 'blur' }],
  threshold: [{ required: true, message: '请输入预警阈值', trigger: 'blur' }]
}

const filteredProducts = computed(() => {
  let list = store.products
  if (search.value) {
    list = list.filter(p => p.name.includes(search.value))
  }
  if (filterCategory.value) {
    list = list.filter(p => p.category === filterCategory.value)
  }
  return list
})

function openDialog(row) {
  if (row) {
    isEdit.value = true
    editId.value = row.id
    Object.assign(form, row)
  } else {
    isEdit.value = false
    editId.value = null
    Object.assign(form, { name: '', category: '', sellPrice: 0, costPrice: 0, stock: 0, unit: '', threshold: 0 })
  }
  dialogVisible.value = true
}

async function handleSave() {
  try {
    await formRef.value.validate()
  } catch { return }
  try {
    if (isEdit.value) {
      await store.updateProduct(editId.value, { ...form })
      ElMessage.success('商品已更新')
    } else {
      await store.addProduct({ ...form })
      ElMessage.success('商品已添加')
    }
    dialogVisible.value = false
  } catch (err) {
    ElMessage.error(err.response?.data?.error || '操作失败')
  }
}

async function handleDelete(id) {
  try {
    await ElMessageBox.confirm('确定删除该商品吗？', '确认', { type: 'warning' })
    await store.deleteProduct(id)
    ElMessage.success('已删除')
  } catch (err) {
    if (err !== 'cancel' && err !== 'close') {
      ElMessage.error(err.response?.data?.error || '删除失败')
    }
  }
}
</script>

<style scoped>
.toolbar { display: flex; align-items: center; }
.toolbar .el-button { margin-left: auto; }
</style>
