<template>
  <view class="login-page">
    <view class="phone-shell">
      <!-- 氛围背景光效与纹理 -->
      <view class="bg-glow"></view>
      <view class="bg-overlay"></view>

      <!-- 顶部操作栏 -->
      <view class="top-actions">
        <button class="circle-btn" :class="{ hidden: !isAccountView }" @click="goBackView">
          <uni-icons type="left" size="24" color="#ffffff"></uni-icons>
        </button>
        <button class="circle-btn" :class="{ hidden: isAccountView }" @click="closePage">
          <uni-icons type="closeempty" size="24" color="#ffffff"></uni-icons>
        </button>
      </view>

      <view class="content-shell">
        <!-- ====== 视图 1：一键登录聚合页 ====== -->
        <view class="view-section landing-view" :class="isAccountView ? 'view-hidden-left' : 'view-active'">
          
          <!-- Logo & 品牌 -->
          <view class="brand-area">
            <view class="brand-logo-wrap">
              <image class="brand-logo" :src="platformLogo" mode="aspectFit"></image>
            </view>
            <text class="brand-title">来之源短剧</text>
            <text class="brand-subtitle">海量短剧，沉浸体验，随时随地</text>
          </view>

          <!-- 登录操作区 -->
          <view class="login-actions">
            <!-- 微信一键登录 -->
            <block v-if="showWechatBtn">
              <!-- #ifdef MP-WEIXIN -->
              <button
                class="quick-btn btn-wechat"
                open-type="getPhoneNumber"
                @getphonenumber="onWechatGetPhone"
              >
                <image class="btn-icon" :src="wechatIcon" mode="aspectFit"></image>
                <text>微信一键登录</text>
              </button>
              <!-- #endif -->
              <!-- #ifdef H5 || APP-PLUS -->
              <button class="quick-btn btn-wechat" @click="onWechatH5Login">
                <image class="btn-icon" :src="wechatIcon" mode="aspectFit"></image>
                <text>微信一键登录</text>
              </button>
              <!-- #endif -->
            </block>

            <!-- 抖音一键登录 -->
            <block v-if="showDouyinBtn">
              <!-- #ifdef MP-TOUTIAO -->
              <button
                class="quick-btn btn-toutiao"
                open-type="getPhoneNumber"
                @getphonenumber="onDouyinGetPhone"
              >
                <image class="btn-icon" :src="douyinIcon" mode="aspectFit"></image>
                <text>抖音一键登录</text>
              </button>
              <!-- #endif -->
              <!-- #ifdef H5 || APP-PLUS -->
              <button class="quick-btn btn-toutiao" @click="onDouyinH5Login">
                <image class="btn-icon" :src="douyinIcon" mode="aspectFit"></image>
                <text>抖音一键登录</text>
              </button>
              <!-- #endif -->
            </block>

            <view class="divider-row">
              <view class="divider-line"></view>
              <text class="divider-text">或</text>
              <view class="divider-line"></view>
            </view>

            <button class="quick-btn btn-account" @click="goPhoneView">
              账号密码登录
            </button>
          </view>
        </view>
        <!-- ====== 视图 1 结束 ====== -->

        <!-- ====== 视图 2：账号密码登录 ====== -->
        <view class="view-section account-view" :class="isAccountView ? 'view-active' : 'view-hidden'">
          <view class="account-header">
            <text class="account-title">欢迎回来</text>
            <text class="account-desc">请输入您的账号密码进行登录</text>
          </view>

          <view class="form-area">
            <!-- 手机号输入 -->
            <view class="field-group" :class="{'focus-active': userFocus}">
              <view class="field-icon">
                <uni-icons type="person" size="22" :color="userFocus ? '#E5B567' : 'rgba(255,255,255,0.4)'"></uni-icons>
              </view>
              <input
                v-model="phone"
                class="field-input"
                type="number"
                maxlength="11"
                placeholder="手机号 / 邮箱"
                placeholder-style="color: rgba(255,255,255,0.3);"
                @focus="userFocus = true"
                @blur="userFocus = false"
              />
            </view>

            <!-- 密码输入 -->
            <view class="field-group" :class="{'focus-active': pwdFocus}">
              <view class="field-icon">
                <uni-icons type="locked" size="22" :color="pwdFocus ? '#E5B567' : 'rgba(255,255,255,0.4)'"></uni-icons>
              </view>
              <input
                v-model="password"
                class="field-input"
                :password="!showPassword"
                placeholder="请输入密码"
                placeholder-style="color: rgba(255,255,255,0.3);"
                @focus="pwdFocus = true"
                @blur="pwdFocus = false"
              />
              <view class="toggle-eye" @click="showPassword = !showPassword">
                <uni-icons :type="showPassword ? 'eye-filled' : 'eye-slash'" size="22" :color="showPassword ? '#ffffff' : 'rgba(255,255,255,0.4)'"></uni-icons>
              </view>
            </view>

            <view class="forget-row">
              <text class="forget-text" @click="showForgetTip">忘记密码？</text>
            </view>

            <button class="submit-btn" @click="submitPhoneLogin">立即登录</button>
            
            <view class="register-row">
              <text class="register-tip">还没有账号？</text>
              <text class="register-link" @click="goRegister">免费注册</text>
            </view>
          </view>
        </view>
        <!-- ====== 视图 2 结束 ====== -->

      </view>

      <!-- 公共底部：用户协议 -->
      <view class="agreement-wrap" :class="{'shake-anim': shakeAgree}" @click="toggleAgree">
        <view class="custom-checkbox" :class="{ checked: agreeChecked }"></view>
        <view class="agreement-text-box">
          <text class="agreement-text">我已阅读并同意</text>
          <text class="agreement-link" @click.stop="noop">《用户服务协议》</text>
          <text class="agreement-text">、</text>
          <text class="agreement-link" @click.stop="noop">《隐私政策》</text>
          <text class="agreement-text">以及</text>
          <text class="agreement-link" @click.stop="noop">《中国移动认证条款》</text>
        </view>
      </view>

    </view>
  </view>
