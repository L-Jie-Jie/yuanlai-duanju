<template>
  <view class="m5c-canvas-shell">
    <view class="m5c-safe-gap"></view>
    <view class="m5c-page-headline">{{ $t('profile') }}</view>

    <view class="m5c-profile-card" @click="triggerMpIdentityPatch">
      <view class="m5c-avatar-ring">
        <image
          class="m5c-avatar-core"
          :src="user.avatar || '/static/default.jpg'"
          mode="aspectFill"
        ></image>
      </view>
      <text class="m5c-name-text">{{ user.username || 'Visitor' }}</text>
      <text class="m5c-uid-text" @click.stop="handleUidTapBurst(user._id)">
        UID: {{ user._id || '--' }}
      </text>
      <view
        class="m5c-signin-entry"
        v-if="!token || (user && user.guest)"
        @click.stop="routeSigninBridge"
      >
        {{ $t('signin') }}
      </view>
    </view>

    <view class="m5c-asset-grid">
      <view class="m5c-asset-tile" @click="goWalletVault">
        <view class="m5c-asset-topline">
          <uni-icons type="wallet" color="#72b9ff" size="19"></uni-icons>
          <text class="m5c-asset-label">My Wallet</text>
        </view>
        <text class="m5c-asset-value">{{ walletCoinEcho }} Coins</text>
      </view>

      <view class="m5c-asset-tile m5c-asset-tile--accent" @click="goRechargeDock">
        <view class="m5c-asset-topline">
          <uni-icons type="plus" color="#ffd6c2" size="18"></uni-icons>
          <text class="m5c-asset-label">Top Up</text>
        </view>
        <text class="m5c-asset-value">{{ walletBonusEcho }} Bonus</text>
      </view>
    </view>

    <view class="m5c-menu-matrix">
      <view
        class="m5c-menu-node"
        v-for="node in entryDeck"
        :key="node.axisKey"
        @click="dispatchMenuNode(node.axisKey)"
      >
        <view class="m5c-menu-main">
          <uni-icons
            custom-prefix="iconfont"
            :type="node.iconGlyph"
            color="#d9e6f6"
            size="18"
          ></uni-icons>
          <text class="m5c-menu-caption">{{ node.labelText }}</text>
        </view>
        <uni-icons type="right" color="#6f8199" size="14"></uni-icons>
      </view>
    </view>

    <view class="m5c-logout-wrap" v-if="token && user && !user.guest">
      <button class="m5c-logout-btn" type="warn" @click="clearSessionBridge">
        {{ $t('logout') }}
      </button>
    </view>

    <uni-popup type="bottom" ref="localeSheetPortal">
      <view class="m5c-locale-sheet">
        <text class="m5c-locale-title">{{ $t('languagesetting') }}</text>
        <view
          class="m5c-locale-row"
          v-for="dialect in localeDeck"
          :key="dialect.stamp"
          @click="applyLocaleOption(dialect.stamp)"
        >
          <text class="m5c-locale-name">{{ dialect.label }}</text>
          <uni-icons
            v-if="currentLocaleTag === dialect.stamp"
            type="checkmarkempty"
            color="#72b9ff"
            size="20"
          ></uni-icons>
        </view>
      </view>
    </uni-popup>

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

