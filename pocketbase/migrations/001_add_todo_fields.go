// PocketBase migration: 添加新字段到 todos collection
// 运行方式: pocketbase migrate

package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/migrations"
)

func init() {
	migrations.Register(func(app core.App) error {
		// 获取 todos collection
		collection, err := app.FindCollectionByNameOrId("todos")
		if err != nil {
			return err
		}

		// 添加新字段
		collection.Schema.AddField(&core.SchemaField{
			Name:     "description",
			Type:     "text",
			Required: false,
		})

		collection.Schema.AddField(&core.SchemaField{
			Name:     "priority",
			Type:     "select",
			Required: false,
			Options: &core.SchemaFieldOptions{
				MaxSelect: 1,
				Values:    []string{"low", "medium", "high"},
			},
		})

		collection.Schema.AddField(&core.SchemaField{
			Name:     "due_date",
			Type:     "date",
			Required: false,
		})

		collection.Schema.AddField(&core.SchemaField{
			Name:     "tags",
			Type:     "json",
			Required: false,
		})

		collection.Schema.AddField(&core.SchemaField{
			Name:     "sort_order",
			Type:     "number",
			Required: false,
		})

		return app.Save(collection)
	}, func(app core.App) error {
		// 回滚：删除添加的字段
		collection, err := app.FindCollectionByNameOrId("todos")
		if err != nil {
			return err
		}

		collection.Schema.RemoveField("description")
		collection.Schema.RemoveField("priority")
		collection.Schema.RemoveField("due_date")
		collection.Schema.RemoveField("tags")
		collection.Schema.RemoveField("sort_order")

		return app.Save(collection)
	})
}
