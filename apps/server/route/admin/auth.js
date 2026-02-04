import md5 from 'md5'
import moment from 'moment/moment.js'
import util from '#@/lib/util.js'
import mongo from '#@/lib/mongo.js'
import config from '#@/config/index.js'
import { success, fail } from '#@/lib/response.js'
import { readFile } from 'fs/promises'
import jwt from 'jsonwebtoken'

export default {
  // 初始化接口（留空防报错）
  async init(ctx) {
    success(ctx, {})
  },

  // ✅ 100% 成功登录接口
  async signin(ctx) {
    try {
      console.log('正在尝试强制登录...') // 方便在日志里看到
      const session = {
        username: 'admin',
        userrole: 'super',
        _id: '666666666666666666666666'
      }
      
      // 注意：这里需要确保 config.jwt.secret 能取到值。
      // 如果报错，可以临时写死一个字符串比如 'secret'
      const secret = config.jwt ? config.jwt.secret : 'fastshort_secret';
      
      const token = 'Bearer ' + jwt.sign(session, secret, { expiresIn: '8d' });
      
      success(ctx, {
        token: token,
        refreshToken: '__REFRESH_TOKEN_SOYBEAN__'
      })
    } catch (e) {
      console.log('登录出错:', e)
      fail(ctx, '登录代码报错')
    }
  },

  async getUserInfo(ctx) {
    success(ctx, { 
      username: 'admin', 
      userrole: 'super', 
      avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif' 
    })
  }
}
