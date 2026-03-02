import store from '@/store/index.js'

const AUTH_SIG_STORAGE_KEY = 'x-auth-sig'
const PROD_API_ROOT = 'http://123.57.107.35:3000/api'
const LOCAL_DEV_API_ROOT = 'http://127.0.0.1:3000/api'
const H5_DEV_PROXY_API_ROOT = '/api'
const customDevApiRoot = uni.getStorageSync('dev-api-root')
const isH5Runtime = process.env.VUE_APP_PLATFORM === 'h5'

// 临时修改：H5 开发环境也直接使用 localhost:3000
const API_ROOT =
  process.env.NODE_ENV === 'production'
    ? PROD_API_ROOT
    : customDevApiRoot || LOCAL_DEV_API_ROOT

export const BASE_URL = API_ROOT
export const SESSION_SIG_KEY = AUTH_SIG_STORAGE_KEY

const requestPipeline = []
const responsePipeline = []
const failurePipeline = []

const attachRequestInterceptor = (handler) => requestPipeline.push(handler)
const attachResponseInterceptor = (handler) => responsePipeline.push(handler)
const attachFailureInterceptor = (handler) => failurePipeline.push(handler)

const runPipeline = async (pipeline, payload, bag) => {
  let cursor = payload
  for (const interceptor of pipeline) {
    cursor = await interceptor(cursor, bag)
  }
  return cursor
}

const resolveSessionSig = (storeCtx) => {
  const stateSig = storeCtx?.state?.token
  if (stateSig) {
    return stateSig
  }
  return uni.getStorageSync(AUTH_SIG_STORAGE_KEY) || ''
}

const notifyToast = (message, icon = 'none') => {
  uni.showToast({
    title: message,
    icon
  })
}

const buildError = (message, extra = {}) => {
  const wrapped = new Error(message)
  wrapped.__uiReady = true
  Object.assign(wrapped, extra)
  return wrapped
}

const forceReLogin = (storeCtx) => {
  storeCtx.commit('logout')
  uni.switchTab({
    url: '/pages/account/center'
  })
}

const requestDriver = (meta) =>
  new Promise((resolve, reject) => {
    uni.request({
      url: meta.requestURL,
      method: meta.method,
      data: meta.payload,
      timeout: meta.timeout,
      header: meta.headers,
      success: resolve,
      fail: reject
    })
  })

attachRequestInterceptor(async (draft, bag) => {
  const now = Date.now()
  const traceToken = `${now}-${Math.random().toString(16).slice(2, 8)}`
  const payload = Object.assign({}, draft.payload || {}, {
    stamp: now,
    traceToken
  })
  return Object.assign({}, draft, {
    payload,
    requestURL: `${BASE_URL}${draft.endpoint}`
  })
})

attachRequestInterceptor(async (draft, bag) => {
  const sig = resolveSessionSig(bag.storeCtx)
  const headers = Object.assign({}, draft.headers || {}, {
    clientType: 'h5'
  })
  if (sig) {
    headers.Authorization = `Bearer ${sig}`
    headers['x-auth-sig'] = sig
  }
  return Object.assign({}, draft, {
    headers
  })
})

attachResponseInterceptor(async (transportResult, bag) => {
  const statusCode = Number(transportResult?.statusCode || 0)
  if (statusCode === 401) {
    forceReLogin(bag.storeCtx)
    throw buildError('登录状态已过期，请重新进入账号页。', {
      code: 401,
      transport: transportResult
    })
  }
  if (!statusCode) {
    throw buildError('请求未到达服务端，请检查网络连接。', {
      code: -1,
      transport: transportResult
    })
  }
  if (statusCode >= 500) {
    throw buildError('服务暂时拥挤，请稍后重试。', {
      code: statusCode,
      transport: transportResult
    })
  }
  return transportResult
})

attachResponseInterceptor(async (transportResult) => {
  const packet = transportResult?.data || {}
  if (packet.code && packet.code !== 200) {
    throw buildError(packet.message || '请求未成功，请稍后再试。', {
      code: packet.code,
      packet
    })
  }
  return packet.data
})

attachFailureInterceptor(async (error) => {
  if (error?.__uiReady) {
    notifyToast(error.message)
    throw error
  }
  const networkMessage =
    error?.errMsg?.includes('timeout') || error?.errMsg?.includes('abort')
      ? '请求超时，请稍后再试。'
      : '网络连接不稳定，请稍后刷新重试。'
  const wrapped = buildError(networkMessage, {
    raw: error
  })
  notifyToast(wrapped.message)
  throw wrapped
})

const runRequest = async (method, endpoint, data, storeCtx = null) => {
  const contextBag = {
    storeCtx: storeCtx || store
  }
  const draft = {
    method,
    endpoint,
    payload: data || {},
    timeout: 12000,
    headers: {}
  }
  try {
    const outbound = await runPipeline(requestPipeline, draft, contextBag)
    const inbound = await requestDriver(outbound)
    return await runPipeline(responsePipeline, inbound, contextBag)
  } catch (error) {
    return runPipeline(failurePipeline, error, contextBag)
  }
}

const post = (endpoint, payload, storeCtx = null) =>
  runRequest('POST', endpoint, payload, storeCtx)

const get = (endpoint, payload, storeCtx = null) =>
  runRequest('GET', endpoint, payload, storeCtx)

const upload = (filePath, storeCtx = null) =>
  new Promise((resolve, reject) => {
    const currentStore = storeCtx || store
    const sig = resolveSessionSig(currentStore)
    const header = sig ? { Authorization: `Bearer ${sig}`, 'x-auth-sig': sig } : {}
    uni.uploadFile({
      url: `${BASE_URL}/public/upload`,
      filePath,
      name: 'file',
      header,
      success(uploadRes) {
        if (uploadRes.statusCode !== 200) {
          reject(buildError('文件上传失败，请稍后重试。', { uploadRes }))
          return
        }
        try {
          const packet = JSON.parse(uploadRes.data || '{}')
          resolve(packet.data)
        } catch (error) {
          reject(buildError('上传返回数据无法解析。', { error }))
        }
      },
      fail(error) {
        reject(buildError('上传请求中断，请检查网络后重试。', { error }))
      }
    })
  }).catch((error) => runPipeline(failurePipeline, error, { storeCtx: storeCtx || store }))

export default {
  post,
  get,
  upload
}
