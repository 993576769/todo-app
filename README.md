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
- 如果希望容器启动时自动创建/更新管理员，可以在环境里设置 `PB_ADMIN_EMAIL` 和 `PB_ADMIN_PASSWORD`

4. 启动前端
```bash
cd frontend
pnpm install
pnpm dev
```

5. 访问 http://localhost:5173

### 本地开发模式

如果你希望本地调试 PocketBase，推荐不要只依赖 Docker，而是在宿主机直接运行 PocketBase：

1. 准备 PocketBase 服务端二进制
- 放到 [pocketbase](/Users/ouyang/Project/todo-app/pocketbase) 目录下，文件名为 `pocketbase`
- 或者通过环境变量指定路径：`PB_EXECUTABLE=/absolute/path/to/pocketbase`

2. 启动本地开发
```bash
pnpm run dev:pb   # 只启动 PocketBase
pnpm run dev:web  # 只启动前端
pnpm run dev:all  # 同时启动两者，并在 PocketBase 就绪后自动执行 seed
```

说明：
- `dev:pb` 会以 [pocketbase](/Users/ouyang/Project/todo-app/pocketbase) 作为工作目录启动 `pocketbase serve`
- `dev:pb` 会显式传入 `--migrationsDir` 和 `--dir`，因此即使 PocketBase 是通过 Homebrew 安装的，也会正确加载项目里的 migrations 和数据目录
- 如果 [`.env.example`](/Users/ouyang/Project/todo-app/.env.example) 对应的 `.env` 中设置了 `PB_ADMIN_EMAIL` 和 `PB_ADMIN_PASSWORD`，`dev:pb` 会先执行一次 `pocketbase superuser upsert`，自动创建或更新本地管理员
- `pb_migrations` 仍然不是热更新项，修改后通常需要重启 PocketBase
- 前端开发环境继续通过 [vite.config.ts](/Users/ouyang/Project/todo-app/frontend/vite.config.ts) 把 `/api` 代理到 `http://localhost:8090`
- `dev:all` 会轮询 `PB_SEED_URL` / `PB_TYPEGEN_URL` / `http://127.0.0.1:8090`，待 PocketBase 健康检查通过后自动执行一次 `pnpm run seed:pocketbase`
- 自动 seed 依赖 [`.env.example`](/Users/ouyang/Project/todo-app/.env.example) 对应的 `PB_SEED_*` 或 `PB_ADMIN_*` 凭据

### 生成 PocketBase TypeScript 类型

项目使用 [pocketbase-typegen](https://github.com/patmood/pocketbase-typegen) 生成前端类型：

```bash
cp .env.example .env
# 填入 PB_TYPEGEN_*，或直接复用 PB_ADMIN_EMAIL / PB_ADMIN_PASSWORD
pnpm run typegen:pocketbase
```

默认会生成到 `frontend/src/types/pocketbase.generated.ts`。

### 初始化示例数据

项目提供了独立的 PocketBase seed 脚本，不会混进 migration：

```bash
cp .env.example .env
# 优先填写独立的 PB_SEED_*，否则会回退到 PB_TYPEGEN_*，最后回退到 PB_ADMIN_*
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
