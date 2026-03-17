# 部署指南

## 服务器要求

- Docker & Docker Compose
- 开放端口: 80, 443
- 域名已解析到服务器 IP

## 首次部署

### 1. 配置 GitHub Secrets

在 GitHub 仓库设置中添加 Secrets:

- `SERVER_HOST`: 服务器 IP 或域名
- `SERVER_USER`: SSH 用户名 (通常是 root)
- `SERVER_SSH_KEY`: SSH 私钥

### 2. 服务器初始化

```bash
# SSH 到服务器
ssh root@your-server

# 创建项目目录
mkdir -p /var/www/todo-app
cd /var/www/todo-app

# 克隆仓库
git clone https://github.com/993576769/todo-app.git .

# 创建 SSL 证书目录
mkdir -p certs
```

### 3. 配置 SSL 证书

使用 Let's Encrypt:

```bash
# 安装 certbot
apt install certbot

# 获取证书
certbot certonly --standalone -d todo.lazegull.top

# 复制证书
cp /etc/letsencrypt/live/todo.lazegull.top/fullchain.pem certs/
cp /etc/letsencrypt/live/todo.lazegull.top/privkey.pem certs/
```

### 4. 启动服务

```bash
docker-compose up -d
```

### 5. 配置 PocketBase

访问 http://todo.lazegull.top/_/

1. 创建管理员账号
2. Settings > Import collections > 选择 `pocketbase/pb_schema.json`
3. 导入成功后，API Rules 会自动生效

## 自动部署

推送到 `main` 分支会自动触发部署。

## 手动部署

```bash
cd /var/www/todo-app
git pull
docker-compose up -d --build
```

## 更新 SSL 证书

```bash
# 续期
certbot renew

# 复制新证书
cp /etc/letsencrypt/live/todo.lazegull.top/fullchain.pem certs/
cp /etc/letsencrypt/live/todo.lazegull.top/privkey.pem certs/

# 重启 nginx
docker-compose restart nginx
```

## 故障排查

```bash
# 查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f pocketbase
docker-compose logs -f frontend
docker-compose logs -f nginx

# 重启服务
docker-compose restart
```
