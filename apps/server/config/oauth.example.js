// OAuth 配置示例文件
// 复制此文件为 oauth.js 并填入真实的配置信息

export default {
  // 微信小程序配置
  wechat: {
    miniProgram: {
      appId: 'wx1234567890abcdef',        // 微信小程序 AppID
      appSecret: 'your_wechat_app_secret' // 微信小程序 AppSecret
    },
    // 微信开放平台配置（用于 H5/App 登录）
    openPlatform: {
      appId: 'wxabcdef1234567890',
      appSecret: 'your_wechat_open_secret',
      redirectUri: 'https://yourdomain.com/oauth/wechat/callback'
    }
  },

  // 抖音小程序配置
  douyin: {
    miniProgram: {
      appId: 'tt1234567890abcdef',        // 抖音小程序 AppID
      appSecret: 'your_douyin_app_secret' // 抖音小程序 AppSecret
    },
    // 抖音开放平台配置（用于 H5/App 登录）
    openPlatform: {
      clientKey: 'aw1234567890abcdef',
      clientSecret: 'your_douyin_open_secret',
      redirectUri: 'https://yourdomain.com/oauth/douyin/callback'
    }
  }
}


