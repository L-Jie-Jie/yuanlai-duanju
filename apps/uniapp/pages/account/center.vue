<template>
  <view class="profile-shell">
    <!-- 氛围背景光效 -->
    <view class="bg-glow"></view>
    
    <!-- 顶部标题栏 -->
    <view class="safe-gap"></view>
    <view class="page-headline">{{ $t('profile') }}</view>

    <!-- 主内容区 -->
    <scroll-view class="main-content" scroll-y enhanced :show-scrollbar="false">
      <!-- 个人信息卡片 -->
      <view class="profile-card glass-panel" @click="triggerMpIdentityPatch">
        <view class="avatar-ring">
          <image
            class="avatar-core"
            :src="user.avatar || '/static/default.jpg'"
            mode="aspectFill"
          ></image>
        </view>
        <text class="name-text">{{ user.username || 'Visitor' }}</text>
        <text class="uid-text" @click.stop="handleUidTapBurst(user._id)">
          UID: {{ user._id || '--' }}
        </text>
        
        <!-- 登录按钮 -->
        <button
          class="signin-btn"
          v-if="!token || (user && user.guest)"
          @click.stop="routeSigninBridge"
        >
          {{ $t('signin') }}
        </button>
      </view>

      <!-- 菜单列表区 -->
      <view class="menu-matrix glass-panel">
        <view
          class="menu-node"
          v-for="node in entryDeck"
          :key="node.axisKey"
          @click="dispatchMenuNode(node.axisKey)"
        >
          <view class="menu-main">
            <!-- 统一使用原生uni-icons -->
            <uni-icons
              :type="node.iconGlyph"
              color="#E5B567"
              size="22"
            ></uni-icons>
            <text class="menu-caption">{{ node.labelText }}</text>
          </view>
          <uni-icons type="right" color="rgba(255,255,255,0.4)" size="16"></uni-icons>
        </view>
      </view>

      <!-- 退出登录 -->
      <view class="logout-wrap" v-if="token && user && !user.guest">
        <button class="logout-btn glass-panel" @click="clearSessionBridge">
          <text class="logout-text">{{ $t('logout') }}</text>
        </button>
      </view>

      <!-- 底部安全留白，为自定义Tabbar让出空间 -->
      <view class="safe-bottom"></view>
    </scroll-view>

    <!-- 自定义TabBar (使用全局组件) -->
    <CustomTabBar current="profile" />

    <!-- #ifdef MP-WEIXIN -->
    <MPLogin
      v-if="wechatPanelVisible"
      @submit="submitWechatProfile"
      @close="wechatPanelVisible = false"
    ></MPLogin>
    <!-- #endif -->
  </view>
</template>

<script>
import { mapState } from 'vuex'
import store from '@/store/index.js'
import request from '@/common/request'
import MPLogin from '@/components/MPLogin.vue'
import CustomTabBar from '@/components/CustomTabBar.vue'

