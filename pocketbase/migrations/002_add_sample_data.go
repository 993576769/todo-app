// PocketBase migration: 添加示例数据
// 适用于 PocketBase v0.23+

package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		// 获取 users collection
        usersCollection, err := app.FindCollectionByNameOrId("users")
        if err != nil {
            return err
        }

        // 创建示例用户
        demoUser := core.NewRecord(usersCollection)
        demoUser.SetEmail("demo@example.com")
        demoUser.SetPassword("demo123456")
        demoUser.Set("name", "Demo User")

        if err := app.Save(demoUser); err != nil {
            return err
        }

        // 获取 todos collection
        todosCollection, err := app.FindCollectionByNameOrId("todos")
        if err != nil {
            return err
        }

        // 示例 todos 数据
        sampleTodos := []struct {
            title       string
            description string
            priority    string
            completed   bool
            tags        []string
            sortOrder   float64
        }{
            {
                title:       "完成项目文档",
                description: "编写完整的 README 和 API 文档",
                priority:    "high",
                completed:   false,
                tags:        []string{"文档", "重要"},
                sortOrder:   1,
            },
            {
                title:       "代码审查",
                description: "审查团队提交的 Pull Request",
                priority:    "medium",
                completed:   false,
                tags:        []string{"代码", "审查"},
                sortOrder:   2,
            },
            {
                title:       "更新依赖包",
                description: "升级到最新稳定版本",
                priority:    "low",
                completed:   true,
                tags:        []string{"维护"},
                sortOrder:   3,
            },
            {
                title:       "性能优化",
                description: "优化数据库查询和前端渲染性能",
                priority:    "high",
                completed:   false,
                tags:        []string{"性能", "优化"},
                sortOrder:   4,
            },
        }

        // 插入示例数据
        for _, todo := range sampleTodos {
            record := core.NewRecord(todosCollection)
            record.Set("title", todo.title)
            record.Set("description", todo.description)
            record.Set("priority", todo.priority)
            record.Set("completed", todo.completed)
            record.Set("tags", todo.tags)
            record.Set("sort_order", todo.sortOrder)
            record.Set("user", demoUser.Id)

            if err := app.Save(record); err != nil {
                return err
            }
        }

        return nil
    }, func(app core.App) error {
        // 回滚:删除示例数据
        // 由于设置了 cascadeDelete,删除用户会自动删除相关的 todos
        if user, err := app.FindAuthRecordByEmail("demo@example.com"); err == nil {
            if err := app.Delete(user); err != nil {
                return err
            }
        }
        return nil
    })
}
