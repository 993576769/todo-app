export type DemoTodoSeed = {
  title: string
  description?: string
  priority?: string
  completed?: boolean
  tags?: string[]
  sort_order?: number
}

export const demoTodosSeed: DemoTodoSeed[] = [
  {
    title: '完成项目文档',
    description: '编写完整的 README 和 API 文档',
    priority: 'high',
    completed: false,
    tags: ['文档', '重要'],
    sort_order: 1,
  },
  {
    title: '代码审查',
    description: '审查团队提交的 Pull Request',
    priority: 'medium',
    completed: false,
    tags: ['代码', '审查'],
    sort_order: 2,
  },
  {
    title: '更新依赖包',
    description: '升级到最新稳定版本',
    priority: 'low',
    completed: true,
    tags: ['维护'],
    sort_order: 3,
  },
  {
    title: '性能优化',
    description: '优化数据库查询和前端渲染性能',
    priority: 'high',
    completed: false,
    tags: ['性能', '优化'],
    sort_order: 4,
  },
]