export default {
  name: 'accountCenterHub',
  components: {
    MPLogin,
    CustomTabBar
  },
  data() {
    return {
      uidTapPulse: 0,
      uidTapTimer: null,
      wechatPanelVisible: false
    }
  },
  computed: {
    ...mapState({
      user: (state) => state.user,
      token: (state) => state.token
    }),
    entryDeck() {
      // 隐藏了活动奖励和语言选择，仅保留反馈和设置
      return [
        {
          axisKey: 'feedback_portal',
          iconGlyph: 'chat',
          labelText: this.$t('feedback') || '意见反馈'
        },
        {
          axisKey: 'setting_portal',
          iconGlyph: 'gear',
          labelText: this.$t('setting') || '系统设置'
        }
      ]
    }
  },
  methods: {
    navTo(tabName) {
      if (tabName === 'mine') {
        // 当前已经在我的页面
        return;
      } else if (tabName === 'home') {
        uni.reLaunch({
          url: '/pages/home/main'
        });
      } else if (tabName === 'collection' || tabName === 'history') {
        uni.reLaunch({
          url: '/pages/account/bookmark'
        });
      } else if (tabName === 'discover') {
        uni.showToast({
          title: '发现频道建设中...',
          icon: 'none'
        });
      }
    },
    safeNavigateTo(targetUrl, fallbackUrl = '/pages/account/signin') {
      const aliveRouteSet = new Set([
        '/pages/home/main',
        '/pages/viewer/native/clips',
        '/pages/viewer/native/collection',
        '/pages/viewer/web/clips',
        '/pages/viewer/web/collection',
        '/pages/account/bookmark',
        '/pages/account/center',
        '/pages/account/recharge',
        '/pages/account/balance',
        '/pages/account/signup',
        '/pages/account/signin'
      ])
      const normalizedTarget = (targetUrl || '').split('?')[0]
      const normalizedFallback = (fallbackUrl || '').split('?')[0]
      const finalUrl = aliveRouteSet.has(normalizedTarget)
        ? targetUrl
        : aliveRouteSet.has(normalizedFallback)
          ? fallbackUrl
          : '/pages/account/signin'
      uni.navigateTo({
        url: finalUrl
      })
    },
    triggerMpIdentityPatch() {
      // #ifdef MP-WEIXIN
      this.wechatPanelVisible = true
      // #endif
    },
    async submitWechatProfile(profilePacket) {
      this.wechatPanelVisible = false
      const hasPhoneGrantPayload =
        profilePacket &&
        (profilePacket.phoneCode ||
          (profilePacket.encryptedData && profilePacket.iv))
      if (hasPhoneGrantPayload) {
        const oauthState = await request.post('/oauth/miniapp/phoneLogin', {
          platform: profilePacket.platform || 'weixin',
          encryptedData: profilePacket.encryptedData || '',
          iv: profilePacket.iv || '',
          phoneCode: profilePacket.phoneCode || ''
        })
        if (oauthState && oauthState.token && oauthState.user) {
          store.commit('token', oauthState.token)
          store.commit('user', oauthState.user)
          uni.setStorageSync('x-auth-sig', oauthState.token)
          uni.setStorageSync('user', JSON.stringify(oauthState.user))
        }
        return
      }
      const nextUserState = await request.post('/profile/updateUser', profilePacket)
      if (nextUserState) {
        store.commit('user', nextUserState)
        uni.setStorageSync('user', JSON.stringify(nextUserState))
      }
    },
    handleUidTapBurst(uidValue) {
      if (!uidValue) {
        return
      }
      this.uidTapPulse += 1
      if (this.uidTapTimer) {
        clearTimeout(this.uidTapTimer)
      }
      this.uidTapTimer = setTimeout(() => {
        if (this.uidTapPulse >= 2) {
          this.writeUidClipboard(uidValue)
        }
        this.uidTapPulse = 0
      }, 320)
    },
    writeUidClipboard(uidValue) {
      uni.setClipboardData({
        data: uidValue,
        success: () => {
          uni.showToast({
            title: 'UID 已复制',
            icon: 'none'
          })
        }
      })
    },
    dispatchMenuNode(axisKey) {
      if (axisKey === 'feedback_portal') {
        this.safeNavigateTo('/pages/account/feedback', '/pages/account/signin')
        return
      }
      if (axisKey === 'setting_portal') {
        this.safeNavigateTo('/pages/account/setting', '/pages/account/signin')
      }
    },
    routeSigninBridge() {
      // #ifndef MP-WEIXIN
      uni.navigateTo({
        url: '/pages/account/signin'
      })
      // #endif

      // #ifdef MP-WEIXIN
      this.runWechatOauthBridge()
      // #endif
    },
    clearSessionBridge() {
      store.commit('logout')
    },
    runWechatOauthBridge() {
      // #ifdef MP-WEIXIN
      const traceUserId = this.user?._id || ''
      uni.login({
        provider: 'weixin',
        success: async (loginPacket) => {
          if (loginPacket.errMsg === 'login:ok') {
            const oauthState = await request.post('/oauth/wechatmp?_id=' + traceUserId, {
              code: loginPacket.code
            })
            const { token, user } = oauthState

            store.commit('token', token)
            store.commit('user', user)

            uni.setStorageSync('x-auth-sig', token)
            uni.setStorageSync('user', JSON.stringify(user))
          } else {
            uni.showToast({
              title: '登录失败，请刷新重试',
              icon: 'none'
            })
          }
        }
      })
      // #endif
    }
  }
}
</script>