export default {
  name: 'accountCenterHub',
  components: {
    MPLogin
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
    currentLocaleTag() {
      return this.$i18n.locale
    },
    walletCoinEcho() {
      const rawCoin = Number(this.user?.coin)
      return Number.isFinite(rawCoin) ? rawCoin : 100
    },
    walletBonusEcho() {
      const rawBonus = Number(this.user?.bonus)
      return Number.isFinite(rawBonus) ? rawBonus : 0
    },
    entryDeck() {
      return [
        {
          axisKey: 'reward_portal',
          iconGlyph: 'icon-lipin',
          labelText: this.$t('rewards')
        },
        {
          axisKey: 'feedback_portal',
          iconGlyph: 'icon-xiaoxi',
          labelText: this.$t('feedback')
        },
        {
          axisKey: 'locale_portal',
          iconGlyph: 'icon-shequ',
          labelText: this.$t('language')
        },
        {
          axisKey: 'setting_portal',
          iconGlyph: 'icon-shezhi',
          labelText: this.$t('setting')
        }
      ]
    },
    localeDeck() {
      return [
        {
          stamp: 'en',
          label: this.$t('english')
        },
        {
          stamp: 'zh-Hans',
          label: this.$t('chinese')
        }
      ]
    }
  },
  methods: {
    triggerMpIdentityPatch() {
      // #ifndef MP-WEIXIN
      // 非微信环境暂不启用头像昵称拉起弹层
      // #endif

      // #ifdef MP-WEIXIN
      this.wechatPanelVisible = true
      // #endif
    },
    async submitWechatProfile(profilePacket) {
      this.wechatPanelVisible = false
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
            title: 'Copied to clipboard',
            icon: 'none'
          })
        }
      })
    },
    goWalletVault() {
      uni.navigateTo({
        url: '/pages/account/balance'
      })
    },
    goRechargeDock() {
      uni.navigateTo({
        url: '/pages/account/recharge'
      })
    },
    dispatchMenuNode(axisKey) {
      if (axisKey === 'reward_portal') {
        uni.navigateTo({
          url: '/pages/rewards/rewards'
        })
        return
      }
      if (axisKey === 'feedback_portal') {
        uni.navigateTo({
          url: '/pages/account/feedback'
        })
        return
      }
      if (axisKey === 'locale_portal') {
        this.$refs.localeSheetPortal.open('bottom')
        return
      }
      if (axisKey === 'setting_portal') {
        uni.navigateTo({
          url: '/pages/account/setting'
        })
      }
    },
    applyLocaleOption(localeStamp) {
      uni.setLocale(localeStamp)
      this.$i18n.locale = localeStamp
      setTimeout(() => {
        this.$refs.localeSheetPortal.close()
      }, 260)
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
.m5c-canvas-shell {
  min-height: 100vh;
  padding: 0 22rpx 30rpx;
  background: radial-gradient(circle at top, #22354a 0%, #111b27 44%, #0a1119 100%);
  box-sizing: border-box;
}

.m5c-safe-gap {
  height: var(--status-bar-height);
}

.m5c-page-headline {
  text-align: center;
  font-size: 36rpx;
  font-weight: 700;
  color: #eef4fc;
  padding: 12rpx 0 16rpx;
}

.m5c-profile-card {
  border-radius: 28rpx;
  padding: 24rpx 20rpx 20rpx;
  background: linear-gradient(150deg, rgba(60, 96, 132, 0.45), rgba(15, 27, 39, 0.95));
  border: 1rpx solid rgba(255, 255, 255, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.m5c-avatar-ring {
  width: 140rpx;
  height: 140rpx;
  border-radius: 999rpx;
  padding: 5rpx;
  background: linear-gradient(140deg, #90d0ff, #ff8f6b);
}

.m5c-avatar-core {
  width: 130rpx;
  height: 130rpx;
  border-radius: 999rpx;
}

.m5c-name-text {
  margin-top: 14rpx;
  font-size: 34rpx;
  color: #f2f7fe;
  font-weight: 700;
}

.m5c-uid-text {
  margin-top: 8rpx;
  color: #a7bdd5;
  font-size: 22rpx;
}

.m5c-signin-entry {
  margin-top: 16rpx;
  font-size: 23rpx;
  color: #f8efe8;
  padding: 10rpx 26rpx;
  border-radius: 999rpx;
  background: #f06a35;
}

.m5c-asset-grid {
  margin-top: 18rpx;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14rpx;
}

.m5c-asset-tile {
  border-radius: 20rpx;
  padding: 16rpx;
  background: rgba(255, 255, 255, 0.06);
  border: 1rpx solid rgba(255, 255, 255, 0.08);
}

.m5c-asset-tile--accent {
  background: linear-gradient(145deg, rgba(235, 108, 58, 0.45), rgba(199, 78, 43, 0.35));
}

.m5c-asset-topline {
  display: flex;
  align-items: center;
}

.m5c-asset-label {
  margin-left: 8rpx;
  font-size: 24rpx;
  color: #d7e5f5;
}

.m5c-asset-value {
  margin-top: 10rpx;
  display: block;
  font-size: 32rpx;
  color: #f4f8ff;
  font-weight: 700;
}

.m5c-menu-matrix {
  margin-top: 18rpx;
  border-radius: 22rpx;
  overflow: hidden;
  border: 1rpx solid rgba(255, 255, 255, 0.08);
  background: rgba(12, 20, 30, 0.82);
}

.m5c-menu-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22rpx 18rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.06);
}

.m5c-menu-node:last-child {
  border-bottom: none;
}

.m5c-menu-main {
  display: flex;
  align-items: center;
}

.m5c-menu-caption {
  margin-left: 12rpx;
  color: #d8e5f4;
  font-size: 27rpx;
}

.m5c-logout-wrap {
  margin-top: 24rpx;
}

.m5c-logout-btn {
  height: 84rpx;
  line-height: 84rpx;
  border-radius: 16rpx;
}

.m5c-locale-sheet {
  border-top-left-radius: 24rpx;
  border-top-right-radius: 24rpx;
  padding: 20rpx 24rpx 28rpx;
  background: #111a26;
}

.m5c-locale-title {
  text-align: center;
  display: block;
  font-size: 30rpx;
  color: #f0f6ff;
  font-weight: 700;
}

.m5c-locale-row {
  margin-top: 14rpx;
  border-radius: 14rpx;
  padding: 18rpx 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
}

.m5c-locale-name {
  color: #d2dfef;
  font-size: 26rpx;
}
</style>
