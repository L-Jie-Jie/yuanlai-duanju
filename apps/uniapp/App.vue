<script>
import { mapActions } from 'vuex'

export default {
  methods: {
    ...mapActions(['autoLogin'])
  },
  onLaunch: function () {
    this.autoLogin()
  },
  // onShow: function () {
  // },
  // onHide: function () {
  // }
}
</script>

<style lang="scss">
@import '@/static/fonts/iconfont.css';

/* 全局样式重置 - 简约大气黑金风格 */
uni-button {
  line-height: 1.8;
}

::v-deep .uni-icon_toast {
  padding-bottom: 10px;
}

::v-deep .uni-toast {
  padding: 0 20px;
}

page {
  background-color: #050505;
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', 'STHeiti', 'Microsoft Yahei', 'Tahoma', 'Simsun', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.pages {
  padding: 10px 15px;
}

.statusbar {
  height: 35px;
}

.title {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 10px 0;
}

/* 全局滚动条隐藏 */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  background: transparent;
}

/* 全局选中文本样式 */
::selection {
  background-color: #E5B567;
  color: #000000;
}
</style>
