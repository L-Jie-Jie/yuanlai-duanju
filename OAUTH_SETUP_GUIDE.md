# 抖音和微信一键登录开通指南

## 📱 功能说明

本项目支持以下登录方式：
- **微信小程序环境**：仅显示微信一键登录按钮
- **抖音小程序环境**：仅显示抖音一键登录按钮
- **H5/App 环境**：同时显示微信和抖音登录按钮

---

## 一、微信小程序一键登录

### 1. 注册微信小程序

1. 访问 [微信公众平台](https://mp.weixin.qq.com/)
2. 注册小程序账号（企业或个人）
3. 完成小程序信息填写和认证

### 2. 获取配置信息

登录小程序后台：
- 进入：**开发** → **开发管理** → **开发设置**
- 记录以下信息：
  - `AppID`（小程序ID）
  - `AppSecret`（小程序密钥）

### 3. 开通手机号快速验证

1. 进入：**设置** → **接口设置**
2. 找到"手机号快速验证组件"
3. 点击开通（需要企业认证，个人小程序可能无法使用）

### 4. 配置服务器域名

1. 进入：**开发** → **开发管理** → **开发设置** → **服务器域名**
2. 添加以下域名（必须是 HTTPS）：
   - **request 合法域名**：`https://你的后端域名`
   - **uploadFile 合法域名**：`https://你的后端域名`
   - **downloadFile 合法域名**：`https://你的后端域名`

### 5. 配置后端

编辑 `apps/server/config/index.js`：

```javascript
export default {
  mp: {
    appId: 'wx1234567890abcdef',        // 替换为你的 AppID
    appSecret: 'your_wechat_app_secret' // 替换为你的 AppSecret
  }
}
```

### 6. 安装依赖

```bash
cd apps/server
npm install wechat-jssdk
```

---

## 二、抖音小程序一键登录

### 1. 注册抖音开放平台

1. 访问 [抖音开放平台](https://developer.open-douyin.com/)
2. 注册账号并完成企业认证（个人开发者功能受限）

### 2. 创建小程序

1. 在开放平台创建小程序应用
2. 完成小程序基本信息填写
3. 记录以下信息：
   - `AppID`（小程序ID）
   - `AppSecret`（小程序密钥）

### 3. 开通手机号快速验证

1. 进入小程序管理后台
2. 找到：**能力管理** → **手机号快速验证**
3. 申请开通该能力（需要提交应用场景说明）
4. 等待审核通过（通常 1-3 个工作日）

### 4. 配置服务器域名

1. 进入：**开发** → **开发设置** → **服务器域名**
2. 添加你的后端 API 域名（必须是 HTTPS）

### 5. 配置后端

需要实现抖音登录接口，编辑 `apps/server/route/oauth.js`：

```javascript
// 安装抖音 SDK（如果有官方 SDK）
// npm install @douyin/server-sdk

// 或者自行实现 HTTP 请求
import axios from 'axios'

// 在 miniapp 方法中添加抖音登录逻辑
if (platform === 'toutiao') {
  type = 'douyin'
  
  // 1. 通过 code 换取 session_key 和 openid
  const response = await axios.get('https://developer.toutiao.com/api/apps/v2/jscode2session', {
    params: {
      appid: config.douyin.appId,
      secret: config.douyin.appSecret,
      code: code
    }
  })
  
  if (response.data.err_no !== 0) {
    return fail(ctx, 'Douyin login failed')
  }
  
  session = response.data.data
  openid = session.openid
  
  // 2. 解密手机号（如果有）
  if (encryptedData && iv) {
    // 使用抖音提供的解密方法
    // phoneNumber = decryptDouyinData(encryptedData, iv, session.session_key)
  }
}
```

### 6. 配置文件

在 `apps/server/config/index.js` 中添加：

```javascript
export default {
  // ... 其他配置
  douyin: {
    appId: 'tt1234567890abcdef',        // 替换为你的 AppID
    appSecret: 'your_douyin_app_secret' // 替换为你的 AppSecret
  }
}
```

---

## 三、H5/App 环境的第三方登录

### 微信网页授权（H5）

1. 注册 [微信开放平台](https://open.weixin.qq.com/)
2. 创建网站应用
3. 获取 `AppID` 和 `AppSecret`
4. 配置授权回调域名

**实现流程：**
```javascript
// 1. 前端跳转到微信授权页面
const redirectUri = encodeURIComponent('https://yourdomain.com/oauth/wechat/callback')
const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`
window.location.href = authUrl

// 2. 用户授权后，微信会回调到 redirect_uri，携带 code
// 3. 后端使用 code 换取 access_token 和用户信息
```

### 抖音网页授权（H5）

1. 在抖音开放平台创建网站应用
2. 配置回调域名
3. 使用 OAuth 2.0 授权码模式

**实现流程：**
```javascript
// 1. 前端跳转到抖音授权页面
const redirectUri = encodeURIComponent('https://yourdomain.com/oauth/douyin/callback')
const authUrl = `https://open.douyin.com/platform/oauth/connect?client_key=${clientKey}&response_type=code&scope=user_info&redirect_uri=${redirectUri}&state=STATE`
window.location.href = authUrl

// 2. 用户授权后回调，后端换取 access_token
```

---

## 四、测试流程

### 1. 微信小程序测试

1. 使用微信开发者工具打开项目
2. 配置 AppID
3. 编译运行
4. 点击"微信一键登录"按钮
5. 授权手机号
6. 检查是否成功登录

### 2. 抖音小程序测试

1. 使用抖音开发者工具打开项目
2. 配置 AppID
3. 编译运行
4. 点击"抖音一键登录"按钮
5. 授权手机号
6. 检查是否成功登录

### 3. H5 测试

1. 在浏览器中打开 H5 页面
2. 应该同时显示微信和抖音登录按钮
3. 点击按钮测试跳转逻辑

---

## 五、常见问题

### Q1: 微信小程序提示"该小程序未开通手机号快速验证"
**A:** 需要在微信小程序后台开通该功能，个人小程序可能无法使用。

### Q2: 抖音小程序无法获取手机号
**A:** 需要在抖音开放平台申请"手机号快速验证"能力，并等待审核通过。

### Q3: 服务器域名配置失败
**A:** 确保域名是 HTTPS，并且已经备案。

### Q4: 解密手机号失败
**A:** 检查 session_key 是否正确，以及加密数据是否完整。

### Q5: H5 环境无法唤起微信/抖音授权
**A:** H5 环境需要使用网页授权流程，不能直接使用小程序的 API。

---

## 六、安全建议

1. **不要将 AppSecret 提交到代码仓库**
   - 使用环境变量或配置文件
   - 将配置文件添加到 `.gitignore`

2. **验证用户授权**
   - 检查用户是否同意隐私协议
   - 验证授权回调的 state 参数

3. **HTTPS 必须**
   - 所有 API 接口必须使用 HTTPS
   - 配置 SSL 证书

4. **数据加密**
   - 敏感数据传输加密
   - 手机号等信息脱敏存储

---

## 七、相关文档

- [微信小程序登录文档](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html)
- [微信手机号快速验证](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/getPhoneNumber.html)
- [抖音小程序登录文档](https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/api/open-interface/log-in/tt-login)
- [抖音手机号验证](https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/api/open-interface/user-information/tt-get-phone-number)

---

## 八、技术支持

如有问题，请联系：
- 微信公众平台客服
- 抖音开放平台客服
- 项目开发团队


