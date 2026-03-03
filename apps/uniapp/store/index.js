import Vue from 'vue'
import Vuex from 'vuex'
import request from '@/common/request'

Vue.use(Vuex)

const AUTH_SIG_STORAGE_KEY = 'x-auth-sig'
const USER_STORAGE_KEY = 'user'

const store = new Vuex.Store({
  state: {
    token: '',
    user: {}
  },
  mutations: {
    token(state, token) {
      state.token = token
    },
    user(state, user) {
      state.user = user
    },
    logout(state) {
      state.token = ''
      state.user = {}
      uni.removeStorageSync(AUTH_SIG_STORAGE_KEY)
      uni.removeStorageSync('token')
      uni.removeStorageSync(USER_STORAGE_KEY)
    }
  },
  actions: {
    async autoLogin(context) {
      if (!context.state.token) {
        const authSig = uni.getStorageSync(AUTH_SIG_STORAGE_KEY)
        const cachedUser = uni.getStorageSync(USER_STORAGE_KEY)
        if (authSig && cachedUser) {
          context.commit('token', authSig)
          context.commit('user', JSON.parse(cachedUser))
        } else {
          const res = await request.post('/public/anonymous', context.state.user)
          const { token, user } = res

          store.commit('token', token)
          store.commit('user', user)

          uni.setStorageSync(AUTH_SIG_STORAGE_KEY, token)
          uni.setStorageSync(USER_STORAGE_KEY, JSON.stringify(user))
        }
      }
    }
  }
})
export default store
