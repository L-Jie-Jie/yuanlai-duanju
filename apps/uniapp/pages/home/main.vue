<template>
  <view class="hp-shell">
    <!-- ================= 顶部导航 (固定) ================= -->
    <view class="hp-header">
      <view class="hp-brand">
        <view class="brand-logo-wrap">
          <image class="brand-logo" src="/static/login/platform-logo.png" mode="aspectFit"></image>
        </view>
        <text class="hp-brand-name">元来短剧</text>
      </view>
      <view class="hp-head-actions">
        <!-- 搜索按钮和搜索框 -->
        <view class="search-container" :class="{ 'search-expanded': searchExpanded }">
          <button class="circle-btn search-btn" @click="toggleSearch">
            <uni-icons :type="searchExpanded ? 'close' : 'search'" size="20" color="#ffffff"></uni-icons>
          </button>
          <input 
            v-if="searchExpanded"
            class="search-input"
            v-model="searchKeyword"
            placeholder="搜索短剧..."
            :focus="searchExpanded"
            @input="onSearchInput"
            @blur="onSearchBlur"
          />
        </view>
      </view>
    </view>
    
    <!-- 搜索结果下拉列表 -->
    <view v-if="searchExpanded && searchResults.length > 0" class="search-results">
      <scroll-view class="search-results-scroll" scroll-y :show-scrollbar="false">
        <view
          class="search-result-item"
          v-for="item in searchResults"
          :key="item._id"
          @click="openCollectionPage(item)"
        >
          <image class="result-cover" :src="resolveCover(item)" mode="aspectFill"></image>
          <view class="result-info">
            <text class="result-title line-clamp-1">{{ resolveTitle(item) }}</text>
            <text class="result-desc line-clamp-1">{{ resolveDesc(item) }}</text>
          </view>
          <view class="result-meta">
            <text class="result-episodes">{{ resolveEpisodes(item) }}集</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- ================= 主滚动区 ================= -->
    <scroll-view class="hp-main" scroll-y enhanced :show-scrollbar="false">
      
      <!-- 首屏大作推荐 (仅轮播图片和文字信息) -->
      <view class="hp-hero">
        <swiper 
          class="hp-hero-swiper" 
          circular 
          autoplay 
          :interval="5000" 
          :duration="600"
          @change="onSwiperChange"
        >
          <swiper-item 
            v-for="(item, index) in swiperList" 
            :key="item._id || index"
            @click="openCollectionPage(item)"
          >
            <view class="hp-hero-item">
              <image class="hp-hero-cover" :src="resolveCover(item)" mode="aspectFill"></image>
              <view class="hp-hero-mask"></view>
              <view class="hp-hero-copy">
                <view class="hp-hero-meta">
                  <text class="hp-badge">全网独播</text>
                  <text class="hp-episode">更新至{{ resolveEpisodes(item) }}集</text>
                </view>
                <text class="hp-hero-title">{{ resolveTitle(item) }}</text>
                <text class="hp-hero-desc line-clamp-2">{{ resolveDesc(item) }}</text>
              </view>
            </view>
          </swiper-item>
        </swiper>

        <!-- 固定的播放按钮 (不随轮播滑动) -->
        <view class="hp-hero-actions-fixed">
          <button class="hp-play-btn" @click="playCurrentHero">
            <uni-icons type="right" size="22" color="#000000"></uni-icons>
            <text class="play-text">立即播放</text>
          </button>
        </view>
      </view>

      <!-- 横向热播榜单 -->
      <view class="hp-section">
        <view class="hp-section-head">
          <text class="hp-section-title">🔥 正在热播</text>
          <view class="hp-section-more" @click="noop">
            <text>全部</text>
            <uni-icons type="right" size="14" color="rgba(255,255,255,0.5)"></uni-icons>
          </view>
        </view>
        
        <scroll-view class="hp-hot-scroll" scroll-x enhanced :show-scrollbar="false">
          <view class="hp-hot-row">
            <view
              class="hp-hot-card"
              v-for="(item, index) in hotList"
              :key="item._id || index"
              @click="openCollectionPage(item)"
            >
              <view class="hp-hot-cover-wrap">
                <image class="hp-hot-cover" :src="resolveCover(item)" mode="aspectFill"></image>
                <!-- 排名徽章 -->
                <view class="hp-hot-rank" :class="'rank-' + (index + 1)">TOP {{ index + 1 }}</view>
                <!-- 底部渐变遮罩 -->
                <view class="hp-gradient-bottom"></view>
                <text class="hp-hot-state">{{ resolveEpisodes(item) }}集</text>
              </view>
              <text class="hp-hot-title line-clamp-1">{{ resolveTitle(item) }}</text>
              <text class="hp-hot-sub">{{ resolveViews(item) }} 在看</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 分类Tab + 内容网格 (融合猜你喜欢) -->
      <view class="hp-section hp-category-section">
        <!-- 分类Tab标签页 -->
        <view class="hp-category-header">
          <scroll-view class="hp-category-tabs-scroll" scroll-x enhanced :show-scrollbar="false">
            <view class="hp-category-tabs-row">
              <view
                class="hp-category-tab-item"
                :class="{ 'hp-category-tab-active': activeTab === tab._id }"
                v-for="(tab, index) in tabs"
                :key="tab._id || index"
                @click="activeTab = tab._id"
              >
                <text class="hp-category-tab-text">{{ tab.name }}</text>
              </view>
            </view>
          </scroll-view>
        </view>
        
        <!-- 分类内容网格 -->
        <view class="hp-grid">
          <view
            class="hp-grid-item"
            v-for="(item, index) in currentTabContent"
            :key="item._id || `cat-${index}`"
            @click="openCollectionPage(item)"
          >
            <view class="hp-grid-cover-wrap">
              <image class="hp-grid-cover" :src="resolveCover(item)" mode="aspectFill"></image>
              <view class="hp-gradient-bottom"></view>
              <view class="hp-grid-views">
                <uni-icons type="videocam" size="14" color="#E5B567"></uni-icons>
                <text class="views-text">{{ resolveViews(item) }}播放</text>
              </view>
            </view>
            <text class="hp-grid-title line-clamp-2">{{ resolveTitle(item) }}</text>
          </view>
        </view>
      </view>

      <!-- 底部留白 -->
      <view class="safe-bottom"></view>
    </scroll-view>
    
    <!-- 自定义TabBar -->
    <CustomTabBar current="home" />
  </view>
