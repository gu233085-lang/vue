# AAA超市管理系统

基于 Vue 3 + Express + MySQL 的进销存管理平台，支持商品管理、销售记录、进货管理、员工考勤等核心功能。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Vue 3 + Vite |
| UI 组件库 | Element Plus |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| 图表 | ECharts |
| 后端框架 | Express (Node.js) |
| 数据库 | MySQL 8.x |
| 认证 | JWT + bcrypt |
| 邮件服务 | Nodemailer (QQ邮箱 SMTP) |

## 功能模块

- **仪表盘** — 商品种类/库存总量/今日销售额/在岗人数统计，近7天销售趋势图，分类库存占比饼图，库存预警列表
- **商品管理** — 商品 CRUD，分类筛选，库存预警阈值，删除时外键保护
- **销售记录** — 销售列表查询，日期范围筛选，新增销售（事务校验库存 → 扣减）
- **进货记录** — 进货列表查询，新增进货（事务增加库存）
- **员工管理** — 员工 CRUD，工号唯一
- **考勤打卡** — 上班打卡 / 下班签退，每人每天一条记录
- **用户认证** — 注册/登录/重置密码，邮箱验证码（5位数字，2分钟有效，60秒冷却）

## 项目结构

```
├── src/                          # 前端
│   ├── main.js                   # 入口
│   ├── App.vue                   # 根组件
│   ├── api/                      # API 请求层（Axios + JWT 拦截）
│   ├── stores/                   # Pinia 状态管理
│   ├── views/                    # 页面组件
│   │   ├── Layout.vue            # 布局框架
│   │   ├── Dashboard.vue         # 仪表盘
│   │   ├── Products.vue          # 商品管理
│   │   ├── Sales.vue             # 销售记录
│   │   ├── Purchases.vue         # 进货记录
│   │   └── Employees.vue         # 员工管理
│   └── router/                   # 路由配置 + 守卫
├── server/                       # 后端
│   ├── index.js                  # Express 入口
│   ├── db.js                     # MySQL 连接池 + 自动建表
│   ├── config.js                 # 环境变量配置
│   ├── setup-db.js               # 数据库初始化 + 种子数据
│   ├── reseed.js                 # 仿真数据生成
│   ├── middleware/auth.js        # JWT 认证中间件
│   ├── routes/                   # 路由模块
│   │   ├── auth.js               # 登录/注册/重置密码
│   │   ├── products.js           # 商品 CRUD
│   │   ├── sales.js              # 销售记录
│   │   ├── purchases.js          # 进货记录
│   │   ├── employees.js          # 员工管理
│   │   └── attendance.js         # 考勤打卡
│   └── utils/mail.js             # 邮件发送工具
├── docs/                         # 文档
└── public/                       # 静态资源
```

## 数据流

```
Views → Pinia Stores → API (Axios) → Vite Proxy → Express Routes → MySQL
```

## 快速开始

### 环境要求

- Node.js ≥ 18
- MySQL 8.x

### 1. 克隆项目

```bash
git clone https://github.com/gu233085-lang/vue.git
cd vue
```

### 2. 安装依赖

```bash
# 前端
npm install

# 后端
cd server && npm install && cd ..
```

### 3. 配置环境变量

```bash
cp server/.env.example server/.env
```

编辑 `server/.env`，填入你的数据库密码和邮件配置：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的数据库密码
DB_NAME=supermarket

JWT_SECRET=你的JWT密钥

SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_USER=你的QQ邮箱@qq.com
SMTP_PASS=你的SMTP授权码
```

### 4. 初始化数据库

```bash
cd server
node setup-db.js    # 建库建表 + 种子数据
node reseed.js      # 生成仿真销售/进货数据
cd ..
```

### 5. 启动服务

```bash
# 终端1 - 启动后端（localhost:3000）
cd server && node index.js

# 终端2 - 启动前端（localhost:5173）
npm run dev
```

浏览器打开 `http://localhost:5173`，默认管理员账号：`admin` / `admin123`

## 数据库表

| 表 | 说明 |
|------|------|
| `users` | 用户表（bcrypt 密码加密） |
| `products` | 商品表（6大分类，库存预警） |
| `sales` | 销售记录（关联商品，库存扣减） |
| `purchases` | 进货记录（关联商品，库存增加） |
| `employees` | 员工表（工号唯一） |
| `attendance` | 考勤表（每员工每天一条，级联删除） |
| `verification_codes` | 验证码表（2分钟过期） |

## API 接口

> 除认证接口外，所有业务接口需要 `Authorization: Bearer <token>` 请求头。

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/login | 登录 |
| POST | /api/auth/register | 注册 |
| POST | /api/auth/reset-password | 重置密码 |
| POST | /api/email/send-code | 发送验证码 |
| GET/POST | /api/products | 商品列表 / 新增 |
| PUT/DELETE | /api/products/:id | 更新 / 删除商品 |
| GET/POST | /api/sales | 销售列表 / 新增 |
| GET/POST | /api/purchases | 进货列表 / 新增 |
| GET/POST | /api/employees | 员工列表 / 新增 |
| PUT/DELETE | /api/employees/:id | 更新 / 删除员工 |
| GET | /api/attendance | 考勤记录 |
| POST | /api/attendance/clock-in | 上班打卡 |
| POST | /api/attendance/clock-out | 下班签退 |

## License

MIT
