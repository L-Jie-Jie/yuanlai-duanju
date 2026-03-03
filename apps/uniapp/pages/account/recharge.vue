<template>
  <view class="m5r-charge-shell">
    <pageBackbar title="Top Up"></pageBackbar>

    <view class="m5r-ledger-card">
      <view class="m5r-ledger-main">
        <text class="m5r-ledger-number">{{ balanceSnapshot.coins }}</text>
        <text class="m5r-ledger-unit">Coins</text>
      </view>
      <view class="m5r-ledger-sub">
        <uni-icons
          type="icon-lipin"
          custom-prefix="iconfont"
          color="#ffc77e"
          size="18"
        ></uni-icons>
        <text class="m5r-ledger-bonus">{{ balanceSnapshot.bonus }} Bonus</text>
      </view>
    </view>

    <view class="m5r-pack-grid">
      <view
        class="m5r-pack-card"
        :class="{ 'm5r-pack-card--active': deckIndex === focusPackKey }"
        v-for="(deckItem, deckIndex) in chargeDeck"
        :key="deckItem.deckCode"
        @click="pickChargeCard(deckIndex)"
      >
        <text class="m5r-pack-coins">{{ deckItem.coins }} Coins</text>
        <text class="m5r-pack-bonus">+{{ deckItem.bonus }} Bonus</text>
        <text class="m5r-pack-price">$ {{ deckItem.price }}</text>
      </view>
    </view>

    <view class="m5r-payline-card">
      <view class="m5r-payline-row">
        <text class="m5r-payline-label">Selected</text>
        <text class="m5r-payline-value">
          {{ activePackEntry.coins }} + {{ activePackEntry.bonus }}
        </text>
      </view>
      <view class="m5r-payline-row">
        <text class="m5r-payline-label">Pay</text>
        <text class="m5r-payline-value">$ {{ activePackEntry.price }}</text>
      </view>
      <view class="m5r-pay-btn" @click="submitChargeOrder">Continue</view>
    </view>

    <view class="m5r-terms-tip">Recharge means agree to the Recharge Agreement</view>
  </view>
</template>

<script>
import pageBackbar from '@/components/page-backbar.vue'

export default {
  name: 'chargeDesk',
  components: {
    pageBackbar
  },
  data() {
    return {
      focusPackKey: 0,
      balanceSnapshot: {
        coins: 100,
        bonus: 0
      },
      chargeDeck: [
        {
          deckCode: 'stk_100',
          coins: 100,
          bonus: 10,
          price: 0.99
        },
        {
          deckCode: 'stk_300',
          coins: 300,
          bonus: 40,
          price: 2.99
        },
        {
          deckCode: 'stk_500',
          coins: 500,
          bonus: 80,
          price: 4.99
        },
        {
          deckCode: 'stk_1000',
          coins: 1000,
          bonus: 180,
          price: 9.99
        }
      ]
    }
  },
  computed: {
    activePackEntry() {
      return this.chargeDeck[this.focusPackKey] || this.chargeDeck[0]
    }
  },
  methods: {
    pickChargeCard(deckIndex) {
      this.focusPackKey = deckIndex
    },
    submitChargeOrder() {
      uni.showToast({
        title: 'Payment channel is preparing',
        icon: 'none'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.m5r-charge-shell {
  min-height: 100vh;
  padding: 20rpx;
  box-sizing: border-box;
  background: linear-gradient(180deg, #131f2b 0%, #0a121a 100%);
}

.m5r-ledger-card {
  margin-top: 10rpx;
  border-radius: 24rpx;
  padding: 22rpx;
  background: linear-gradient(140deg, rgba(91, 140, 193, 0.42), rgba(18, 30, 44, 0.94));
  border: 1rpx solid rgba(255, 255, 255, 0.12);
}

.m5r-ledger-main {
  display: flex;
  align-items: baseline;
}

.m5r-ledger-number {
  font-size: 58rpx;
  color: #f5f8ff;
  font-weight: 700;
}

.m5r-ledger-unit {
  margin-left: 8rpx;
  color: #cfdcee;
  font-size: 24rpx;
}

.m5r-ledger-sub {
  margin-top: 12rpx;
  display: flex;
  align-items: center;
}

.m5r-ledger-bonus {
  margin-left: 8rpx;
  color: #ffd6a7;
  font-size: 24rpx;
}

.m5r-pack-grid {
  margin-top: 20rpx;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14rpx;
}

.m5r-pack-card {
  border-radius: 18rpx;
  padding: 16rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 1rpx solid rgba(255, 255, 255, 0.08);
}

.m5r-pack-card--active {
  border-color: rgba(240, 111, 59, 0.95);
  background: rgba(240, 111, 59, 0.16);
}

.m5r-pack-coins {
  display: block;
  color: #f2f7fe;
  font-size: 30rpx;
  font-weight: 700;
}

.m5r-pack-bonus {
  display: block;
  margin-top: 8rpx;
  color: #ffc185;
  font-size: 23rpx;
}

.m5r-pack-price {
  display: block;
  margin-top: 10rpx;
  color: #8fb5dc;
  font-size: 24rpx;
}

.m5r-payline-card {
  margin-top: 20rpx;
  border-radius: 18rpx;
  padding: 18rpx;
  background: rgba(255, 255, 255, 0.04);
}

.m5r-payline-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.m5r-payline-label {
  color: #9db2cb;
  font-size: 24rpx;
}

.m5r-payline-value {
  color: #f2f7ff;
  font-size: 24rpx;
  font-weight: 700;
}

.m5r-pay-btn {
  margin-top: 8rpx;
  text-align: center;
  padding: 16rpx 0;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #fff6ef;
  background: #ef6a39;
}

.m5r-terms-tip {
  margin-top: 26rpx;
  text-align: center;
  font-size: 20rpx;
  color: #8fa4bf;
}
</style>