</template>

<script>
import request from '@/common/request'
import CustomTabBar from '@/components/CustomTabBar.vue'

export default {
  name: 'discover',
  components: {
    CustomTabBar
  },
  data() {
    return {
      heroCluster: [],
      genreColumns: [],
      recentShelf: [],
      activeTab: 'recommend', // 当前激活的Tab ID
      tabs: [], // 动态加载的分类Tab列表
      currentSwiperIndex: 0, // 记录当前轮播的索引
      searchExpanded: false, // 搜索框是否展开
      searchKeyword: '', // 搜索关键词
      searchResults: [], // 搜索结果
      searchTimer: null // 搜索防抖定时器
    }
  },
  computed: {
    swiperList() {
      // 提取前5个推荐短剧用于轮播
      const list = this.heroCluster.length ? this.heroCluster : this.recentShelf
      return list.length ? list.slice(0, 5) : [{}]
    },
    hotList() {
      const base = this.recentShelf.length
        ? this.recentShelf
        : this.heroCluster.length
          ? this.heroCluster
          : []
      return base.slice(0, 10)
    },
    guessList() {
      const merged = []
      this.genreColumns.forEach((group) => {
        const rows = this.pickListValue(group, ['series', 'list', 'items', 'data'])
        if (rows.length) {
          merged.push(...rows)
        }
      })
      if (merged.length === 0 && this.recentShelf.length > 0) {
        merged.push(...this.recentShelf)
      }
      if (merged.length === 0 && this.heroCluster.length > 0) {
        merged.push(...this.heroCluster)
      }
      return merged.slice(0, 8)
    },
    // 当前Tab的标题
    currentTabTitle() {
      if (this.activeTab === 'recommend') {
        return '🔥 正在热播'
      }
      const currentTab = this.tabs.find(tab => tab._id === this.activeTab)
      return currentTab ? currentTab.name : '推荐'
    },
    // 当前Tab的内容
    currentTabContent() {
      if (this.activeTab === 'recommend') {
        // 推荐Tab显示猜你喜欢的内容
        return this.guessList
      }
      const currentCategory = this.genreColumns.find(cat => cat._id === this.activeTab)
      if (currentCategory) {
        const items = this.pickListValue(currentCategory, ['series', 'list', 'items', 'data'])
        return items.slice(0, 20) // 显示更多内容
      }
      return []
    }
  },
  async onLoad() {
    await this.refreshLandingBlocks()
  },
  methods: {
    noop() {
      // 占位防穿透
    },
    toggleSearch() {
      this.searchExpanded = !this.searchExpanded
      if (!this.searchExpanded) {
        // 关闭搜索时清空数据
        this.searchKeyword = ''
        this.searchResults = []
      }
    },
    onSearchInput(e) {
      const keyword = e.detail.value
      // 防抖搜索
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }
      this.searchTimer = setTimeout(() => {
        this.performSearch(keyword)
      }, 300)
    },
    onSearchBlur() {
      // 延迟关闭，确保点击结果项能够触发
      setTimeout(() => {
        if (this.searchKeyword === '') {
          this.searchExpanded = false
          this.searchResults = []
        }
      }, 200)
    },
    async performSearch(keyword) {
      if (!keyword || keyword.trim() === '') {
        this.searchResults = []
        return
      }
      
      try {
        const response = await request.post('/public/search', { keyword })
        console.log('搜索响应:', response)
        // request.post 已经通过拦截器返回了 packet.data，所以 response 直接就是数组
        this.searchResults = Array.isArray(response) ? response : []
        console.log('搜索结果数量:', this.searchResults.length)
      } catch (error) {
        console.error('搜索失败:', error)
        this.searchResults = []
        uni.showToast({
          title: '搜索失败，请重试',
          icon: 'none'
        })
      }
    },
    onSwiperChange(e) {
      // 轮播切换时更新当前索引
      this.currentSwiperIndex = e.detail.current
    },
    playCurrentHero() {
      // 获取当前轮播选中的短剧并播放
      const currentItem = this.swiperList[this.currentSwiperIndex]
      this.openCollectionPage(currentItem)
    },
    async refreshLandingBlocks() {
      try {
        const bundlePayload = await request.post('/public/home')
        const root =
          (bundlePayload && (bundlePayload.data || bundlePayload.result || bundlePayload)) ||
          {}

        // 优先使用banner字段作为轮播图数据
        const bannerData = this.pickListValue(root, ['banner'])
        this.heroCluster = bannerData.length > 0 
          ? this.normalizeDramaList(bannerData)
          : this.normalizeDramaList(
              this.pickListValue(root, ['recommend', 'hero', 'top', 'featured'])
            )

        this.genreColumns = this.normalizeCategoryList(
          this.pickListValue(root, ['categorys', 'categories', 'category', 'genres', 'blocks'])
        )

        this.recentShelf = this.normalizeDramaList(
          this.pickListValue(root, ['release', 'hot', 'latest', 'trending', 'list'])
        )

        // 如果 release 为空，从分类池里补齐热播区
        if (this.recentShelf.length === 0) {
          const categoryPool = []
          this.genreColumns.forEach((group) => {
            const rows = this.pickListValue(group, ['series', 'list', 'items', 'data'])
            if (rows.length) {
              categoryPool.push(...rows)
            }
          })
          this.recentShelf = this.normalizeDramaList(categoryPool)
        }

        // 构建Tab列表：推荐 + 后台分类
        this.tabs = [
          { _id: 'recommend', name: '推荐' },
          ...this.genreColumns.map(cat => ({
            _id: cat._id,
            name: cat.name
          }))
        ]

        // 默认选中第一个Tab
        if (this.tabs.length > 0) {
          this.activeTab = this.tabs[0]._id
        }
      } catch (error) {
        console.error('首页数据加载失败:', error)
        this.heroCluster = []
        this.genreColumns = []
        this.recentShelf = []
        this.tabs = [{ _id: 'recommend', name: '推荐' }]
        uni.showToast({
          title: '数据加载失败，请稍后重试',
          icon: 'none'
        })
      }
    },
    pickListValue(source, keyQueue) {
      if (Array.isArray(source)) {
        return source
      }
      if (!source || typeof source !== 'object') {
        return []
      }
      for (let i = 0; i < keyQueue.length; i += 1) {
        const val = source[keyQueue[i]]
        if (Array.isArray(val)) {
          return val
        }
      }
      return []
    },
    normalizeDramaList(rawList) {
      const base = Array.isArray(rawList) ? rawList : []
      return base
        .filter((item) => item && typeof item === 'object')
        .map((item) => {
          if (item._id) {
            return item
          }
          return {
            ...item,
            _id: item.id || item.seriesId || item.videoId || ''
          }
        })
    },
    normalizeCategoryList(rawList) {
      const base = Array.isArray(rawList) ? rawList : []
      return base
        .filter((item) => item && typeof item === 'object')
        .map((item) => {
          const rows = this.pickListValue(item, ['series', 'list', 'items', 'data'])
          // 确保每个分类都有_id字段
          const categoryId = item._id || item.id || item.categoryId || item.name
          return {
            ...item,
            _id: categoryId,
            series: this.normalizeDramaList(rows)
          }
        })
    },
    resolveCover(item) {
      if (item && Array.isArray(item.cover) && item.cover.length > 0) {
        return item.cover[0]
      }
      if (item && item.href) {
        return item.href
      }
      return '/static/default.jpg'
    },
    resolveTitle(item) {
      if (!item || (!item.name && !item.title)) return '精选短剧'
      return item.name || item.title
    },
    resolveDesc(item) {
      if (!item || (!item.description && !item.msg)) return '热门短剧，精彩不容错过！'
      return item.description || item.msg
    },
    resolveEpisodes(item) {
      if (!item) return 0
      // 优先使用后端返回的episodeCount
      const count = item.episodeCount || item.sms_n || item.totalEpisode || 0
      // 如果是完结状态，返回特殊格式
      if (item.isCompleted) {
        return `已完结 共${count}`
      }
      return count > 0 ? `更新至${count}` : count
    },
    resolveViews(item) {
      const raw = Number(item && (item.views || item.play || item.watch || item.like || 0))
      if (!Number.isFinite(raw) || raw <= 0) {
        return '10w+'
      }
      if (raw >= 10000) {
        return `${(raw / 10000).toFixed(1)}w`
      }
      return `${raw}`
    },
    openCollectionPage(dramaEntry) {
      if (!dramaEntry) {
        return
      }
      const seriesId =
        dramaEntry._id || dramaEntry.id || dramaEntry.seriesId || dramaEntry.videoId || ''
      if (!seriesId) {
        return
      }
      // #ifdef APP
      uni.navigateTo({
        url: `/pages/viewer/native/collection?id=${seriesId}&seriesId=${seriesId}`
      })
      // #endif
      // #ifndef APP
      uni.navigateTo({
        url: `/pages/viewer/web/collection?id=${seriesId}&seriesId=${seriesId}`
      })
      // #endif
    }
  }
}
</script>

