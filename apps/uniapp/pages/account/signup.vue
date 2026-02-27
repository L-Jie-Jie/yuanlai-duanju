<template>
  <view class="register-page">
    <view class="phone-shell">
      <!-- 氛围背景光效与纹理 -->
      <view class="bg-glow"></view>
      <view class="bg-overlay"></view>

      <!-- 顶部操作栏 -->
      <view class="top-actions">
        <button class="circle-btn" @click="goBack">
          <uni-icons type="left" size="24" color="#ffffff"></uni-icons>
        </button>
      </view>

      <view class="content-shell">
        <!-- 注册表单 -->
        <view class="register-view">
          <view class="register-header">
            <text class="register-title">欢迎注册</text>
            <text class="register-desc">请填写以下信息完成注册</text>
          </view>

          <view class="form-area">
            <!-- 手机号输入 -->
            <view class="field-group" :class="{'focus-active': phoneFocus}">
              <view class="field-icon">
                <uni-icons type="phone" size="22" :color="phoneFocus ? '#E5B567' : 'rgba(255,255,255,0.4)'"></uni-icons>
              </view>
              <input
                v-model="phone"
                class="field-input"
                type="number"
                maxlength="11"
                placeholder="请输入手机号"
                placeholder-style="color: rgba(255,255,255,0.3);"
                @focus="phoneFocus = true"
                @blur="phoneFocus = false"
              />
            </view>

            <!-- 验证码输入 -->
            <view class="field-group" :class="{'focus-active': codeFocus}">
              <view class="field-icon">
                <uni-icons type="chatbubble" size="22" :color="codeFocus ? '#E5B567' : 'rgba(255,255,255,0.4)'"></uni-icons>
              </view>
              <input
                v-model="code"
                class="field-input"
                type="number"
                maxlength="6"
                placeholder="请输入验证码"
                placeholder-style="color: rgba(255,255,255,0.3);"
                @focus="codeFocus = true"
                @blur="codeFocus = false"
              />
              <view class="code-btn-wrap">
                <button 
                  class="code-btn" 
                  :disabled="countdown > 0"
                  @click="sendCode"
                >
                  {{ countdown > 0 ? `${countdown}秒后重试` : '获取验证码' }}
                </button>
              </view>
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
                placeholder="请输入密码（至少6位）"
                placeholder-style="color: rgba(255,255,255,0.3);"
                @focus="pwdFocus = true"
                @blur="pwdFocus = false"
              />
              <view class="toggle-eye" @click="showPassword = !showPassword">
                <uni-icons :type="showPassword ? 'eye-filled' : 'eye-slash'" size="22" :color="showPassword ? '#ffffff' : 'rgba(255,255,255,0.4)'"></uni-icons>
              </view>
            </view>

            <!-- 确认密码输入 -->
            <view class="field-group" :class="{'focus-active': confirmPwdFocus}">
              <view class="field-icon">
                <uni-icons type="locked" size="22" :color="confirmPwdFocus ? '#E5B567' : 'rgba(255,255,255,0.4)'"></uni-icons>
              </view>
              <input
                v-model="confirmPassword"
                class="field-input"
                :password="!showConfirmPassword"
                placeholder="请再次输入密码"
                placeholder-style="color: rgba(255,255,255,0.3);"
                @focus="confirmPwdFocus = true"
                @blur="confirmPwdFocus = false"
              />
              <view class="toggle-eye" @click="showConfirmPassword = !showConfirmPassword">
                <uni-icons :type="showConfirmPassword ? 'eye-filled' : 'eye-slash'" size="22" :color="showConfirmPassword ? '#ffffff' : 'rgba(255,255,255,0.4)'"></uni-icons>
              </view>
            </view>

            <button class="submit-btn" @click="submitRegister">立即注册</button>
            
            <view class="login-row">
              <text class="login-tip">已有账号？</text>
              <text class="login-link" @click="goLogin">立即登录</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 公共底部：用户协议 -->
      <view class="agreement-wrap" :class="{'shake-anim': shakeAgree}" @click="toggleAgree">
        <view class="custom-checkbox" :class="{ checked: agreeChecked }"></view>
        <view class="agreement-text-box">
          <text class="agreement-text">我已阅读并同意</text>
          <text class="agreement-link" @click.stop="noop">《用户服务协议》</text>
          <text class="agreement-text">和</text>
          <text class="agreement-link" @click.stop="noop">《隐私政策》</text>
        </view>
      </view>

    </view>
  </view>
</template>

<script>
import request from '@/common/request'
import store from '@/store/index.js'