<style lang="scss" scoped>
/* ================= 通用与约束 ================= */
.profile-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  /* #ifdef H5 */
  height: calc(100vh - var(--window-top) - var(--window-bottom));
  /* #endif */
  background: #050505;
  color: #ffffff;
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', 'STHeiti', 'Microsoft Yahei', 'Tahoma', 'Simsun', sans-serif;
}

.bg-glow {
  position: absolute;
  width: 600rpx;
  height: 600rpx;
  background: radial-gradient(circle, rgba(229, 181, 103, 0.15) 0%, rgba(5, 5, 5, 0) 70%);
  top: -100rpx;
  right: -150rpx;
  z-index: 0;
  pointer-events: none;
}

.safe-gap {
  height: var(--status-bar-height, 0px);
  width: 100%;
  flex-shrink: 0;
  z-index: 10;
}

.page-headline {
  text-align: center;
  font-size: 34rpx;
  font-weight: 700;
  color: #ffffff;
  padding: 24rpx 0;
  z-index: 10;
  position: relative;
}

.main-content {
  flex: 1;
  height: 0;
  position: relative;
  z-index: 5;
}

/* ================= 玻璃拟态基础类 ================= */
.glass-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1rpx solid rgba(255, 255, 255, 0.08);
}

/* ================= 个人信息卡片 ================= */
.profile-card {
  margin: 20rpx 40rpx 40rpx;
  border-radius: 32rpx;
  padding: 50rpx 30rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-ring {
  width: 172rpx;
  height: 172rpx;
  border-radius: 50%;
  padding: 6rpx;
  background: linear-gradient(135deg, #E5B567 0%, #c2964d 100%);
  box-shadow: 0 8rpx 30rpx rgba(229, 181, 103, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-core {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #121214;
}

.name-text {
  margin-top: 24rpx;
  font-size: 36rpx;
  color: #ffffff;
  font-weight: 700;
  letter-spacing: 1rpx;
}

.uid-text {
  margin-top: 12rpx;
  color: rgba(255, 255, 255, 0.5);
  font-size: 24rpx;
}

.signin-btn {
  margin-top: 30rpx;
  font-size: 28rpx;
  color: #050505;
  font-weight: 600;
  width: 240rpx;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #E5B567 0%, #c2964d 100%);
  border: none;
  &::after { display: none; }
  &:active { transform: scale(0.95); }
  transition: transform 0.2s ease;
}

/* ================= 菜单列表区 ================= */
.menu-matrix {
  margin: 0 40rpx 40rpx;
  border-radius: 28rpx;
  overflow: hidden;
}

.menu-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 30rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.05);
  transition: background 0.2s ease;
  &:active { background: rgba(255, 255, 255, 0.08); }
}

.menu-node:last-child {
  border-bottom: none;
}

.menu-main {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.menu-caption {
  color: rgba(255, 255, 255, 0.9);
  font-size: 30rpx;
}

/* ================= 退出登录 ================= */
.logout-wrap {
  margin: 0 40rpx;
}

.logout-btn {
  height: 96rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  &::after { display: none; }
  &:active { transform: scale(0.98); background: rgba(255, 255, 255, 0.1); }
  transition: all 0.2s ease;
}

.logout-text {
  color: #ff4d4f; /* 柔和但醒目的红色 */
  font-size: 30rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
}

/* 底部防遮挡 (加高，让出底部自定义导航栏的位置) */
.safe-bottom {
  height: calc(180rpx + env(safe-area-inset-bottom));
}
</style>