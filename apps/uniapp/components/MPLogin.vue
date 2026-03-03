<template>
  <view class="bg">
    <view class="container">
      <view class="headline">
        <text>元来短剧</text>
        <text>授权手机号以完成快捷登录</text>
      </view>

      <view class="tips-row">
        <text>
          仅用于账号登录与安全校验，我们会严格保护你的隐私信息。
        </text>
      </view>

      <view class="login-row">
        <!-- #ifdef MP-WEIXIN -->
        <button
          class="quick-login wechat"
          open-type="getPhoneNumber"
          @getphonenumber="onWechatGetPhone"
        >
          微信一键登录
        </button>
        <!-- #endif -->

        <!-- #ifdef MP-TOUTIAO -->
        <button
          class="quick-login toutiao"
          open-type="getPhoneNumber"
          @getphonenumber="onDouyinGetPhone"
        >
          抖音一键登录
        </button>
        <!-- #endif -->

        <button class="default" @click="$emit('close')">
          暂不登录
        </button>
      </view>

      <!--
      旧版头像昵称授权（MVP隐藏）
      <view class="choose-avatar-row">
        <text>头像</text>
        <button
          class="avatar-wrapper"
          open-type="chooseAvatar"
          @chooseavatar="onChooseAvatar"
        />
        <text>点击选择头像</text>
      </view>

      <view class="choose-nickname-row">
        <text>昵称</text>
        <input
          v-model="nickname"
          type="nickname"
          placeholder="请输入昵称"
          :cursor-spacing="120"
        />
      </view>
      -->
    </view>
  </view>
</template>

<script>
import request from '@/common/request'

export default {
  name: 'MPLogin',
  props: {},
  data() {
    return {
      avatar: '/static/avatar.jpg',
      nickname: '',
      disabled: false
    }
  },
  watch: {
    nickname: function (newVal) {
      if (newVal) {
        this.disabled = false
      }
    }
  },
  methods: {
    emitPhoneSubmitPayload(platform, detail = {}) {
      if (detail.errMsg && detail.errMsg.indexOf('ok') === -1) {
        uni.showToast({
          title: '用户未授权手机号',
          icon: 'none'
        })
        return
      }
      this.$emit('submit', {
        platform,
        encryptedData: detail.encryptedData || '',
        iv: detail.iv || '',
        phoneCode: detail.code || ''
      })
    },
    onWechatGetPhone(e) {
      this.emitPhoneSubmitPayload('weixin', e && e.detail)
    },
    onDouyinGetPhone(e) {
      this.emitPhoneSubmitPayload('toutiao', e && e.detail)
    },
    async onChooseAvatar(e) {
      try {
        const { avatarUrl } = e.detail

        const data = await request.upload(avatarUrl)
        this.avatar = data.url
      } catch (error) {
        console.log(error)
      }
    },
    submit() {
      const userinfo = {
        avatar: this.avatar,
        username: this.nickname
      }
      this.$emit('submit', userinfo)
    }
  }
}
</script>

<style lang="scss" scoped>
view {
  box-sizing: border-box;
}

.bg {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 999;
}
.container {
  color: #282828;
  width: 96vw;
  min-height: 36%;
  position: absolute;
  left: 0;
  bottom: 0;
  padding: 0 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  margin: 0 2vw;
  .headline {
    width: 100%;
    min-height: 28%;
    font-size: 14px;
    font-weight: bold;
    padding-top: 20px;

    text:nth-child(2) {
      display: block;
      font-size: 18px;
      font-weight: bold;
      margin-top: 5px;
    }
  }

  .tips-row {
    padding: 10px 2px 16px;
    font-size: 13px;
    color: #666;
    border-bottom: 1px solid #eee;
  }

  .choose-avatar-row,
  .choose-nickname-row {
    width: 100%;
    height: 20%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 10px 2px;
    font-size: 16px;
    border-bottom: 1px solid #eee;

    .avatar-wrapper {
      width: 45px;
      height: 45px;
      margin: 0;
      padding: 0;
      margin-right: 10px;
      border-radius: 50%;
      .avatar {
        width: 100%;
        height: 100%;
        ::after {
          border: 0;
        }
      }
    }
    text {
      width: 45px;
      margin-right: 10px;
    }
    text:nth-child(3) {
      width: auto;
      color: gray;
    }
  }
  .login-row {
    width: 100%;
    padding-top: 20px;
    display: flex;
    flex-direction: column;

    button {
      font-size: 14px;
      width: 100%;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-color: transparent;
      color: #fff;
      background-color: #1aad19;
      margin-top: 10px;
      border-radius: 8px;
    }
    .quick-login {
      margin-top: 0;
    }
    .wechat {
      background-color: #07c160;
    }
    .toutiao {
      background-color: #161823;
    }
    .default {
      color: #000000;
      background-color: #f8f8f8;
    }
    .inactive {
      color: #ccc;
      background-color: #f8f8f8;
    }
  }
}
// :deep(button:after) {
//   border: 0 !important;
// }
</style>