export default {
  name: 'signup',
  data() {
    return {
      phone: '',
      code: '',
      password: '',
      confirmPassword: '',
      showPassword: false,
      showConfirmPassword: false,
      phoneFocus: false,
      codeFocus: false,
      pwdFocus: false,
      confirmPwdFocus: false,
      agreeChecked: false,
      shakeAgree: false,
      countdown: 0,
      timer: null
    }
  },
  onUnload() {
    // 清理定时器
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  },
  methods: {
    noop() {
      // 阻止冒泡，真实项目中用来跳转到协议页面
    },
    toggleAgree() {
      this.agreeChecked = !this.agreeChecked
    },
    ensureAgreement() {
      if (this.agreeChecked) {
        return true
      }
      // 触发协议未勾选动画
      this.shakeAgree = true
      setTimeout(() => { this.shakeAgree = false }, 400)
      
      uni.showToast({
        title: '请先勾选并同意底部协议',
        icon: 'none'
      })
      return false
    },
    goBack() {
      uni.navigateBack({ delta: 1 })
    },
    goLogin() {
      uni.redirectTo({
        url: '/pages/account/signin'
      })
    },
    validatePhone() {
      const phoneReg = /^1[3-9]\d{9}$/
      if (!this.phone) {
        uni.showToast({
          title: '请输入手机号',
          icon: 'none'
        })
        return false
      }
      if (!phoneReg.test(this.phone)) {
        uni.showToast({
          title: '请输入正确的11位手机号',
          icon: 'none'
        })
        return false
      }
      return true
    },
    async sendCode() {
      if (!this.ensureAgreement()) {
        return
      }
      
      if (!this.validatePhone()) {
        return
      }

      try {
        uni.showLoading({
          title: '发送中...'
        })
        
        const res = await request.post('/app/user/sendCode', {
          phone: this.phone
        })
        
        uni.hideLoading()
        
        // 开发环境下显示验证码
        if (res.code) {
          uni.showModal({
            title: '验证码已发送',
            content: `开发环境验证码：${res.code}`,
            showCancel: false
          })
        } else {
          uni.showToast({
            title: '验证码已发送',
            icon: 'success'
          })
        }
        
        // 开始倒计时
        this.countdown = 60
        this.timer = setInterval(() => {
          this.countdown--
          if (this.countdown <= 0) {
            clearInterval(this.timer)
            this.timer = null
          }
        }, 1000)
        
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: error.msg || '发送失败，请稍后重试',
          icon: 'none'
        })
      }
    },
    async submitRegister() {
      if (!this.ensureAgreement()) {
        return
      }
      
      // 验证手机号
      if (!this.validatePhone()) {
        return
      }
      
      // 验证验证码
      if (!this.code || this.code.length !== 6) {
        uni.showToast({
          title: '请输入6位验证码',
          icon: 'none'
        })
        return
      }
      
      // 验证密码
      if (!this.password || this.password.length < 6) {
        uni.showToast({
          title: '密码至少6位',
          icon: 'none'
        })
        return
      }
      
      // 验证确认密码
      if (this.password !== this.confirmPassword) {
        uni.showToast({
          title: '两次输入的密码不一致',
          icon: 'none'
        })
        return
      }
      
      try {
        uni.showLoading({
          title: '注册中...'
        })
        
        const res = await request.post('/app/user/register', {
          phone: this.phone,
          password: this.password,
          code: this.code
        })
        
        uni.hideLoading()
        
        uni.showToast({
          title: '注册成功',
          icon: 'success',
          duration: 2000
        })
        
        // 延迟跳转到登录页
        setTimeout(() => {
          uni.redirectTo({
            url: '/pages/account/signin'
          })
        }, 2000)
        
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: error.msg || '注册失败，请稍后重试',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.register-page {
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

/* 主内容 */
.content-shell {
  position: relative;
  width: 100vw;
  height: 100vh;
  padding-top: 220rpx;
  /* #ifdef MP */
  padding-top: 300rpx;
  /* #endif */
}

.register-view {
  width: 100%;
  padding: 0 64rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.register-header {
  margin-bottom: 60rpx;
}

.register-title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 16rpx;
}

.register-desc {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.5);
}

.form-area {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
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

.code-btn-wrap {
  padding-right: 20rpx;
  flex-shrink: 0;
}

.code-btn {
  padding: 12rpx 24rpx;
  font-size: 24rpx;
  color: #E5B567;
  background: rgba(229, 181, 103, 0.1);
  border: 1rpx solid rgba(229, 181, 103, 0.3);
  border-radius: 12rpx;
  line-height: 1.5;
  &::after { display: none; }
}

.code-btn[disabled] {
  color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
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
  margin-top: 24rpx;
  border: none;
  &::after { display: none; }
  &:active { transform: scale(0.97); }
  transition: transform 0.2s ease;
}

.login-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  margin-top: 32rpx;
}

.login-tip {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.5);
}

.login-link {
  font-size: 28rpx;
  color: #E5B567;
  font-weight: 500;
  position: relative;
}
.login-link::after {
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
  bottom: 100rpx;
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
