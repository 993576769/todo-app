# Todo App

一个基于 PocketBase + Vue 3 + Pinia + VueUse 的 Todo 应用，支持用户认证和数据隔离。

## 技术栈

- **后端**: PocketBase (SQLite)
- **前端**: Vue 3 + TypeScript + Vite
- **状态管理**: Pinia
- **工具库**: VueUse
- **部署**: Docker Compose + Nginx
- **CI/CD**: GitHub Actions

## 功能特性

- ✅ 用户注册/登录
- ✅ 数据隔离（每个用户只能看到自己的 todos）
- ✅ 实时同步（多设备同步）
- ✅ CRUD 操作
- ✅ 响应式设计

## 本地开发

### 前置要求

- Node.js 18+
- pnpm (推荐) 或 npm
- Docker & Docker Compose

### 启动步骤

1. 克隆仓库
```bash
git clone https://github.com/993576769/todo-app.git
cd todo-app
```

2. 启动 PocketBase
```bash
docker-compose up -d pocketbase
```

3. 初始化 PocketBase
- 访问 http://localhost:8090/_/
- 创建管理员账号
- `pb_migrations` 会在 PocketBase 启动时自动执行，无需再手工导入 schema

4. 启动前端
```bash
cd frontend
pnpm install
pnpm dev
```

5. 访问 http://localhost:5173

### 生成 PocketBase TypeScript 类型

项目使用 [pocketbase-typegen](https://github.com/patmood/pocketbase-typegen) 生成前端类型：

```bash
cp .env.example .env.local
# 填入 PocketBase 超级管理员凭据或 token
pnpm run typegen:pocketbase
```

默认会生成到 `frontend/src/types/pocketbase.generated.ts`。

### 初始化示例数据

项目提供了独立的 PocketBase seed 脚本，不会混进 migration：

```bash
cp .env.example .env.local
# 优先填写独立的 PB_SEED_* 超级管理员凭据或 token
pnpm run seed:pocketbase
```

默认会读取 `pocketbase/seeds/demo-user.mts` 和 `pocketbase/seeds/demo-todos.mts`，
创建一个 `demo@example.com` 用户，并按需补齐几条示例 todos。

## 部署

详见 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 项目结构

```
todo-app/
├── frontend/           # Vue 3 前端
│   ├── src/
│   │   ├── lib/        # PocketBase 实例
│   │   ├── stores/     # Pinia stores
│   │   ├── composables/# 组合式函数
│   │   ├── components/ # 组件
│   │   ├── views/      # 页面
│   │   └── router/     # 路由
│   └── package.json
├── pocketbase/         # PocketBase 配置
│   ├── pb_migrations/  # 数据库迁移
│   ├── scripts/        # seed / 运维脚本
│   └── seeds/          # 示例数据
├── docker-compose.yml
├── nginx.conf
└── .github/
    └── workflows/
        └── deploy.yml  # CI/CD
```

## API 设计

PocketBase 自动生成 REST API：

- `POST /api/collections/users/auth-with-password` - 登录
- `POST /api/collections/users/records` - 注册
- `GET /api/collections/todos/records` - 获取 todos（自动过滤当前用户）
- `POST /api/collections/todos/records` - 创建 todo
- `PATCH /api/collections/todos/records/:id` - 更新 todo
- `DELETE /api/collections/todos/records/:id` - 删除 todo

## License

MIT
