# 短剧平台

本仓库是短剧平台（端用户应用 + 管理后台 + 后端 API）的交付版本，目标是快速完成
“登录 → 浏览/观看短剧 → 充值/解锁 → 评论互动”的完整闭环。

## 功能概览
- 端用户应用：UniApp（H5/Android/iOS/小程序）
- 管理后台：内容管理、分类/剧集/分集 CRUD
- 后端 API：用户/内容/播放/上传接口
- 视频存储：S3 兼容对象存储（本地 MinIO，生产建议 OSS + CDN）
- 播放体验：自动下一集、随机短视频

## 本地运行（Docker）
```shell
docker compose up -d
```

访问地址：
- 后端 API：`http://localhost:3000`
- 管理后台：`http://localhost:3001`
- H5 页面：`http://localhost:3002`
- MinIO 控制台：`http://localhost:9001`

> 本地默认账号密码以后台登录页为准；本仓库已支持本地强制登录逻辑。

## 文档
- 技术文档：`TECHNICAL_DOC.md`
- 需求文档：`REQUIREMENTS_PRIORITIES.md`
- 交付摘要：`DELIVERY_GUIDE.md`
- 环境变量模板：`ENV_TEMPLATE.md`

## 已知限制
- 支付 UI 已有，但后端支付闭环需二次开发
- 生产环境需替换 MinIO 为 OSS/CDN
- 评论/审核/分享等部分功能需补齐

## 外部内容源（可选）
支持对接第三方内容源（如 uuuka API）进行内容索引与同步。
建议只同步元数据，播放资源仍由自建上传。
