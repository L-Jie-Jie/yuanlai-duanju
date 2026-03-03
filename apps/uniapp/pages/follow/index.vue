<template>
  <view class="page-container">
    <view class="statusbar"></view>
    
    <!-- 顶部标题 -->
    <view class="page-header">
      <text class="page-title">追剧</text>
    </view>

    <!-- Tab切换 -->
    <view class="tab-bar">
      <view 
        :class="['tab-item', { 'tab-active': activeTab === 'favorite' }]" 
        @click="switchTab('favorite')"
      >
        <text class="tab-text">我的收藏</text>
      </view>
      <view 
        :class="['tab-item', { 'tab-active': activeTab === 'history' }]" 
        @click="switchTab('history')"
      >
        <text class="tab-text">观看历史</text>
      </view>
    </view>

    <!-- 内容区域 -->
    <scroll-view class="content-scroll" scroll-y :show-scrollbar="false">
      <view v-if="activeTab === 'favorite'" class="content-area">
        <shortlist v-if="favorite.length > 0" :list="favorite" />
        <view v-else class="empty-state">
          <text class="empty-icon">📺</text>
          <text class="empty-text">还没有收藏的短剧</text>
          <text class="empty-hint">快去发现页找找喜欢的内容吧</text>
        </view>
      </view>
      
      <view v-if="activeTab === 'history'" class="content-area">
        <shortlist v-if="last.length > 0" :list="last" />
        <view v-else class="empty-state">
          <text class="empty-icon">🕐</text>
          <text class="empty-text">还没有观看记录</text>
          <text class="empty-hint">开始观看短剧后会显示在这里</text>
        </view>
      </view>
    </scroll-view>
    
    <!-- 自定义TabBar -->
    <CustomTabBar current="follow" />
  </view>
</template>

<script>
import shortlist from '@/components/vertical.vue'
import CustomTabBar from '@/components/CustomTabBar.vue'
import request from '@/common/request'
import { mapState } from 'vuex'

export default {
  name: 'follow',
  components: { 
    shortlist,
    CustomTabBar
  },
  data() {
    return {
      activeTab: 'favorite',
      last: [],
      favorite: []
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
        this.favorite = data.favorite || []
        this.last = data.last || []
      } catch (error) {
        console.error('获取数据失败:', error)
      }
    },
    switchTab(tab) {
      this.activeTab = tab
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
  padding: 32rpx 40rpx 24rpx;
  background: #050505;
}

.page-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  letter-spacing: 2rpx;
}

.tab-bar {
  display: flex;
  padding: 0 40rpx;
  background: #050505;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.05);
}

.tab-item {
  position: relative;
  padding: 24rpx 32rpx;
  margin-right: 32rpx;
}

.tab-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
  transition: all 0.3s ease;
}

.tab-active .tab-text {
  color: #E5B567;
  font-weight: 600;
}

.tab-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 32rpx;
  height: 6rpx;
  border-radius: 3rpx;
  background: #E5B567;
  box-shadow: 0 0 16rpx rgba(229, 181, 103, 0.5);
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