</template>

<script>
import request from '@/common/request'
import store from '@/store/index.js'

export default {
  name: 'signin',
  data() {
    return {
      platformLogo: '/static/login/platform-logo.png',
      wechatIcon: '/static/login/wechat-icon.png',
      douyinIcon: '/static/login/douyin-icon.png',
      isAccountView: false,
      agreeChecked: false,
      shakeAgree: false,
      phone: '',
      password: '',
      showPassword: false,
      userFocus: false,
      pwdFocus: false,
      // 环境检测
      isWeixinMp: false,
      isDouyinMp: false,
      isH5: false,
      isApp: false
    }
  },
  onLoad() {
    this.detectPlatform()
  },
  computed: {
    // 是否显示微信登录按钮
    showWechatBtn() {
      // 微信小程序环境：显示
      // H5/App环境：显示
      // 抖音小程序环境：不显示
      return this.isWeixinMp || this.isH5 || this.isApp
    },
    // 是否显示抖音登录按钮
    showDouyinBtn() {
      // 抖音小程序环境：显示
      // H5/App环境：显示
      // 微信小程序环境：不显示
      return this.isDouyinMp || this.isH5 || this.isApp
    }
  },
  methods: {
    // 检测当前运行平台
    detectPlatform() {
      // #ifdef MP-WEIXIN
      this.isWeixinMp = true
      // #endif
      
      // #ifdef MP-TOUTIAO
      this.isDouyinMp = true
      // #endif
      
      // #ifdef H5
      this.isH5 = true
      // #endif
      
      // #ifdef APP-PLUS
      this.isApp = true
      // #endif
      
      console.log('Platform detected:', {
        isWeixinMp: this.isWeixinMp,
        isDouyinMp: this.isDouyinMp,
        isH5: this.isH5,
        isApp: this.isApp
      })
    },
    noop() {
      // 阻止冒泡，真实项目中用来跳转到协议页面
    },
    persistLoginState(userinfo) {
      if (!userinfo || !userinfo.token || !userinfo.user) {
        throw new Error('Invalid login response')
      }
      const { token, user } = userinfo
      store.commit('token', token)
      store.commit('user', user)
      uni.setStorageSync('x-auth-sig', token)
      uni.setStorageSync('user', JSON.stringify(user))
      uni.switchTab({
        url: '/pages/account/center'
      })
    },
    ensureAgreement() {
      if (this.agreeChecked) {
        return true
      }
      // 触发协议未勾选动画
      this.shakeAgree = true;
      setTimeout(() => { this.shakeAgree = false }, 400);
      
      uni.showToast({
        title: '请先勾选并同意底部协议',
        icon: 'none'
      })
      return false
    },
    goPhoneView() {
      if (!this.ensureAgreement()) {
        return
      }
      this.isAccountView = true
    },
    goBackView() {
      this.isAccountView = false
    },
    closePage() {
      const pages = getCurrentPages()
      if (pages && pages.length > 1) {
        uni.navigateBack({ delta: 1 })
        return
      }
      uni.switchTab({
        url: '/pages/home/main'
      })
    },
    showUnsupportedTip(platformName) {
      uni.showToast({
        title: `${platformName}一键登录仅在对应小程序可用`,
        icon: 'none'
      })
    },
    toggleAgree() {
      this.agreeChecked = !this.agreeChecked
    },
    showForgetTip() {
      uni.showToast({
        title: '该功能暂未开放，请联系平台客服',
        icon: 'none'
      })
    },
    goRegister() {
      uni.navigateTo({
        url: '/pages/account/signup'
      })
    },
    async submitPhoneLogin() {
      if (!this.ensureAgreement()) {
        return
      }
      if (!this.phone || this.phone.length < 11) {
        uni.showToast({
          title: '请输入正确手机号',
          icon: 'none'
        })
        return
      }
      if (!this.password || this.password.length < 6) {
        uni.showToast({
          title: '密码至少6位',
          icon: 'none'
        })
        return
      }
      try {
        const userinfo = await request.post('/public/login', {
          username: this.phone,
          password: this.password
        })
        this.persistLoginState(userinfo)
      } catch (error) {
        uni.showToast({
          title: '手机号或密码错误',
          icon: 'none'
        })
      }
    },
    async doMiniProgramLogin(provider, phoneAuthPayload) {
      if (!this.ensureAgreement()) {
        return null
      }
      return new Promise((resolve, reject) => {
        uni.login({
          provider,
          success: async (loginRes) => {
            try {
              const userinfo = await request.post('/oauth/miniapp', {
                platform: provider,
                code: loginRes.code || '',
                ...phoneAuthPayload
              })
              resolve(userinfo)
            } catch (error) {
              reject(error)
            }
          },
          fail: reject
        })
      })
    },
    async onWechatGetPhone(event) {
      try {
        const detail = (event && event.detail) || {}
        if (detail.errMsg && detail.errMsg.indexOf('ok') === -1) {
          uni.showToast({
            title: '用户未授权手机号',
            icon: 'none'
          })
          return
        }
        const userinfo = await this.doMiniProgramLogin('weixin', {
          encryptedData: detail.encryptedData || '',
          iv: detail.iv || '',
          phoneCode: detail.code || ''
        })
        if (userinfo) {
          this.persistLoginState(userinfo)
        }
      } catch (error) {
        uni.showToast({
          title: '微信登录失败，请稍后重试',
          icon: 'none'
        })
      }
    },
    async onDouyinGetPhone(event) {
      try {
        const detail = (event && event.detail) || {}
        if (detail.errMsg && detail.errMsg.indexOf('ok') === -1) {
          uni.showToast({
            title: '用户未授权手机号',
            icon: 'none'
          })
          return
        }
        const userinfo = await this.doMiniProgramLogin('toutiao', {
          encryptedData: detail.encryptedData || '',
          iv: detail.iv || '',
          phoneCode: detail.code || ''
        })
        if (userinfo) {
          this.persistLoginState(userinfo)
        }
      } catch (error) {
        uni.showToast({
          title: '抖音登录失败，请稍后重试',
          icon: 'none'
        })
      }
    },
    // H5/App 环境的微信登录
    onWechatH5Login() {
      if (!this.ensureAgreement()) {
        return
      }
      uni.showToast({
        title: 'H5微信登录开发中，请使用账号密码登录',
        icon: 'none',
        duration: 2000
      })
      // TODO: 实现微信网页授权登录
      // 1. 跳转到微信授权页面
      // 2. 获取授权码
      // 3. 后端换取 access_token 和用户信息
    },
    // H5/App 环境的抖音登录
    onDouyinH5Login() {
      if (!this.ensureAgreement()) {
        return
      }
      uni.showToast({
        title: 'H5抖音登录开发中，请使用账号密码登录',
        icon: 'none',
        duration: 2000
      })
      // TODO: 实现抖音网页授权登录
      // 1. 跳转到抖音授权页面
      // 2. 获取授权码
      // 3. 后端换取 access_token 和用户信息
    }
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', 'STHeiti', 'Microsoft Yahei', 'Tahoma', 'Simsun', sans-serif;
  min-height: 100vh;
  background-color: #1a1a1a;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 全屏/容器约束 */
.phone-shell {
  width: 100vw;
  min-height: 100vh;
  background-color: #050505;
  position: relative;
  overflow: hidden;
  color: #ffffff;
}

/* 顶部光晕背景 */
.bg-glow {
  position: absolute;
  width: 600rpx;
  height: 600rpx;
  background: radial-gradient(circle, rgba(229, 181, 103, 0.15) 0%, rgba(5, 5, 5, 0) 70%);
  top: -100rpx;
  left: 50%;
  transform: translateX(-50%);
  z-index: 0;
  pointer-events: none;
}

/* 遮罩底纹（可选，增加厚重感） */
.bg-overlay {
  position: absolute;
  inset: 0;
  background-image: url('https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=800&auto=format&fit=crop');
  background-size: cover;
  opacity: 0.1;
  mix-blend-mode: overlay;
  pointer-events: none;
}

/* 顶部返回/关闭按钮 */
.top-actions {
  position: absolute;
  top: 96rpx;
  /* #ifdef MP */
  top: 180rpx; /* 小程序端避开胶囊 */
  /* #endif */
  left: 40rpx;
  z-index: 20;
}

.circle-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  border: none;
  transition: all 0.3s ease;
  &::after { display: none; }
  &:active { background: rgba(255, 255, 255, 0.2); }
}

.hidden {
  opacity: 0;
  pointer-events: none;
  position: absolute;
}

/* 主内容过渡框架 */
.content-shell {
  position: relative;
  width: 100vw;
  height: 100vh;
  padding-top: 220rpx;
  /* #ifdef MP */
  padding-top: 300rpx;
  /* #endif */
}

.view-section {
  position: absolute;
  left: 0;
  top: 220rpx;
  /* #ifdef MP */
  top: 300rpx;
  /* #endif */
  width: 100%;
  height: calc(100vh - 220rpx);
  padding: 0 64rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.view-active {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
  z-index: 10;
}

.view-hidden {
  opacity: 0;
  transform: translateX(40rpx);
  pointer-events: none;
}

.view-hidden-left {
  opacity: 0;
  transform: translateX(-40rpx);
  pointer-events: none;
}

/* 聚合登录页 */
.brand-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 60rpx;
}

.brand-logo-wrap {
  width: 160rpx;
  height: 160rpx;
  border-radius: 32rpx;
  background: linear-gradient(135deg, #E5B567 0%, #a6792b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 60rpx rgba(229, 181, 103, 0.3);
  margin-bottom: 48rpx;
  overflow: hidden;
}

.brand-logo {
  width: 100%;
  height: 100%;
}

.brand-title {
  font-size: 48rpx;
  font-weight: 700;
  letter-spacing: 4rpx;
  color: #ffffff;
  margin-bottom: 16rpx;
}

.brand-subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 2rpx;
}

.login-actions {
  margin-top: auto;
  margin-bottom: 200rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.quick-btn {
  width: 100%;
  height: 112rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  font-size: 32rpx;
  font-weight: 500;
  padding: 0;
  margin: 0;
  &::after { display: none; }
  &:active { transform: scale(0.97); }
  transition: transform 0.2s ease;
}

.btn-icon {
  width: 48rpx;
  height: 48rpx;
}

.btn-wechat {
  background-color: #07C160;
  color: #ffffff;
  box-shadow: 0 8rpx 40rpx rgba(7, 193, 96, 0.3);
}

.btn-toutiao {
  background-color: #1E1E23;
  border: 1rpx solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.2);
}

.btn-account {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  color: rgba(255, 255, 255, 0.9);
}

.divider-row {
  display: flex;
  align-items: center;
  gap: 28rpx;
  opacity: 0.5;
  margin: 8rpx 0;
}

.divider-line {
  flex: 1;
  height: 2rpx;
  background: linear-gradient(to right, transparent, #ffffff, transparent);
}

.divider-text {
  font-size: 24rpx;
  color: #ffffff;
}

/* 账号密码登录页 */
.account-header {
  margin-bottom: 60rpx;
}

.account-title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 16rpx;
}

.account-desc {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.5);
}