<style lang="scss" scoped>
/* ================= 通用与布局约束 ================= */
.hp-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  /* #ifdef H5 */
  height: calc(100vh - var(--window-top) - var(--window-bottom));
  /* #endif */
  background: #050505;
  color: #ffffff;
  overflow: hidden; /* 防止最外层出现原生滚动，依赖 scroll-view */
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', 'STHeiti', 'Microsoft Yahei', 'Tahoma', 'Simsun', sans-serif;
}

/* ================= 固定的顶部区域 ================= */
.hp-header {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 100;
  /* 动态计算高度保障兼容性 */
  height: calc(var(--status-bar-height, 0px) + 96rpx); 
  padding: calc(var(--status-bar-height, 0px) + 16rpx) 32rpx 16rpx;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(180deg, rgba(5, 5, 5, 0.9) 0%, rgba(5, 5, 5, 0.4) 60%, rgba(5, 5, 5, 0) 100%);
  pointer-events: none; /* 让事件穿透到下层图片 */
}

.hp-brand, .hp-head-actions {
  pointer-events: auto; /* 恢复子元素的点击 */
  display: flex;
  flex-direction: row;
  align-items: center;
}

/* 搜索容器 */
.search-container {
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-btn {
  position: relative;
  z-index: 2;
}

.search-input {
  position: absolute;
  right: 0;
  width: 0;
  height: 64rpx;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  color: #ffffff;
  font-size: 28rpx;
  padding: 0;
  padding-right: 80rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.1);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-expanded .search-input {
  width: 420rpx;
  padding-left: 32rpx;
  padding-right: 80rpx;
  opacity: 1;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

/* 搜索结果列表 */
.search-results {
  position: fixed;
  top: calc(var(--status-bar-height, 0px) + 96rpx);
  left: 0;
  right: 0;
  max-height: 600rpx;
  background: rgba(18, 18, 20, 0.98);
  backdrop-filter: blur(20px);
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
  z-index: 99;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-results-scroll {
  max-height: 600rpx;
}

.search-result-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.05);
  transition: background 0.2s ease;
}

.search-result-item:active {
  background: rgba(255, 255, 255, 0.05);
}

.result-cover {
  width: 96rpx;
  height: 128rpx;
  border-radius: 12rpx;
  background: #121214;
  flex-shrink: 0;
}

.result-info {
  flex: 1;
  margin-left: 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.result-title {
  font-size: 30rpx;
  color: #ffffff;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.result-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
}

.result-meta {
  flex-shrink: 0;
  margin-left: 16rpx;
}

.result-episodes {
  font-size: 24rpx;
  color: #E5B567;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  background: rgba(229, 181, 103, 0.15);
}

.brand-logo-wrap {
  width: 56rpx;
  height: 56rpx;
  border-radius: 12rpx;
  background: linear-gradient(135deg, #E5B567 0%, #a6792b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 16rpx rgba(229, 181, 103, 0.3);
  overflow: hidden;
}

.brand-logo {
  width: 100%;
  height: 100%;
}

.hp-brand-name {
  margin-left: 16rpx;
  font-size: 36rpx;
  font-weight: bold;
  letter-spacing: 2rpx;
  text-shadow: 0 2rpx 8rpx rgba(0,0,0,0.8);
}

.circle-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  border: none;
  &::after { display: none; }
  &:active { background: rgba(255, 255, 255, 0.2); }
}

/* ================= 主滚动区 ================= */
.hp-main {
  flex: 1;
  height: 0; /* 激活内部滚动 */
  width: 100%;
}

/* 首屏大作推荐 */
.hp-hero {
  position: relative;
  width: 100vw;
  height: 850rpx;
}

.hp-hero-swiper {
  width: 100%;
  height: 100%;
}

.hp-hero-item {
  width: 100%;
  height: 100%;
  position: relative;
}

.hp-hero-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hp-hero-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(5, 5, 5, 0) 0%, rgba(5, 5, 5, 0.3) 50%, #050505 100%);
  pointer-events: none;
}

/* 文本向上提为按钮留空间 */
.hp-hero-copy {
  position: absolute;
  left: 40rpx;
  right: 40rpx;
  bottom: 160rpx; 
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.hp-hero-meta {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 16rpx;
}

.hp-badge {
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  border: 1rpx solid rgba(229, 181, 103, 0.3);
  background: rgba(229, 181, 103, 0.15);
  color: #E5B567;
  font-size: 20rpx;
  font-weight: 500;
}

.hp-episode {
  margin-left: 16rpx;
  color: rgba(255, 255, 255, 0.7);
  font-size: 24rpx;
}

.hp-hero-title {
  font-size: 60rpx;
  font-weight: bold;
  letter-spacing: -1rpx;
  margin-bottom: 12rpx;
  color: #ffffff; 
  text-shadow: 0 4rpx 12rpx rgba(0,0,0,0.5);
}

.hp-hero-desc {
  color: rgba(255, 255, 255, 0.6);
  font-size: 26rpx;
  line-height: 1.5;
  max-width: 560rpx;
}

/* 固定的播放按钮 */
.hp-hero-actions-fixed {
  position: absolute;
  bottom: 30rpx;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 80rpx);
  max-width: 480rpx;
  z-index: 10;
}

.hp-play-btn {
  width: 100%;
  height: 96rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #E5B567 0%, #c2964d 100%); 
  box-shadow: 0 8rpx 30rpx rgba(229, 181, 103, 0.25);
  color: #050505;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  border: none;
  &::after { display: none; }
  &:active { transform: scale(0.97); }
  transition: transform 0.2s ease;
}

.play-text {
  color: #050505;
  font-size: 32rpx;
  font-weight: 700;
  margin-left: 6rpx;
}

/* ================= 分类Tab区域 ================= */
.hp-category-section {
  padding: 0 40rpx;
  padding-bottom: 48rpx;
  margin-top: 48rpx;
}

.hp-category-header {
  margin-bottom: 32rpx;
}

.hp-category-tabs-scroll {
  width: 100%;
  margin-left: -40rpx;
  margin-right: -40rpx;
  padding-left: 40rpx;
  padding-right: 40rpx;
}

.hp-category-tabs-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16rpx;
  white-space: nowrap;
}

