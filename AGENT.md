# 🤖 独立开发 AI Agent 长期记忆与项目规约

## 🎯 项目当前总目标
本项目 (`元来短剧`) 正在进行 **移动端 (apps/uniapp) 的深度防查重重构**，以通过微信/抖音小程序严格的代码与 UI 机器审核。

## ⚠️ 核心重构铁律 (不可违背)
1. **彻底的类名前缀**：原项目所有业务页面的 CSS 类名必须废弃。统一采用全新的、随机但具语义的命名空间，例如从 `.video-list` 变更为 `.th-v-box` 或 `.m-drama-wrap`。
2. **DOM 结构重组**：严禁仅替换类名！必须改变 `template` 中的 DOM 嵌套层级（增加无意义的 wrapper `<view>`，或合并层级）。
3. **逻辑变量混淆**：核心 JS/TS 逻辑中的变量名、函数名必须采用同义词替换（如 `getSeriesList` 改为 `fetchDramaCollection`）。
4. **完整输出**：当你被要求修改文件时，**直接在本地文件中生成完整代码**，严禁使用 `// ... existing code ...` 等省略号占位符，保持代码立即可运行。

## 📍 当前重构进度 (每次对话结束前，请 AI 更新此模块)
- [x] 任务 1：全局配置与基础样式重写 (manifest, pages.json, uni.scss)
- [x] 任务 2：静态资源替换与请求拦截器混淆 (全局工具类重构)
- [x] 任务 3：核心播放器页重写 (pages/player 系列)
- [x] 任务 4：首页与剧集列表重写 (pages/index, components/episode)
- [x] 任务 5：个人中心与支付/我的页面重写 (pages/profile 系列)

## 🛠 技术栈
Vue 3 + Uni-App + SCSS (应用端在 `apps/uniapp` 目录下)
