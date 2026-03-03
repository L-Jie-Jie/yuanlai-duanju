# TabBar 图标说明文档

## 需要创建的图标文件

根据参考设计，底部导航需要以下图标（尺寸：81x81px，@2x: 162x162px，@3x: 243x243px）：

### 1. 首页 (Home)
- **未选中**: `static/tabbar/home-inactive.png` - 罗盘图标，灰色 rgba(255,255,255,0.4)
- **选中**: `static/tabbar/home-active.png` - 罗盘图标，金色 #E5B567
- **临时使用**: a2.png / a.png

### 2. 追剧 (Follow)
- **未选中**: `static/tabbar/follow-inactive.png` - 场记板图标，灰色
- **选中**: `static/tabbar/follow-active.png` - 场记板图标，金色
- **临时使用**: c2.png / c.png

### 3. 剧场 (Theater) - 中间突出按钮
- **未选中**: `static/tabbar/theater-inactive.png` - 电视图标，灰色
- **选中**: `static/tabbar/theater-active.png` - 电视图标，金色
- **背景**: `static/tabbar/theater-bg.png` - 圆形渐变背景 (56x56px)
- **临时使用**: b2.png / b.png
- **样式**: 
  - 外圈：金色渐变圆环 (from #E5B567 to #c2964d)
  - 内圈：黑色圆形背景
  - 图标：金色电视图标
  - 阴影：0 8px 20px rgba(229, 181, 103, 0.3)

### 4. 历史 (History)
- **未选中**: `static/tabbar/history-inactive.png` - 时钟图标，灰色
- **选中**: `static/tabbar/history-active.png` - 时钟图标，金色
- **临时使用**: c2.png / c.png

### 5. 我的 (Profile)
- **未选中**: `static/tabbar/profile-inactive.png` - 用户图标，灰色
- **选中**: `static/tabbar/profile-active.png` - 用户图标，金色
- **临时使用**: d2.png / d.png

## 设计规范

### 颜色
- **未选中颜色**: rgba(255, 255, 255, 0.4) - 40%透明度白色
- **选中颜色**: #E5B567 - 尊贵金色
- **背景色**: rgba(18, 18, 20, 0.85) - 玻璃拟态效果
- **边框**: 1px solid rgba(255, 255, 255, 0.05)

### 效果
- **玻璃拟态**: backdrop-filter: blur(12px)
- **选中指示器**: 
  - 小圆点：1px 金色圆点
  - 位置：图标下方
  - 阴影：0 0 8px #E5B567

### 中间按钮特殊样式
- **尺寸**: 56x56px (比其他图标大)
- **位置**: 向上偏移 -24px
- **外圈**: 2px 金色渐变边框
- **内圈**: 黑色背景
- **图标**: 24x24px 金色电视图标
- **悬停效果**: transform: scale(1.05)

## SVG 图标参考 (Lucide Icons)

```html
<!-- 首页 - 罗盘 -->
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="12" cy="12" r="10"/>
  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
</svg>

<!-- 追剧 - 场记板 -->
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <rect width="18" height="18" x="3" y="3" rx="2"/>
  <path d="M3 9h18M9 21V9"/>
</svg>

<!-- 剧场 - 电视 -->
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <rect width="20" height="15" x="2" y="7" rx="2" ry="2"/>
  <polyline points="17 2 12 7 7 2"/>
</svg>

<!-- 历史 - 时钟 -->
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="12" cy="12" r="10"/>
  <polyline points="12 6 12 12 16 14"/>
</svg>

<!-- 我的 - 用户 -->
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
  <circle cx="12" cy="7" r="4"/>
</svg>
```

## 制作步骤

1. 使用 Figma/Sketch/Photoshop 创建 81x81px 画布
2. 导入上述 SVG 图标
3. 应用对应颜色（未选中：rgba(255,255,255,0.4)，选中：#E5B567）
4. 导出 @1x (81x81), @2x (162x162), @3x (243x243) 三种尺寸
5. 保存为 PNG 格式，背景透明
6. 替换 pages.json 中的临时图标路径

## 当前状态

✅ 页面结构已创建
✅ TabBar 配置已更新
⚠️ 使用现有图标作为临时方案
🔲 需要设计师制作专用图标

