#!/bin/bash
# PocketBase Schema Migration Script
# 使用 Admin API 更新 todos collection

# 需要先获取 Admin Token
# 方式1: 在 Admin UI 创建 API Token
# 方式2: 使用邮箱密码登录获取 token

POCKETBASE_URL="http://localhost:8090"
ADMIN_EMAIL="${POCKETBASE_ADMIN_EMAIL:-admin@example.com}"
ADMIN_PASSWORD="${POCKETBASE_ADMIN_PASSWORD:-}"

# 检查是否已有 token
if [ -z "$ADMIN_TOKEN" ]; then
    echo "请设置 POCKETBASE_ADMIN_EMAIL 和 POCKETBASE_ADMIN_PASSWORD 环境变量"
    echo "或者设置 ADMIN_TOKEN 直接使用 API token"
    exit 1
fi

# 获取 admin token
if [ -n "$ADMIN_EMAIL" ] && [ -n "$ADMIN_PASSWORD" ]; then
    ADMIN_TOKEN=$(curl -s -X POST "$POCKETBASE_URL/api/admins/auth-with-password" \
        -H "Content-Type: application/json" \
        -d "{\"identity\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" \
        | jq -r '.token')
fi

if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" = "null" ]; then
    echo "获取 Admin Token 失败"
    exit 1
fi

echo "获取到 Admin Token"

# 获取现有的 todos collection
COLLECTION=$(curl -s "$POCKETBASE_URL/api/collections/todos" \
    -H "Authorization: $ADMIN_TOKEN")

COLLECTION_ID=$(echo $COLLECTION | jq -r '.id')

if [ -z "$COLLECTION_ID" ] || [ "$COLLECTION_ID" = "null" ]; then
    echo "找不到 todos collection"
    exit 1
fi

echo "Found todos collection: $COLLECTION_ID"

# 更新 collection schema
curl -s -X PATCH "$POCKETBASE_URL/api/collections/$COLLECTION_ID" \
    -H "Authorization: $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "schema": [
            {
                "name": "title",
                "type": "text",
                "required": true,
                "options": {"min": 1, "max": 500}
            },
            {
                "name": "description",
                "type": "text",
                "required": false,
                "options": {"max": 2000}
            },
            {
                "name": "completed",
                "type": "bool",
                "required": false
            },
            {
                "name": "priority",
                "type": "select",
                "required": false,
                "options": {"maxSelect": 1, "values": ["low", "medium", "high"]}
            },
            {
                "name": "due_date",
                "type": "date",
                "required": false
            },
            {
                "name": "tags",
                "type": "json",
                "required": false
            },
            {
                "name": "sort_order",
                "type": "number",
                "required": false,
                "options": {"min": 0}
            },
            {
                "name": "user",
                "type": "relation",
                "required": true,
                "options": {
                    "collectionId": "users",
                    "cascadeDelete": true,
                    "minSelect": null,
                    "maxSelect": 1
                }
            }
        ]
    }'

echo "Migration completed!"
