// PocketBase Migration: 添加新字段到 todos collection
// 适用于 PocketBase v0.22+

migrate((app) => {
  // 查找 todos collection
  let collection;
  try {
    collection = app.findCollectionByNameOrId("todos");
  } catch (e) {
    console.log("Collection 'todos' not found, skipping migration");
    return;
  }

  if (!collection) {
    console.log("Collection 'todos' is null, skipping migration");
    return;
  }

  // 检查字段是否已存在
  const existingFields = collection.schema.fields().map(f => f.name);

  // 添加 description 字段
  if (!existingFields.includes("description")) {
    collection.schema.addField(new SchemaField({
      name: "description",
      type: "text",
      required: false,
      options: {
        min: null,
        max: 2000,
        pattern: ""
      }
    }));
  }

  // 添加 priority 字段
  if (!existingFields.includes("priority")) {
    collection.schema.addField(new SchemaField({
      name: "priority",
      type: "select",
      required: false,
      options: {
        maxSelect: 1,
        values: ["low", "medium", "high"]
      }
    }));
  }

  // 添加 due_date 字段
  if (!existingFields.includes("due_date")) {
    collection.schema.addField(new SchemaField({
      name: "due_date",
      type: "date",
      required: false,
      options: {
        min: "",
        max: ""
      }
    }));
  }

  // 添加 tags 字段
  if (!existingFields.includes("tags")) {
    collection.schema.addField(new SchemaField({
      name: "tags",
      type: "json",
      required: false,
      options: {}
    }));
  }

  // 添加 sort_order 字段
  if (!existingFields.includes("sort_order")) {
    collection.schema.addField(new SchemaField({
      name: "sort_order",
      type: "number",
      required: false,
      options: {
        min: 0,
        max: null
      }
    }));
  }

  return app.save(collection);
}, (app) => {
  // 回滚：移除添加的字段
  let collection;
  try {
    collection = app.findCollectionByNameOrId("todos");
  } catch (e) {
    return;
  }

  if (!collection) return;

  const fieldsToRemove = ["description", "priority", "due_date", "tags", "sort_order"];
  fieldsToRemove.forEach(name => {
    try {
      const field = collection.schema.getFieldByName(name);
      if (field) {
        collection.schema.removeField(field.id);
      }
    } catch (e) {
      // 字段不存在，忽略
    }
  });

  return app.save(collection);
});
