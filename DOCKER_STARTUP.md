# Docker Compose 快速启动指南

## 一键启动所有服务

### 1. 启动所有服务（推荐）

在项目根目录运行：

```bash
cd "d:/duanju project/fastshort-main"
docker-compose up -d
```

这将启动：
- MongoDB (数据库)
- Redis (缓存)
- MinIO (文件存储)
- Server (后台API服务)

### 2. 查看服务状态

```bash
docker-compose ps
```

### 3. 查看服务日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f server
docker-compose logs -f mongodb
```

### 4. 停止所有服务

```bash
docker-compose down
```

## 服务访问地址

启动成功后，可以访问：

- **后台API**: http://localhost:3000/api
- **首页数据**: http://localhost:3000/api/public/home
- **MinIO控制台**: http://localhost:9001 (用户名/密码: minioadmin/minioadmin)
- **MongoDB**: localhost:27017

## 前端配置

### 方式1：修改前端API地址（如果后台在Docker中运行）

前端已经配置为连接 `http://127.0.0.1:3000/api`，Docker 服务启动后应该可以直接使用。

### 方式2：如果需要本地开发后台

如果你想在本地用 `npm run dev` 运行后台（不用Docker），需要：

1. **注释掉 docker-compose.yml 中的 server 服务**，避免端口冲突
2. **只启动基础服务**：
```bash
docker-compose up -d mongodb redis minio minio-init
```

3. **本地启动后台**：
```bash
cd "d:/duanju project/fastshort-main/apps/server"
npm install
npm run dev
```

## 初始化数据

### 方式1：通过管理后台添加数据

1. 访问管理后台（如果有）
2. 登录后添加短剧数据

### 方式2：导入测试数据

如果有数据备份文件：
```bash
# 导入 MongoDB 数据
docker-compose exec mongodb mongorestore --db shorttv /path/to/backup
```

### 方式3：使用 API 添加测试数据

可以通过 Postman 或其他工具调用管理 API 添加短剧数据。

## 常见问题

### Q: Docker 服务启动失败
**A:** 
- 确保 Docker Desktop 正在运行
- 检查端口是否被占用（3000, 27017, 9000, 9001）
- 查看日志：`docker-compose logs`

### Q: 前端仍然报 404
**A:**
1. 确认 Docker 服务已启动：`docker-compose ps`
2. 测试后台接口：访问 http://localhost:3000/api/public/home
3. 检查前端 API 配置是否正确

### Q: 数据库没有数据
**A:**
- 首次启动数据库是空的，需要添加短剧数据
- 可以通过管理后台或 API 添加数据

### Q: MinIO 连接失败
**A:**
- 确保 minio-init 服务已成功运行
- 访问 http://localhost:9001 检查 MinIO 控制台
- 检查 bucket "fastshort" 是否已创建

## 推荐开发流程

### 完全使用 Docker（最简单）
```bash
# 1. 启动所有服务
docker-compose up -d

# 2. 在 HBuilder X 中运行前端
# 前端会自动连接到 localhost:3000

# 3. 查看日志
docker-compose logs -f server
```

### 混合开发（后台本地，其他Docker）
```bash
# 1. 只启动基础服务
docker-compose up -d mongodb redis minio minio-init

# 2. 本地启动后台（方便调试）
cd apps/server
npm run dev

# 3. 在 HBuilder X 中运行前端
```

## 验证服务

### 1. 检查 Docker 服务
```bash
docker-compose ps
```

应该看到所有服务状态为 "Up"

### 2. 测试后台 API
在浏览器访问：http://localhost:3000/api/public/home

应该返回 JSON 数据（即使是空数组也说明服务正常）

### 3. 测试前端
在 HBuilder X 中运行项目，首页应该能正常加载（如果有数据的话）

## 下一步

1. ✅ 启动 Docker 服务
2. ✅ 验证后台 API 可访问
3. ✅ 在 HBuilder X 中运行前端
4. 📝 添加测试短剧数据
5. 🎉 开始开发！

