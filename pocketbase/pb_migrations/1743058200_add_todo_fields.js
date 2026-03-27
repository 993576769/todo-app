// PocketBase Migration: 添加新字段到 todos collection
/// <reference path="../pb_data/types.d.ts" />

migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("todos");

  // 添加 description 字段
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

  // 添加 priority 字段
  collection.schema.addField(new SchemaField({
    name: "priority",
    type: "select",
    required: false,
    options: {
      maxSelect: 1,
      values: ["low", "medium", "high"]
    }
  }));

  // 添加 due_date 字段
  collection.schema.addField(new SchemaField({
    name: "due_date",
    type: "date",
    required: false,
    options: {
      min: "",
      max: ""
    }
  }));

  // 添加 tags 字段
  collection.schema.addField(new SchemaField({
    name: "tags",
    type: "json",
    required: false,
    options: {}
  }));

  // 添加 sort_order 字段
  collection.schema.addField(new SchemaField({
    name: "sort_order",
    type: "number",
    required: false,
    options: {
      min: 0,
      max: null
    }
  }));

  return dao.saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("todos");

  // 移除字段
  collection.schema.removeField(collection.schema.getFieldByName("description")?.id);
  collection.schema.removeField(collection.schema.getFieldByName("priority")?.id);
  collection.schema.removeField(collection.schema.getFieldByName("due_date")?.id);
  collection.schema.removeField(collection.schema.getFieldByName("tags")?.id);
  collection.schema.removeField(collection.schema.getFieldByName("sort_order")?.id);

  return dao.saveCollection(collection);
});
