# 环境变量清单模板

本文档用于统一本地、测试、生产环境的配置口径。请在交付时填写完整（敏感信息可脱敏）。

## 1. 适用范围
- 项目：FastShort
- 服务：`apps/server`（后端）、`apps/admin`（管理后台）、`apps/uniapp`（H5/移动端）

## 2. 变量清单（按环境填写）
请按“本地 / 测试 / 生产”三套环境填写以下配置。

### 2.1 后端（server）
| 变量名 | 本地 | 测试 | 生产 | 说明 |
| --- | --- | --- | --- | --- |
| `PLATFORM` | `PROD` |  |  | 环境标识 |
| `IN_DOCKER` | `true` |  |  | 是否容器内运行 |
| `PORT` | `3000` |  |  | 后端服务端口 |
| `APP_HOST` | `http://localhost:3000` |  |  | API 基础域名 |
| `MONGODB_HOST` | `mongodb://localhost` |  |  | MongoDB 连接 |
| `MONGODB_DB` | `shorttv` |  |  | 数据库名 |
| `JWT_SECRET` | `dev` |  |  | JWT 密钥 |
| `JWT_SALTKEY` | `dev` |  |  | 密码盐 |
| `S3_ENDPOINT` | `http://localhost:9000` |  |  | OSS/S3 Endpoint |
| `S3_BUCKET` | `fastshort` |  |  | OSS/S3 Bucket |
| `S3_KEY` | `minioadmin` |  |  | AccessKeyId |
| `S3_SECRET` | `minioadmin` |  |  | AccessKeySecret |
| `S3_SITE` | `http://localhost:9000/fastshort/` |  |  | 媒体访问域名 |
| `REDIS_URL` |  |  |  | Redis 连接（可选） |

### 2.2 管理后台（admin）
| 变量名 | 本地 | 测试 | 生产 | 说明 |
| --- | --- | --- | --- | --- |
| `VITE_SERVICE_ENV` | `dev` |  |  | 环境标识 |
| `DEFINE_DOCKER_URL` | `http://localhost:3000` |  |  | API Base |

### 2.3 端用户应用（uniapp / H5）
| 变量名 | 本地 | 测试 | 生产 | 说明 |
| --- | --- | --- | --- | --- |
| `BASE_URL` | `http://localhost:3000/api` |  |  | API Base |

## 3. 支付相关（预留）
如接入支付，请补充：
| 变量名 | 本地 | 测试 | 生产 | 说明 |
| --- | --- | --- | --- | --- |
| `PAYMENT_PROVIDER` |  |  |  | 支付通道标识 |
| `PAYMENT_APP_ID` |  |  |  | AppId |
| `PAYMENT_MCH_ID` |  |  |  | 商户号 |
| `PAYMENT_SECRET` |  |  |  | 密钥 |
| `PAYMENT_NOTIFY_URL` |  |  |  | 回调地址 |

## 4. 备注
- 生产环境建议使用独立密钥，并配合 KMS/密钥管理系统。
- `S3_SITE` 建议使用 CDN 域名，避免直连源站。