.form-area {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
}

.field-group {
  position: relative;
  width: 100%;
  height: 112rpx;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 2rpx solid rgba(255, 255, 255, 0.1);
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.field-group.focus-active {
  border-color: rgba(229, 181, 103, 0.5);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 30rpx rgba(229, 181, 103, 0.1);
}

.field-icon {
  width: 96rpx;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.field-input {
  flex: 1;
  height: 100%;
  font-size: 30rpx;
  color: #ffffff;
  background-color: transparent;
  padding-right: 30rpx;
}

.toggle-eye {
  width: 96rpx;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 10;
}

.forget-row {
  display: flex;
  justify-content: flex-end;
  margin-top: -16rpx;
}

.forget-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
  transition: color 0.3s;
}
.forget-text:active {
  color: #E5B567;
}

.submit-btn {
  width: 100%;
  height: 112rpx;
  border-radius: 24rpx;
  background: linear-gradient(90deg, #E5B567, #c2964d);
  color: #050505;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 40rpx rgba(229, 181, 103, 0.25);
  margin-top: 16rpx;
  border: none;
  &::after { display: none; }
  &:active { transform: scale(0.97); }
  transition: transform 0.2s ease;
}

.register-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  margin-top: 32rpx;
}

.register-tip {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.5);
}

.register-link {
  font-size: 28rpx;
  color: #E5B567;
  font-weight: 500;
  position: relative;
}
.register-link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -4rpx;
  width: 100%;
  height: 2rpx;
  background-color: #E5B567;
}

