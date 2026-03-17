# Conventional Commits 规范

## 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

## 类型 (type)

| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | feat(auth): 添加用户登录功能 |
| `fix` | 修复 bug | fix(todos): 修复删除后列表不更新的问题 |
| `docs` | 文档变更 | docs: 更新部署文档 |
| `style` | 代码格式 | style: 格式化代码 |
| `refactor` | 重构 | refactor(stores): 重构 auth store |
| `perf` | 性能优化 | perf: 优化列表渲染性能 |
| `test` | 增加测试 | test: 添加登录单元测试 |
| `chore` | 构建/工具变动 | chore: 更新依赖版本 |
| `ci` | CI 配置变动 | ci: 添加自动部署 workflow |
| `revert` | 回退 | revert: 撤销某次提交 |

## 范围 (scope) - 可选

- `frontend` - 前端相关
- `backend` - 后端相关
- `ci` - CI/CD 相关
- `deps` - 依赖更新

## 示例

```bash
# 新功能
feat(frontend): 添加用户注册功能

# 修复 bug
fix(todos): 修复切换状态后不同步的问题

# 文档
docs: 添加 API 文档

# 重构
refactor(stores): 使用 composition API 重写 auth store

# CI/CD
ci: 添加 GitHub Actions 自动构建和部署

# 破坏性变更
feat(api)!: 重构 API 接口

BREAKING CHANGE: API v1 已废弃，请迁移到 v2
```

## 使用方法

### 交互式提交（推荐）

```bash
pnpm commit
```

### 手动提交

```bash
git commit -m "feat(frontend): 添加用户注册功能"
```
