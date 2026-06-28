import express from 'express'
import cors from 'cors'
import { ensureTables } from './db.js'
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import saleRoutes from './routes/sales.js'
import purchaseRoutes from './routes/purchases.js'
import employeeRoutes from './routes/employees.js'
import attendanceRoutes from './routes/attendance.js'
import emailRoutes from './routes/email.js'

const app = express()
app.use(cors())
app.use(express.json())

await ensureTables()

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/sales', saleRoutes)
app.use('/api/purchases', purchaseRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/email', emailRoutes)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
