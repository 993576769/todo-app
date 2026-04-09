# PocketBase migrations

这个目录以 `pb_migrations` 作为唯一的 schema 来源。

## 约定

- migration 只做 schema 和必要的数据修复，不写演示数据。
- 本地、CI、生产环境都依赖 PocketBase 启动时自动执行 migration。
- 需要补齐历史库结构时，新增一个增量 migration，不去假设线上库会重跑旧文件。
- migration 文件保持为 JS 运行时格式，但通过 `@ts-check` + `tsconfig.json` 获得 TypeScript 类型检查。

## 推荐工作流

1. 在 Dashboard 调整 collection。
2. 用 PocketBase 生成 migration，或手写一个增量 migration。
3. 提交 `pb_migrations` 到仓库。
4. 重启 PocketBase，让新 migration 自动执行。

## TypeScript 支持

- PocketBase 的 JSVM 不能直接执行 `.ts` migration，所以运行时文件仍然是 `.js`。
- 仓库里提供了 [tsconfig.json](/Users/ouyang/Project/todo-app/pocketbase/tsconfig.json) 和本地声明文件 [pocketbase-jsvm.d.ts](/Users/ouyang/Project/todo-app/pocketbase/types/pocketbase-jsvm.d.ts)，可以为 migration 提供编辑器提示和 `tsc` 检查。
- seed 脚本使用 TypeScript，配置在 [tsconfig.scripts.json](/Users/ouyang/Project/todo-app/pocketbase/tsconfig.scripts.json)，运行入口是 [seed.mts](/Users/ouyang/Project/todo-app/pocketbase/scripts/seed.mts)。
- 执行 `pnpm run typecheck:pocketbase` 可以同时检查 PocketBase migration 和 seed 脚本。
- 前端记录类型使用 [pocketbase-typegen](https://github.com/patmood/pocketbase-typegen) 生成，输出文件是 [pocketbase.generated.ts](/Users/ouyang/Project/todo-app/frontend/src/types/pocketbase.generated.ts)。
- 运行 `pnpm run typegen:pocketbase` 前，先把根目录的 [`.env.example`](/Users/ouyang/Project/todo-app/.env.example) 复制为 `.env.local` 并填入 `PB_TYPEGEN_*` 变量。

## 为什么不把示例数据放进 migration

示例数据会让 migration 变成环境相关逻辑，容易在 CI、预发和生产产生不一致。
如果需要 demo 数据，应该放到单独的 seed 流程，而不是 schema migration。

仓库里现在提供了独立脚本 [seed.mts](/Users/ouyang/Project/todo-app/pocketbase/scripts/seed.mts) 和命令 `pnpm run seed:pocketbase` 来初始化 demo 数据。
seed 数据文件位于 [demo-user.mts](/Users/ouyang/Project/todo-app/pocketbase/seeds/demo-user.mts) 和 [demo-todos.mts](/Users/ouyang/Project/todo-app/pocketbase/seeds/demo-todos.mts)。
