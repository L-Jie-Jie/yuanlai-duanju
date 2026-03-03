#  元来短剧 - 跨端全栈项目

##  项目简介
本项目是一个完整的短剧内容分发与运营平台。项目采用 **Monorepo** (pnpm workspace) 架构，包含面向用户的跨端应用（主打微信小程序）、强大的后台管理系统以及提供支撑的后端 API 服务。

---

## 🏗️ 核心技术栈与架构映射

项目分为三个核心子工程，修改代码时请务必注意跨端逻辑的一致性：

### 1.  面向用户端: `apps/uniapp/` (主打微信小程序等跨端)
* **技术栈**: Uni-App + Vue.js + SCSS
* **核心功能**: 短剧流信息流展示 (`components/home-rail-strip.vue`)、视频滑动播放 (`components/episode.vue`, `components/piaoyi-swiper`)、点赞评论 (`components/like.vue`, `components/comment.vue`)、用户账户与充值 (`pages/account/`)。
* **关键目录**:
    * `/pages`: 页面路由组件。
    * `/components`: 复用 UI 与业务组件。
    * `/common`: 全局请求封装与工具类。

### 2.  后台管理端: `apps/admin/`
* **技术栈**: Vue 3 + Vite + TypeScript + Naive UI + Pinia
* **核心功能**: 内容审核与上下架、用户管理、短剧与剧集配置、订单与数据统计。
* **关键目录**:
    * `/src/views`: 业务页面（包括 `series` 剧目管理, `episode` 剧集管理, `category` 分类管理, `user` 用户管理等）。
    * `/src/service`: 封装 API 请求的模块。
    * `/src/router`: 前端路由鉴权与动态菜单。

### 3.  后端服务端: `apps/server/`
* **技术栈**: Node.js + Express + MongoDB + Redis (高并发缓存)
* **核心功能**: 核心业务 API、微信授权登录 (`route/oauth.js`)、定时任务 (`crontab/timer.js`)。
* **关键目录**:
    * `/route/admin`: 供后台管理端调用的 API 接口。
    * `/route/app`: 供 uniapp 客户端调用的 API 接口。
    * `/lib`: 核心中间件、数据库连接 (`mongo.js`, `redis.js`)、统一响应封装 (`response.js`)。

---

##  核心业务模型 (Domain Models)

1.  **User (用户)**: 包含普通用户数据、微信 OpenID 映射、账户余额、观看历史与收藏 (Bookmark)。
2.  **Series (短剧剧目)**: 顶层内容容器。包含封面、标题、简介、分类 (Category)、总集数。
3.  **Episode (剧集/单集)**: 挂载在 Series 下的具体视频内容。包含视频链接、时长、排序、是否需要付费/VIP解锁。
4.  **Comment (评论)**: 挂载在 Episode 或 Series 下的用户交互数据。
5.  **Transaction/Order (流水/订单)**: 用户的充值记录或解锁剧集消耗记录（关联 `apps/uniapp/pages/account/balance.vue` 等）。

