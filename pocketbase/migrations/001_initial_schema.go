// PocketBase migration: 初始化数据库 schema
// 创建 users 和 todos collections
// 适用于 PocketBase v0.23+

package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		// ====== 创建 users collection ======
		users := core.NewAuthCollection("users")
		users.System = true

		// 添加 name 字段
		users.Fields.Add(&core.TextField{
			Name:     "name",
			Required: false,
		})

		// 添加 avatar 字段
		users.Fields.Add(&core.FileField{
			Name:      "avatar",
			Required:  false,
			MaxSelect: 1,
		 MaxSize:   5242880,
		 MimeTypes: []string{
				"image/jpeg",
                "image/png",
                "image/gif",
                "image/webp",
            },
		})

		// 认证选项
        users.AllowEmailAuth = true
        users.AllowUsernameAuth = false
        users.RequireEmail = true

        if err := app.Save(users); err != nil {
            return err
        }

        // ====== 创建 todos collection ======
        todos := core.NewBaseCollection("todos")

        // title 字段 - 必填
        todos.Fields.Add(&core.TextField{
            Name:     "title",
            Required: true,
            Min:      ptr(1),
            Max:      ptr(500),
        })

        // description 字段 - 可选
        todos.Fields.Add(&core.TextField{
            Name:     "description",
            Required: false,
            Max:      ptr(2000),
        })

        // completed 字段 - 布尔值
        todos.Fields.Add(&core.BoolField{
            Name:     "completed",
            Required: false,
        })

        // priority 字段 - 选择类型
        todos.Fields.Add(&core.SelectField{
            Name:      "priority",
            Required:  false,
            MaxSelect: 1,
            Values:    []string{"low", "medium", "high"},
        })

        // due_date 字段 - 日期
        todos.Fields.Add(&core.DateField{
            Name:     "due_date",
            Required: false,
        })

        // tags 字段 - JSON 数组
        todos.Fields.Add(&core.JSONField{
            Name:     "tags",
            Required: false,
        })

        // sort_order 字段 - 数字
        todos.Fields.Add(&core.NumberField{
            Name:     "sort_order",
            Required: false,
            Min:      ptr(0),
        })

        // user 字段 - 关联到 users
        todos.Fields.Add(&core.RelationField{
            Name:          "user",
            Required:      true,
            Collection:    users.Id,
            CascadeDelete: true,
            MaxSelect:     ptr(1),
        })

        // 设置 API 规则 - 用户只能访问自己的 todos
        todos.ListRule = ptr("user = @request.auth.id")
        todos.ViewRule = ptr("user = @request.auth.id")
        todos.CreateRule = ptr("user = @request.auth.id")
        todos.UpdateRule = ptr("user = @request.auth.id")
        todos.DeleteRule = ptr("user = @request.auth.id")

        // 添加索引以优化查询性能
        todos.Indexes = []string{
            "CREATE INDEX idx_todos_user ON todos (user)",
            "CREATE INDEX idx_todos_completed ON todos (completed)",
            "CREATE INDEX idx_todos_priority ON todos (priority)",
            "CREATE INDEX idx_todos_due_date ON todos (due_date)",
            "CREATE INDEX idx_todos_sort_order ON todos (sort_order)",
        }

        return app.Save(todos)
    }, func(app core.App) error {
        // ====== 回滚：删除 collections ======
        if c, err := app.FindCollectionByNameOrId("todos"); err == nil {
            if err := app.Delete(c); err != nil {
                return err
            }
        }

        if c, err := app.FindCollectionByNameOrId("users"); err == nil {
            if err := app.Delete(c); err != nil {
                return err
            }
        }

        return nil
    })
}

// ptr 辅助函数：返回值的指针
func ptr[T any](v T) *T {
    return &v
}
