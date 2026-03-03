<template>
    <view class="custom-tab-bar">
      <view class="tab-content">
        <!-- 首页 -->
        <view 
          :class="['tab-item', { 'tab-active': currentPage === 'home' }]" 
          @click="switchTab('home')"
        >
          <view class="tab-icon-wrap">
            <uni-icons 
              type="home-filled" 
              size="24" 
              :color="currentPage === 'home' ? '#E5B567' : 'rgba(255,255,255,0.6)'"
            ></uni-icons>
            <view v-if="currentPage === 'home'" class="active-dot"></view>
          </view>
          <text :class="['tab-text', { 'active-text': currentPage === 'home' }]">首页</text>
        </view>
  
        <!-- 追剧 -->
        <view 
          :class="['tab-item', { 'tab-active': currentPage === 'follow' }]" 
          @click="switchTab('follow')"
        >
          <view class="tab-icon-wrap">
            <uni-icons 
              type="star-filled" 
              size="24" 
              :color="currentPage === 'follow' ? '#E5B567' : 'rgba(255,255,255,0.6)'"
            ></uni-icons>
            <view v-if="currentPage === 'follow'" class="active-dot"></view>
          </view>
          <text :class="['tab-text', { 'active-text': currentPage === 'follow' }]">追剧</text>
        </view>
  
        <!-- 剧场 (主突出大按钮) -->
        <view class="tab-item-main" @click="switchTab('theater')">
          <view class="main-btn-halo">
            <view class="main-btn-core">
              <uni-icons type="videocam-filled" size="28" color="#E5B567"></uni-icons>
            </view>
          </view>
          <text class="tab-text main-text">剧场</text>
        </view>
  
        <!-- 历史 -->
        <view 
          :class="['tab-item', { 'tab-active': currentPage === 'history' }]" 
          @click="switchTab('history')"
        >
          <view class="tab-icon-wrap">
            <uni-icons 
              type="calendar-filled" 
              size="24" 
              :color="currentPage === 'history' ? '#E5B567' : 'rgba(255,255,255,0.6)'"
            ></uni-icons>
            <view v-if="currentPage === 'history'" class="active-dot"></view>
          </view>
          <text :class="['tab-text', { 'active-text': currentPage === 'history' }]">历史</text>
        </view>
  
        <!-- 我的 -->
        <view 
          :class="['tab-item', { 'tab-active': currentPage === 'profile' }]" 
          @click="switchTab('profile')"
        >
          <view class="tab-icon-wrap">
            <uni-icons 
              type="person-filled" 
              size="24" 
              :color="currentPage === 'profile' ? '#E5B567' : 'rgba(255,255,255,0.6)'"
            ></uni-icons>
            <view v-if="currentPage === 'profile'" class="active-dot"></view>
          </view>
          <text :class="['tab-text', { 'active-text': currentPage === 'profile' }]">我的</text>
        </view>
      </view>
    </view>
  </template>
  
  <script>
  export default {
    name: 'CustomTabBar',
    props: {
      current: {
        type: String,
        default: 'home'
      }
    },
    data() {
      return {
        currentPage: this.current
      }
    },
    watch: {
      current(newVal) {
        this.currentPage = newVal
      }
    },
    methods: {
      switchTab(tab) {
        // 如果点击的是当前页面，阻止重复跳转
        if (tab === this.currentPage) {
          return
        }
        
        let targetUrl = '';
        
        switch (tab) {
          case 'home':
            targetUrl = '/pages/home/main';
            break;
          case 'follow':
            targetUrl = '/pages/follow/index';
            break;
          case 'theater':
            // 针对剧场页面进行条件编译区分端
            // #ifdef APP
            targetUrl = '/pages/viewer/native/clips';
            // #endif
            // #ifndef APP
            targetUrl = '/pages/viewer/web/clips';
            // #endif
            break;
          case 'history':
            targetUrl = '/pages/history/index';
            break;
          case 'profile':
            targetUrl = '/pages/account/center';
            break;
        }
        
        // 使用 reLaunch 彻底清空并重建页面栈，模拟真正的 Tab 切换体验
        if (targetUrl) {
          uni.reLaunch({
            url: targetUrl
          });
        }
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .custom-tab-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100vw;
    background: rgba(18, 18, 20, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-top: 1rpx solid rgba(255, 255, 255, 0.05);
    z-index: 999;
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  .tab-content {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    height: 110rpx;
    padding: 0 20rpx;
  }
  
  .tab-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100rpx;
    opacity: 0.8;
    transition: all 0.3s ease;
    &:active {
      opacity: 1;
      transform: scale(0.95);
    }
  }
  
  .tab-active {
    opacity: 1;
  }
  
  .tab-icon-wrap {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .active-dot {
    position: absolute;
    bottom: -10rpx;
    width: 8rpx;
    height: 8rpx;
    background-color: #E5B567;
    border-radius: 50%;
    box-shadow: 0 0 8rpx #E5B567;
  }
  
  .tab-text {
    font-size: 20rpx;
    margin-top: 8rpx;
    color: rgba(255, 255, 255, 0.6);
  }
  
  .active-text {
    color: #E5B567;
    font-weight: 600;
  }
  
  .tab-item-main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    margin-top: -50rpx;
    z-index: 1001;
  }
  
  .main-btn-halo {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #E5B567 0%, #c2964d 100%);
    padding: 6rpx;
    box-shadow: 0 8rpx 24rpx rgba(229, 181, 103, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s ease;
    &:active {
      transform: scale(0.95);
    }
  }
  
  .main-btn-core {
    width: 100%;
    height: 100%;
    background-color: #050505;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .main-text {
    color: rgba(255, 255, 255, 0.8);
    margin-top: 10rpx;
    font-weight: 500;
  }
  </style>