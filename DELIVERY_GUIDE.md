# 交付说明（摘要版）

本文档为交付摘要，完整内容以以下两份为准：
- 技术文档：`TECHNICAL_DOC.md`
- 需求文档：`REQUIREMENTS_PRIORITIES.md`

## 交付目标
确保用户全流程可用：登录 → 浏览/观看短剧 → 充值/解锁 → 评论互动。

## 交付范围
- 端用户应用（H5/移动端）
- 管理后台
- 后端 API

## 交付资料清单
- 技术文档：`TECHNICAL_DOC.md`
- 需求文档：`REQUIREMENTS_PRIORITIES.md`
- 实际部署的 `docker-compose.yml`
- 环境变量清单：`ENV_TEMPLATE.md` / `ENV_FILLED.md`
- 第三方内容源对接信息（API 地址、限流规则、密钥与授权）

## 统一验证流程
1. 登录成功，JWT 正常使用
2. 后台创建分类/剧集/分集并上传视频
3. H5 端可浏览并播放分集
4. 充值/支付流程闭环可用
5. 外部内容源（uuuka）同步入库可见
