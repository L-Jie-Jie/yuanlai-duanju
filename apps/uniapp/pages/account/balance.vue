<template>
  <view class="m5w-wallet-shell">
    <pageBackbar title="My Wallet"></pageBackbar>

    <view class="m5w-balance-strip">
      <view class="m5w-balance-cell">
        <text class="m5w-balance-key">Coins</text>
        <text class="m5w-balance-val">{{ treasurySnapshot.coins }}</text>
      </view>
      <view class="m5w-balance-cell">
        <text class="m5w-balance-key">Bonus</text>
        <text class="m5w-balance-val">{{ treasurySnapshot.bonus }}</text>
      </view>
      <view class="m5w-balance-cell">
        <text class="m5w-balance-key">Discount</text>
        <text class="m5w-balance-val">{{ treasurySnapshot.discount }}%</text>
      </view>
    </view>

    <view class="m5w-segment-grid">
      <view
        class="m5w-segment-pill"
        :class="{ 'm5w-segment-pill--active': ledgerTabCursor === tabEntry.code }"
        v-for="tabEntry in ledgerTabs"
        :key="tabEntry.code"
        @click="switchLedgerPane(tabEntry.code)"
      >
        {{ tabEntry.label }}
      </view>
    </view>

    <view class="m5w-ledger-card">
      <view class="m5w-ledger-row" v-for="rowItem in activeLedgerRows" :key="rowItem.stub">
        <view class="m5w-ledger-main">
          <text class="m5w-ledger-title">{{ rowItem.title }}</text>
          <text class="m5w-ledger-time">{{ rowItem.at }}</text>
        </view>
        <text class="m5w-ledger-amount" :class="{ 'm5w-ledger-amount--plus': rowItem.delta > 0 }">
          {{ rowItem.delta > 0 ? '+' : '' }}{{ rowItem.delta }}
        </text>
      </view>
      <view class="m5w-ledger-empty" v-if="activeLedgerRows.length === 0">No Record</view>
    </view>

    <view class="m5w-terms-tip">Recharge means agree to the Recharge Agreement</view>
  </view>
</template>

<script>
import pageBackbar from '@/components/page-backbar.vue'

export default {
  name: 'walletDesk',
  components: {
    pageBackbar
  },
  data() {
    return {
      ledgerTabCursor: 'discount',
      treasurySnapshot: {
        coins: 100,
        bonus: 0,
        discount: 0
      },
      ledgerTabs: [
        {
          code: 'discount',
          label: 'Discount'
        },
        {
          code: 'coin_log',
          label: 'Coin Record'
        },
        {
          code: 'bonus_log',
          label: 'Bonus Record'
        }
      ],
      ledgerStore: {
        discount: [
          {
            stub: 'disc_1',
            title: 'No discount available',
            at: 'just now',
            delta: 0
          }
        ],
        coin_log: [
          {
            stub: 'coin_1',
            title: 'Top up package',
            at: '2026-02-24 10:00',
            delta: 100
          },
          {
            stub: 'coin_2',
            title: 'Watch unlock',
            at: '2026-02-24 09:32',
            delta: -30
          }
        ],
        bonus_log: [
          {
            stub: 'bonus_1',
            title: 'Top up gift',
            at: '2026-02-24 10:00',
            delta: 10
          }
        ]
      }
    }
  },
  computed: {
    activeLedgerRows() {
      return this.ledgerStore[this.ledgerTabCursor] || []
    }
  },
  methods: {
    switchLedgerPane(nextCode) {
      this.ledgerTabCursor = nextCode
    }
  }
}
</script>

<style lang="scss" scoped>
.m5w-wallet-shell {
  min-height: 100vh;
  padding: 20rpx;
  box-sizing: border-box;
  background: linear-gradient(180deg, #121d29 0%, #091219 100%);
}

.m5w-balance-strip {
  margin-top: 8rpx;
  border-radius: 20rpx;
  padding: 16rpx;
  background: rgba(255, 255, 255, 0.05);
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10rpx;
}

.m5w-balance-cell {
  border-radius: 12rpx;
  padding: 12rpx;
  background: rgba(16, 29, 43, 0.8);
}

.m5w-balance-key {
  display: block;
  font-size: 22rpx;
  color: #91a9c4;
}

.m5w-balance-val {
  margin-top: 6rpx;
  display: block;
  font-size: 32rpx;
  color: #f1f6ff;
  font-weight: 700;
}

.m5w-segment-grid {
  margin-top: 16rpx;
  display: flex;
  border-radius: 14rpx;
  padding: 8rpx;
  background: rgba(255, 255, 255, 0.05);
}

.m5w-segment-pill {
  flex: 1;
  text-align: center;
  color: #94aac4;
  font-size: 22rpx;
  padding: 10rpx 0;
  border-radius: 10rpx;
}

.m5w-segment-pill--active {
  color: #f4f8ff;
  background: rgba(111, 185, 255, 0.24);
}

.m5w-ledger-card {
  margin-top: 16rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.04);
  overflow: hidden;
}

.m5w-ledger-row {
  padding: 18rpx 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.06);
}

.m5w-ledger-row:last-child {
  border-bottom: none;
}

.m5w-ledger-main {
  display: flex;
  flex-direction: column;
}

.m5w-ledger-title {
  color: #e3edf9;
  font-size: 25rpx;
}

.m5w-ledger-time {
  margin-top: 6rpx;
  color: #8ea3bc;
  font-size: 20rpx;
}

.m5w-ledger-amount {
  color: #ef8b64;
  font-size: 28rpx;
  font-weight: 700;
}

.m5w-ledger-amount--plus {
  color: #6fd095;
}

.m5w-ledger-empty {
  text-align: center;
  padding: 32rpx 0;
  color: #8ea3bc;
  font-size: 22rpx;
}

.m5w-terms-tip {
  margin-top: 24rpx;
  text-align: center;
  font-size: 20rpx;
  color: #8fa4bf;
}
</style>
