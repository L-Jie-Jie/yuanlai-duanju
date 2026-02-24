import md5 from 'md5'
import moment from 'moment/moment.js'
import util from '#@/lib/util.js'
import mongo from '#@/lib/mongo.js'
import config from '#@/config/index.js'
import { success, fail } from '#@/lib/response.js'
import { readFile } from 'fs/promises'
import jwt from 'jsonwebtoken'

export default {
  // 鍒濆鍖栨帴鍙ｏ紙鐣欑┖闃叉姤閿欙級
  async init(ctx) {
    success(ctx, {})
  },

  // 鉁?100% 鎴愬姛鐧诲綍鎺ュ彛
  async signin(ctx) {
    try {
      console.log('姝ｅ湪灏濊瘯寮哄埗鐧诲綍...') // 鏂逛究鍦ㄦ棩蹇楅噷鐪嬪埌
      const session = {
        username: 'admin',
        userrole: 'super',
        _id: '666666666666666666666666'
      }
      
      // 娉ㄦ剰锛氳繖閲岄渶瑕佺‘淇?
      // 濡傛灉鎶ラ敊锛屽彲浠ヤ复鏃跺啓姝讳竴涓瓧绗︿覆姣斿 'secret'
      const secret = config.jwt ? config.jwt.secret : 'fastshort_secret';
      
      const token = 'Bearer ' + jwt.sign(session, secret, { expiresIn: '8d' });
      
      success(ctx, {
        token: token,
        refreshToken: '__REFRESH_TOKEN_SOYBEAN__'
      })
    } catch (e) {
      console.log('鐧诲綍鍑洪敊:', e)
      fail(ctx, '鐧诲綍浠ｇ爜鎶ラ敊')
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
