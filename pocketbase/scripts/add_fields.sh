#!/bin/bash
# 通过 PocketBase Admin API 添加字段
# 用法: ./add_fields.sh <admin_email> <admin_password>

POCKETBASE_URL="http://localhost:8090"

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "用法: $0 <admin_email> <admin_password>"
    exit 1
fi

ADMIN_EMAIL="$1"
ADMIN_PASSWORD="$2"

# 1. 登录获取 token
echo "正在登录..."
TOKEN=$(curl -s -X POST "$POCKETBASE_URL/api/admins/auth-with-password" \
    -H "Content-Type: application/json" \
    -d "{\"identity\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" \
    | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "登录失败，请检查邮箱和密码"
    exit 1
fi

echo "登录成功"

# 2. 获取 todos collection ID
COLLECTION_ID=$(curl -s "$POCKETBASE_URL/api/collections/todos" \
    -H "Authorization: $TOKEN" \
    | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$COLLECTION_ID" ]; then
    echo "找不到 todos collection"
    exit 1
fi

echo "Found collection: $COLLECTION_ID"

# 3. 获取现有 schema
CURRENT_SCHEMA=$(curl -s "$POCKETBASE_URL/api/collections/$COLLECTION_ID" \
    -H "Authorization: $TOKEN")

# 4. 添加新字段
echo "正在添加字段..."

curl -s -X PATCH "$POCKETBASE_URL/api/collections/$COLLECTION_ID" \
    -H "Authorization: $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "schema": [
            {"name": "title", "type": "text", "required": true, "options": {"min": 1, "max": 500}},
            {"name": "description", "type": "text", "required": false, "options": {"max": 2000}},
            {"name": "completed", "type": "bool", "required": false},
            {"name": "priority", "type": "select", "required": false, "options": {"maxSelect": 1, "values": ["low", "medium", "high"]}},
            {"name": "due_date", "type": "date", "required": false},
            {"name": "tags", "type": "json", "required": false},
            {"name": "sort_order", "type": "number", "required": false, "options": {"min": 0}},
            {"name": "user", "type": "relation", "required": true, "options": {"collectionId": "_pb_users_auth_", "cascadeDelete": true, "minSelect": null, "maxSelect": 1}}
        ]
    }' | head -100

echo ""
echo "完成！"