/* 底部协议区 */
.agreement-wrap {
  position: absolute;
  bottom: 80rpx;
  /* #ifdef MP */
  bottom: 100rpx; /* 留出版权区/安全区距离 */
  /* #endif */
  left: 0;
  width: 100%;
  padding: 0 64rpx;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  z-index: 20;
}

.custom-checkbox {
  width: 32rpx;
  height: 32rpx;
  border-radius: 8rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  box-sizing: border-box;
  position: relative;
  flex-shrink: 0;
  margin-top: 4rpx;
  transition: all 0.2s ease;
}

.custom-checkbox.checked {
  background: #E5B567;
  border-color: #E5B567;
}

.custom-checkbox.checked::after {
  content: '';
  position: absolute;
  left: 10rpx;
  top: 4rpx;
  width: 8rpx;
  height: 16rpx;
  border: solid #050505;
  border-width: 0 4rpx 4rpx 0;
  transform: rotate(45deg);
}

.agreement-text-box {
  flex: 1;
  line-height: 1.6;
}

.agreement-text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.4);
}

.agreement-link {
  font-size: 22rpx;
  color: #E5B567;
}

/* 阻断提醒晃动动画 */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10rpx); }
  75% { transform: translateX(10rpx); }
}
.shake-anim {
  animation: shake 0.2s ease-in-out 2;
}
</style>