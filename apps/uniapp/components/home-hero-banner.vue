<template>
  <view class="m4b-shell">
    <view class="m4b-heading-row">
      <text class="m4b-heading">{{ headline }}</text>
      <text class="m4b-count" v-if="reelSet.length">{{ reelSet.length }}+</text>
    </view>

    <view class="m4b-focus-wrap" v-if="spotlightItem" @click="emitOpen(spotlightItem)">
      <view class="m4b-focus-inner">
        <image
          class="m4b-focus-cover"
          :src="pickCover(spotlightItem)"
          mode="aspectFill"
          lazy-load
        ></image>
        <view class="m4b-focus-shade"></view>
        <view class="m4b-focus-copy">
          <text class="m4b-focus-title">{{ pickTitle(spotlightItem) }}</text>
          <text class="m4b-focus-meta">EP {{ pickEpisodeTotal(spotlightItem) }}</text>
          <text class="m4b-focus-desc">{{ pickDescription(spotlightItem) }}</text>
        </view>
      </view>
    </view>

    <view class="m4b-empty-card" v-else>
      <text class="m4b-empty-text">{{ emptyHint }}</text>
    </view>

    <scroll-view
      class="m4b-strip-scroll"
      scroll-x
      enhanced
      :show-scrollbar="false"
    >
      <view class="m4b-strip-row">
        <view
          class="m4b-strip-cell"
          :class="{ 'm4b-strip-cell--active': spotlightCursor === slotIndex }"
          v-for="(node, slotIndex) in reelSet"
          :key="node._id || node.name || slotIndex"
          @click="setSpotlight(slotIndex)"
        >
          <image
            class="m4b-strip-cover"
            :src="pickCover(node)"
            mode="aspectFill"
            lazy-load
          ></image>
          <text class="m4b-strip-label">{{ pickTitle(node) }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  name: 'homeHeroBanner',
  props: {
    headline: {
      type: String,
      default: ''
    },
    reelSet: {
      type: Array,
      default: () => []
    },
    emptyHint: {
      type: String,
      default: 'No picks right now'
    }
  },
  data() {
    return {
      spotlightCursor: 0
    }
  },
  computed: {
    spotlightItem() {
      if (!Array.isArray(this.reelSet) || this.reelSet.length === 0) {
        return null
      }
      const safeCursor = Math.min(this.spotlightCursor, this.reelSet.length - 1)
      return this.reelSet[safeCursor] || null
    }
  },
  watch: {
    reelSet(nextList) {
      if (!Array.isArray(nextList) || nextList.length === 0) {
        this.spotlightCursor = 0
        return
      }
      if (this.spotlightCursor > nextList.length - 1) {
        this.spotlightCursor = 0
      }
    }
  },
  methods: {
    setSpotlight(slotIndex) {
      this.spotlightCursor = slotIndex
    },
    emitOpen(node) {
      this.$emit('open-series', node)
    },
    pickCover(node) {
      if (node && Array.isArray(node.cover) && node.cover.length > 0) {
        return node.cover[0]
      }
      if (node && node.href) {
        return node.href
      }
      return '/static/avatar.jpg'
    },
    pickTitle(node) {
      if (!node) {
        return 'Untitled'
      }
      return node.name || node.title || 'Untitled'
    },
    pickDescription(node) {
      if (!node) {
        return ''
      }
      return node.description || node.msg || '点击查看完整短剧'
    },
    pickEpisodeTotal(node) {
      if (!node) {
        return 0
      }
      return node.sms_n || node.totalEpisode || node.episodeCount || 0
    }
  }
}
</script>

<style lang="scss" scoped>
.m4b-heading-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.m4b-heading {
  font-size: 34rpx;
  font-weight: 700;
  color: #f2f5fa;
}

.m4b-count {
  font-size: 24rpx;
  color: #8ba3c2;
}

.m4b-focus-wrap {
  margin-top: 14rpx;
}

.m4b-focus-inner {
  position: relative;
  height: 520rpx;
  border-radius: 22rpx;
  overflow: hidden;
  background: #182535;
}

.m4b-focus-cover {
  width: 100%;
  height: 100%;
}

.m4b-focus-shade {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  background: linear-gradient(180deg, rgba(6, 10, 16, 0.1) 36%, #070b12 100%);
}

.m4b-focus-copy {
  position: absolute;
  left: 22rpx;
  right: 22rpx;
  bottom: 20rpx;
}

.m4b-focus-title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #ffffff;
}

.m4b-focus-meta {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #8fd4ff;
}

.m4b-focus-desc {
  display: -webkit-box;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #c3d2e3;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.m4b-empty-card {
  margin-top: 14rpx;
  height: 220rpx;
  border-radius: 20rpx;
  background: rgba(25, 34, 47, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.m4b-empty-text {
  color: #8ea2bd;
  font-size: 24rpx;
}

.m4b-strip-scroll {
  margin-top: 16rpx;
  width: 100%;
  white-space: nowrap;
}

.m4b-strip-row {
  display: flex;
  flex-direction: row;
  padding-bottom: 6rpx;
}

.m4b-strip-cell {
  width: 176rpx;
  margin-right: 16rpx;
  padding: 8rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.04);
  border: 1rpx solid transparent;
}

.m4b-strip-cell--active {
  border-color: rgba(111, 192, 255, 0.7);
  background: rgba(44, 82, 114, 0.42);
}

.m4b-strip-cover {
  width: 160rpx;
  height: 210rpx;
  border-radius: 12rpx;
}

.m4b-strip-label {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #d7e1ee;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
