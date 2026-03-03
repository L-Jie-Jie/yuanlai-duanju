<template>
  <view class="page-container">
    <view class="statusbar"></view>
    
    <!-- 顶部标题 -->
    <view class="page-header">
      <text class="page-title">历史记录</text>
      <view v-if="last.length > 0" class="header-action" @click="clearHistory">
        <uni-icons type="trash" size="20" color="rgba(255,255,255,0.5)"></uni-icons>
        <text class="action-text">清空</text>
      </view>
    </view>

    <!-- 内容区域 -->
    <scroll-view class="content-scroll" scroll-y :show-scrollbar="false">
      <view v-if="last.length > 0" class="content-area">
        <shortlist :list="last" />
      </view>
      
      <view v-else class="empty-state">
        <text class="empty-icon">🕐</text>
        <text class="empty-text">还没有观看记录</text>
        <text class="empty-hint">开始观看短剧后会显示在这里</text>
      </view>
    </scroll-view>
    
    <!-- 自定义TabBar -->
    <CustomTabBar current="history" />
  </view>
</template>

<script>
import shortlist from '@/components/vertical.vue'
import CustomTabBar from '@/components/CustomTabBar.vue'
import request from '@/common/request'
import { mapState } from 'vuex'

export default {
  name: 'history',
  components: { 
    shortlist,
    CustomTabBar
  },
  data() {
    return {
      last: []
    }
  },
  async onLoad() {
    await this.getData()
  },
  async onShow() {
    await this.getData()
  },
  computed: {
    ...mapState({
      user: (state) => state.user,
      token: (state) => state.token
    })
  },
  watch: {
    async token(val, oldVal) {
      await this.getData()
    }
  },
  methods: {
    async getData() {
      try {
        const data = await request.post('/profile/favorite')
        this.last = data.last || []
      } catch (error) {
        console.error('获取历史记录失败:', error)
      }
    },
    clearHistory() {
      uni.showModal({
        title: '提示',
        content: '确定要清空所有观看记录吗？',
        success: (res) => {
          if (res.confirm) {
            // TODO: 调用清空历史记录的接口
            this.last = []
            uni.showToast({
              title: '已清空',
              icon: 'success'
            })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #050505;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 40rpx 24rpx;
  background: #050505;
}

.page-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  letter-spacing: 2rpx;
}

.header-action {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.05);
}

.action-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
}

.content-scroll {
  flex: 1;
  height: 0;
}

.content-area {
  min-height: 100%;
  padding: 32rpx 40rpx;
  padding-bottom: 160rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 160rpx 40rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
  opacity: 0.3;
}

.empty-text {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 16rpx;
}

.empty-hint {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.4);
}
</style>

