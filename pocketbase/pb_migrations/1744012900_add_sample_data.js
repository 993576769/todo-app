// PocketBase Migration: 添加示例数据
// 适用于 PocketBase v0.23+

migrate((app) => {
  // 获取 users collection
  let usersCollection;
  try {
    usersCollection = app.findCollectionByNameOrId("users");
  } catch (e) {
    console.log("Users collection not found");
    return;
  }

  // 创建示例用户
  const demoUser = new Record(usersCollection, {
    email: "demo@example.com",
    name: "Demo User",
    password: "demo123456"
  });

  app.save(demoUser);

  // 获取 todos collection
  let todosCollection;
  try {
    todosCollection = app.findCollectionByNameOrId("todos");
  } catch (e) {
    console.log("Todos collection not found");
    return;
  }

  // 示例 todos 数据
  const sampleTodos = [
    {
      title: "完成项目文档",
      description: "编写完整的 README 和 API 文档",
      priority: "high",
      completed: false,
      tags: ["文档", "重要"],
      sort_order: 1,
      user: demoUser.id
    },
    {
      title: "代码审查",
      description: "审查团队提交的 Pull Request",
      priority: "medium",
      completed: false,
      tags: ["代码", "审查"],
      sort_order: 2,
      user: demoUser.id
    },
    {
      title: "更新依赖包",
      description: "升级到最新稳定版本",
      priority: "low",
      completed: true,
      tags: ["维护"],
      sort_order: 3,
      user: demoUser.id
    },
    {
      title: "性能优化",
      description: "优化数据库查询和前端渲染性能",
      priority: "high",
      completed: false,
      tags: ["性能", "优化"],
      sort_order: 4,
      user: demoUser.id
    }
  ];

  // 插入示例数据
  sampleTodos.forEach((todoData) => {
    const record = new Record(todosCollection, todoData);
    app.save(record);
  });

}, (app) => {
  // 回滚：删除示例数据
  // 由于设置了 cascadeDelete，删除用户会自动删除相关的 todos
  try {
    const user = app.findAuthRecordByEmail("demo@example.com");
    if (user) {
      app.delete(user);
    }
  } catch (e) {
    // 用户不存在，忽略
  }
});
