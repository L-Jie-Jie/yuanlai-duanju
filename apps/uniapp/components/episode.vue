<template>
  <view class="m4e-popup-shell">
    <view class="m4e-popup-card">
      <view class="m4e-summary-block">
        <view class="m4e-summary-coverbox">
          <image class="m4e-summary-cover" :src="serialPoster" mode="aspectFill" />
        </view>
        <view class="m4e-summary-copybox">
          <text class="m4e-summary-title">{{ serialTitle }}</text>
          <text class="m4e-summary-meta">共 {{ totalEpisodeCount }} 集</text>
          <text class="m4e-summary-desc">{{ serialDescription }}</text>
        </view>
      </view>

      <view class="m4e-tab-strip" v-if="panelTabs.length > 1">
        <view
          class="m4e-tab-chip"
          :class="{ 'm4e-tab-chip--picked': tabIndex === chunkCursor }"
          v-for="(tab, tabIndex) in panelTabs"
          :key="tab.token"
          @click="chooseChunk(tabIndex)"
        >
          <text class="m4e-tab-text">{{ tab.token }}</text>
        </view>
      </view>

      <scroll-view class="m4e-grid-scroll" scroll-y enhanced :show-scrollbar="false">
        <view class="m4e-grid-frame" v-if="focusChunkEpisodes.length">
          <view
            class="m4e-grid-cell"
            v-for="unit in focusChunkEpisodes"
            :key="unit.serialNo"
            @click="jumpEpisode(unit.serialNo)"
          >
            <text
              class="m4e-grid-pill"
              :class="{ 'm4e-grid-pill--active': unit.serialNo === index + 1 }"
            >
              {{ labelEpisode(unit.clipNode, unit.serialNo) }}
            </text>
          </view>
        </view>
        <view class="m4e-empty-wrap" v-else>
          <text class="m4e-empty-text">暂无剧集数据</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'episode',
  props: {
    list: {
      type: Array,
      default: () => []
    },
    index: {
      type: Number,
      default: 0
    },
    info: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      chunkCursor: 0,
      chunkSize: 25
    }
  },
  computed: {
    totalEpisodeCount() {
      return Array.isArray(this.list) ? this.list.length : 0
    },
    panelTabs() {
      const tabs = []
      for (
        let startSlot = 0;
        startSlot < this.totalEpisodeCount;
        startSlot += this.chunkSize
      ) {
        const endSlot = Math.min(startSlot + this.chunkSize, this.totalEpisodeCount)
        tabs.push({
          token: `${startSlot + 1}-${endSlot}`,
          startSlot,
          endSlot
        })
      }
      return tabs
    },
    focusChunkEpisodes() {
      if (!this.panelTabs.length) {
        return []
      }
      const activeTab = this.panelTabs[this.chunkCursor] || this.panelTabs[0]
      const sourceQueue = Array.isArray(this.list) ? this.list : []
      return sourceQueue
        .slice(activeTab.startSlot, activeTab.endSlot)
        .map((clipNode, localIndex) => ({
          clipNode,
          serialNo: activeTab.startSlot + localIndex + 1
        }))
    },
    serialPoster() {
      if (this.info && Array.isArray(this.info.cover) && this.info.cover.length > 0) {
        return this.info.cover[0]
      }
      if (
        Array.isArray(this.list) &&
        this.list.length &&
        Array.isArray(this.list[0].cover) &&
        this.list[0].cover.length > 0
      ) {
        return this.list[0].cover[0]
      }
      return '/static/avatar.jpg'
    },
    serialTitle() {
      if (this.info && (this.info.name || this.info.title)) {
        return this.info.name || this.info.title
      }
      return '剧集列表'
    },
    serialDescription() {
      if (this.info && (this.info.description || this.info.msg)) {
        return this.info.description || this.info.msg
      }
      return '选择分集后将立即跳转播放。'
    }
  },
  watch: {
    index: {
      immediate: true,
      handler(nextIndex) {
        this.alignChunkByIndex(nextIndex)
      }
    },
    list() {
      this.alignChunkByIndex(this.index)
    }
  },
  methods: {
    alignChunkByIndex(rawIndex) {
      if (!this.totalEpisodeCount) {
        this.chunkCursor = 0
        return
      }
      const numericIndex = Number(rawIndex)
      const validIndex = Number.isFinite(numericIndex)
        ? Math.min(Math.max(numericIndex, 0), this.totalEpisodeCount - 1)
        : 0
      this.chunkCursor = Math.floor(validIndex / this.chunkSize)
    },
    chooseChunk(tabIndex) {
      this.chunkCursor = tabIndex
    },
    labelEpisode(clipNode, serialNo) {
      if (!clipNode) {
        return `EP ${serialNo}`
      }
      return clipNode.episode || clipNode.title || `EP ${serialNo}`
    },
    jumpEpisode(serialNo) {
      this.$emit('closeEpisode', serialNo - 1)
    }
  }
}
</script>

<style lang="scss" scoped>
.m4e-popup-shell {
  height: 760rpx;
  background: transparent;
}

.m4e-popup-card {
  height: 100%;
  background: #111a26;
  border-top-left-radius: 24rpx;
  border-top-right-radius: 24rpx;
  padding: 24rpx 24rpx 18rpx;
  box-sizing: border-box;
}

.m4e-summary-block {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  padding: 8rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.04);
}

.m4e-summary-coverbox {
  flex: 0 0 158rpx;
}

.m4e-summary-cover {
  width: 158rpx;
  height: 224rpx;
  border-radius: 12rpx;
}

.m4e-summary-copybox {
  flex: 1;
  padding-left: 14rpx;
  display: flex;
  flex-direction: column;
}

.m4e-summary-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #f2f5fa;
}

.m4e-summary-meta {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #98b8d9;
}

.m4e-summary-desc {
  display: -webkit-box;
  margin-top: 12rpx;
  color: #afc3da;
  font-size: 22rpx;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  overflow: hidden;
}

.m4e-tab-strip {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 16rpx;
}

.m4e-tab-chip {
  margin-right: 12rpx;
  margin-bottom: 10rpx;
  padding: 8rpx 14rpx;
  border-radius: 100rpx;
  background: rgba(255, 255, 255, 0.08);
}

.m4e-tab-chip--picked {
  background: rgba(73, 146, 204, 0.42);
}

.m4e-tab-text {
  color: #d8e5f4;
  font-size: 22rpx;
}

.m4e-grid-scroll {
  margin-top: 8rpx;
  height: 430rpx;
}

.m4e-grid-frame {
  display: flex;
  flex-wrap: wrap;
}

.m4e-grid-cell {
  width: 33.33%;
  padding: 6rpx;
  box-sizing: border-box;
}

.m4e-grid-pill {
  display: block;
  text-align: center;
  padding: 14rpx 0;
  border-radius: 10rpx;
  font-size: 22rpx;
  color: #d3deed;
  background: rgba(255, 255, 255, 0.07);
}

.m4e-grid-pill--active {
  color: #ffffff;
  font-weight: 700;
  background: #ef5f2c;
}

.m4e-empty-wrap {
  min-height: 220rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.m4e-empty-text {
  font-size: 24rpx;
  color: #8ea2bd;
}
</style>