.hp-category-tab-item {
  display: inline-block;
  padding: 12rpx 32rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.hp-category-tab-item:active {
  transform: scale(0.95);
}

.hp-category-tab-text {
  font-size: 28rpx;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  transition: color 0.3s ease;
}

.hp-category-tab-active {
  background: linear-gradient(135deg, #E5B567 0%, #c2964d 100%);
}

.hp-category-tab-active .hp-category-tab-text {
  color: #050505;
  font-weight: 600;
}

/* ================= 模块通用 ================= */
.hp-section {
  margin-top: 48rpx;
  padding: 0 0 0 40rpx; 
}

.hp-section-head {
  padding-right: 40rpx;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.hp-section-title {
  font-size: 36rpx;
  font-weight: bold;
  letter-spacing: 1rpx;
}

.hp-section-more {
  display: flex;
  flex-direction: row;
  align-items: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 24rpx;
}

/* ================= 热播榜横滑 ================= */
.hp-hot-scroll {
  width: 100%;
}

.hp-hot-row {
  display: flex;
  flex-direction: row;
  gap: 24rpx;
  padding-right: 40rpx;
  padding-bottom: 8rpx;
}

.hp-hot-card {
  display: inline-block;
  width: 240rpx;
  flex-shrink: 0;
}

.hp-hot-cover-wrap {
  width: 240rpx;
  height: 320rpx;
  border-radius: 24rpx;
  overflow: hidden;
  position: relative;
  background-color: #121214;
  margin-bottom: 16rpx;
  transition: all 0.3s ease;
}

.hp-hot-card:active .hp-hot-cover-wrap {
  transform: scale(0.95);
}

.hp-hot-cover {
  width: 100%;
  height: 100%;
  transition: all 0.5s ease;
}

.hp-hot-card:active .hp-hot-cover {
  transform: scale(1.05);
}

.hp-hot-rank {
  position: absolute;
  top: 12rpx;
  left: 12rpx;
  font-size: 18rpx;
  font-weight: bold;
  color: #fff;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  backdrop-filter: blur(4px);
}
.rank-1 { background: rgba(239, 68, 68, 0.9); }
.rank-2 { background: rgba(249, 115, 22, 0.9); }
.rank-3 { background: rgba(234, 179, 8, 0.9); }
.rank-4, .rank-5, .rank-6, .rank-7, .rank-8, .rank-9, .rank-10 { background: rgba(255, 255, 255, 0.2); }

.hp-hot-state {
  position: absolute;
  right: 12rpx;
  bottom: 12rpx;
  color: #FFFFFF;
  font-size: 20rpx;
  font-weight: 500;
}

.hp-hot-title {
  margin-top: 16rpx;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.hp-hot-sub {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.4);
}

/* ================= 猜你喜欢 网格 ================= */
.hp-guess {
  padding-right: 40rpx;
  padding-bottom: 48rpx;
  margin-top: 48rpx;
}

.circle-btn-small {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #121214;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  border: none;
  &::after { display: none; }
  &:active { background: #18181B; }
}

.hp-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 24rpx;
}

.hp-grid-item {
  width: calc(50% - 12rpx);
}

.hp-grid-cover-wrap {
  width: 100%;
  aspect-ratio: 3/4;
  border-radius: 32rpx;
  overflow: hidden;
  position: relative;
  background: #121214;
  margin-bottom: 16rpx;
  transition: all 0.3s ease;
}

.hp-grid-item:active .hp-grid-cover-wrap {
  transform: scale(0.95);
}

.hp-grid-cover {
  width: 100%;
  height: 100%;
  transition: all 0.5s ease;
}

.hp-grid-item:active .hp-grid-cover {
  transform: scale(1.05);
}

.hp-grid-grad {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 50%;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.9) 100%);
}

.hp-grid-views {
  position: absolute;
  bottom: 16rpx;
  left: 16rpx;
  color: #E5B567;
  font-size: 22rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.hp-grid-title {
  margin-top: 16rpx;
  color: rgba(255, 255, 255, 0.9);
  font-size: 28rpx;
  line-height: 1.4;
}

/* 文本截断类补齐 */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
.hp-gradient-bottom {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 50%;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.85) 100%);
  pointer-events: none;
}

/* 底部防遮挡 */
.safe-bottom {
  height: 160rpx;
}
</style>