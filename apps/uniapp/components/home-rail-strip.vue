<template>
  <view class="m4r-shell">
    <view class="m4r-headline-row">
      <text class="m4r-headline">{{ sectionTitle }}</text>
      <text class="m4r-indicator" v-if="visibleQueue.length">
        {{ visibleQueue.length }}
      </text>
    </view>

    <scroll-view
      class="m4r-scroll-box"
      scroll-x
      enhanced
      :show-scrollbar="false"
    >
      <view class="m4r-card-row" v-if="visibleQueue.length">
        <view
          class="m4r-card-unit"
          v-for="(entry, slotIndex) in visibleQueue"
          :key="entry._id || entry.name || slotIndex"
          @click="tapSeries(entry)"
        >
          <view class="m4r-cover-wrap">
            <image
              class="m4r-cover"
              :src="resolveCover(entry)"
              mode="aspectFill"
              lazy-load
            ></image>
            <view class="m4r-badge">EP {{ resolveEpisodes(entry) }}</view>
          </view>
          <text class="m4r-title">{{ resolveTitle(entry) }}</text>
        </view>
      </view>

      <view class="m4r-empty-box" v-else>
        <text class="m4r-empty-text">{{ emptyText }}</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  name: 'homeRailStrip',
  props: {
    sectionTitle: {
      type: String,
      default: ''
    },
    dramaList: {
      type: Array,
      default: () => []
    },
    maxCount: {
      type: Number,
      default: 0
    },
    emptyText: {
      type: String,
      default: 'No data'
    }
  },
  computed: {
    visibleQueue() {
      const sourceQueue = Array.isArray(this.dramaList) ? this.dramaList : []
      if (this.maxCount > 0) {
        return sourceQueue.slice(0, this.maxCount)
      }
      return sourceQueue
    }
  },
  methods: {
    tapSeries(entry) {
      this.$emit('open-series', entry)
    },
    resolveCover(entry) {
      if (entry && Array.isArray(entry.cover) && entry.cover.length > 0) {
        return entry.cover[0]
      }
      if (entry && entry.href) {
        return entry.href
      }
      return '/static/avatar.jpg'
    },
    resolveTitle(entry) {
      if (!entry) {
        return 'Untitled'
      }
      return entry.name || entry.title || 'Untitled'
    },
    resolveEpisodes(entry) {
      if (!entry) {
        return 0
      }
      return entry.sms_n || entry.totalEpisode || entry.episodeCount || 0
    }
  }
}
</script>

<style lang="scss" scoped>
.m4r-headline-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.m4r-headline {
  font-size: 30rpx;
  color: #f2f5fa;
  font-weight: 700;
}

.m4r-indicator {
  font-size: 22rpx;
  color: #8ba3c2;
}

.m4r-scroll-box {
  width: 100%;
  margin-top: 12rpx;
  white-space: nowrap;
}

.m4r-card-row {
  display: flex;
  flex-direction: row;
}

.m4r-card-unit {
  width: 202rpx;
  margin-right: 16rpx;
}

.m4r-cover-wrap {
  position: relative;
  border-radius: 16rpx;
  overflow: hidden;
  background: #162132;
}

.m4r-cover {
  width: 202rpx;
  height: 270rpx;
}

.m4r-badge {
  position: absolute;
  right: 10rpx;
  bottom: 10rpx;
  padding: 4rpx 10rpx;
  border-radius: 100rpx;
  font-size: 20rpx;
  color: #f3f7ff;
  background: rgba(0, 0, 0, 0.46);
}

.m4r-title {
  display: block;
  margin-top: 10rpx;
  font-size: 23rpx;
  color: #cfdaeb;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.m4r-empty-box {
  min-height: 140rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
}

.m4r-empty-text {
  font-size: 24rpx;
  color: #8ea2bd;
}
</style>
