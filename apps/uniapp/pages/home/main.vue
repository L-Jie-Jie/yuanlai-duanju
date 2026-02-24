<template>
  <view class="m4h-stage-shell">
    <view class="m4h-safe-block"></view>

    <view class="m4h-feed-stack">
      <view class="m4h-card-shell m4h-card-shell--lead">
        <home-hero-banner
          :headline="$t('index1')"
          :reel-set="heroCluster"
          @open-series="openCollectionPage"
        />
      </view>

      <view class="m4h-card-shell">
        <home-rail-strip
          :section-title="$t('index5')"
          :drama-list="recentShelf"
          :max-count="12"
          @open-series="openCollectionPage"
        />
      </view>

      <view
        class="m4h-card-shell"
        v-for="column in genreColumns"
        :key="column._id || column.name"
      >
        <home-rail-strip
          :section-title="column.name"
          :drama-list="column.series || []"
          @open-series="openCollectionPage"
        />
      </view>
    </view>
  </view>
</template>

<script>
import homeHeroBanner from '@/components/home-hero-banner.vue'
import homeRailStrip from '@/components/home-rail-strip.vue'
import request from '@/common/request'

export default {
  name: 'discover',
  components: {
    homeHeroBanner,
    homeRailStrip
  },
  data() {
    return {
      heroCluster: [],
      genreColumns: [],
      recentShelf: []
    }
  },
  async onLoad() {
    await this.refreshLandingBlocks()
  },
  methods: {
    async refreshLandingBlocks() {
      try {
        const bundlePayload = await request.post('/public/home')
        this.heroCluster = Array.isArray(bundlePayload?.recommend)
          ? bundlePayload.recommend
          : []
        this.genreColumns = Array.isArray(bundlePayload?.categorys)
          ? bundlePayload.categorys
          : []
        this.recentShelf = Array.isArray(bundlePayload?.release)
          ? bundlePayload.release
          : []
      } catch (loadFault) {
        console.error('[home.main] load landing payload failed', loadFault)
        this.heroCluster = []
        this.genreColumns = []
        this.recentShelf = []
      }
    },
    openCollectionPage(dramaEntry) {
      if (!dramaEntry || !dramaEntry._id) {
        return
      }
      // #ifdef APP
      uni.navigateTo({
        url: `/pages/viewer/native/collection?id=${dramaEntry._id}`
      })
      // #endif
      // #ifndef APP
      uni.navigateTo({
        url: `/pages/viewer/web/collection?id=${dramaEntry._id}`
      })
      // #endif
    }
  }
}
</script>

<style lang="scss" scoped>
.m4h-stage-shell {
  min-height: 100vh;
  background: radial-gradient(
    circle at top right,
    #1b2738 0%,
    #0f151c 48%,
    #090f16 100%
  );
}

.m4h-safe-block {
  height: var(--status-bar-height);
}

.m4h-feed-stack {
  padding: 22rpx 20rpx 42rpx;
}

.m4h-card-shell {
  margin-bottom: 22rpx;
  padding: 18rpx;
  border-radius: 26rpx;
  background: rgba(13, 23, 34, 0.88);
  border: 1rpx solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 14rpx 34rpx rgba(0, 0, 0, 0.25);
}

.m4h-card-shell:last-child {
  margin-bottom: 0;
}

.m4h-card-shell--lead {
  padding: 20rpx;
}
</style>
