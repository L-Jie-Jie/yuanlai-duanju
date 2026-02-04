# FastShort 技术文档（整合版）

本文档覆盖项目整体架构、部署与“用户全流程可用”所需的接口与改造点。

## 1. 项目概述
FastShort 是短剧平台，包含：
- 端用户应用（UniApp，支持 H5/Android/iOS/小程序）
- 管理后台（Vue3）
- 后端 API（Node/Koa）

目标：从“登录 → 浏览/观看短剧 → 充值/解锁 → 评论互动”形成完整闭环。

## 2. 项目结构与技术栈
项目结构：
- `apps/uniapp/`：端用户应用
- `apps/admin/`：管理后台
- `apps/server/`：后端 API
- `docker-compose.yml`：本地部署入口

技术栈：
- 前端：UniApp（Vue2）、xgplayer
- 后台：Vue3 + Vite + NaiveUI + Fast-CRUD
- 后端：Node.js（ESM）+ Koa + MongoDB + JWT
- 存储：S3 兼容对象存储（本地 MinIO）
- 媒体：ffmpeg 生成封面

## 3. 部署与环境配置
本地 Docker 端口：
- `3000` API
- `3001` 后台
- `3002` H5
- `9000/9001` MinIO

启动：
```
docker compose up -d
```

关键环境变量（见 `docker-compose.yml`）：
- `MONGODB_HOST` / `MONGODB_DB`
- `JWT_SECRET` / `JWT_SALTKEY`
- `S3_ENDPOINT` / `S3_BUCKET` / `S3_KEY` / `S3_SECRET` / `S3_SITE`
- `APP_HOST` / `PLATFORM` / `IN_DOCKER`

## 4. 用户全流程与核心接口
以下流程必须保证可跑通：

### 4.1 登录/注册
接口：
- `POST /api/public/register`
- `POST /api/public/login`

要求：
- JWT 正常下发与续期
- 端侧存储 token 并用于后续请求

### 4.2 浏览与播放
接口：
- `POST /api/public/home`（首页）
- `POST /api/public/series`（某剧集分集）
- `POST /api/public/short`（随机短视频）

要求：
- `episode.video` 必须可在浏览器直接访问
- `episode.cover` 可访问（封面生成无误）

### 4.3 充值/支付
现状：
- 前端 UI 存在
- 后端支付流程缺失

需要补齐：
- 创建订单
- 支付回调校验与幂等
- 支付记录与对账
- 失败重试/补单

### 4.4 评论/互动
现状：
- 评论 CRUD 存在
- Web 端评论仍需完善

需要补齐：
- 前端评论入口
- 审核/举报/屏蔽机制

## 5. 内容生产与管理流程
管理后台：
- `series` / `episode` / `category` CRUD

上传流程：
- `POST /api/public/upload` 上传视频/图片
- ffmpeg 生成封面（`videoUrl + ".png"`）
- 保存 `episode.cover` 与 `episode.video`

常见问题与排查：
- 封面缺失：ffmpeg 未安装、截图目录无权限、S3 配置错误
- 播放黑屏：视频 URL 不可访问、域名错误、跨域/协议限制

## 6. 数据模型（核心集合）
- `series`：剧集
- `episode`：分集（video/cover）
- `category`：分类
- `user`：用户
- `comment`：评论
- `like`：点赞/收藏

## 7. 外部内容源接入（uuuka API）
目标：将第三方内容作为“内容来源”，用于内容索引或同步。

策略：
- 只同步元数据（标题、来源链接、更新时间、类型）
- 播放资源优先走自建上传
- 频率受限，必须限流与缓存

数据映射：
- `content_type` → `category`
- `title` → `series.name`
- `source_link` → `series.source_link`（新增字段）
- `update_time` → `series.updatedAt`

## 8. 需要封装/新增的关键接口
必须新增：
- `POST /api/pay/order/create`
- `POST /api/pay/notify`
- `GET /api/pay/records`
- `POST /api/content-sync/uuuka`（手动同步）
- `GET /api/content-sync/status`

建议新增：
- `POST /api/admin/review`（内容审核）
- `POST /api/admin/report`（举报/屏蔽）

## 9. 二次开发重点工作清单（技术视角）
- 支付闭环后端
- OSS/CDN 替换本地存储
- 内容审核与风控
- 外部内容源同步任务
- 评论系统完善
