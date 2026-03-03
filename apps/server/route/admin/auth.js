import md5 from 'md5'
import moment from 'moment/moment.js'
import util from '#@/lib/util.js'
import mongo from '#@/lib/mongo.js'
import config from '#@/config/index.js'
import { success, fail } from '#@/lib/response.js'
import { readFile } from 'fs/promises'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'

export default {
  // 初始化接口（留空防报错）
  async init(ctx) {
    success(ctx, {})
  },

  // 管理员登录接口
  async signin(ctx) {
    try {
      const { username, password } = ctx.request.body
      
      if (!username || !password) {
        fail(ctx, '请输入用户名和密码')
        return
      }

      // 查询管理员
      const admin = await mongo.col('admin').findOne({ username, pass: true })
      
      if (!admin) {
        fail(ctx, '用户不存在或已被禁用')
        return
      }

      // 验证密码
      const passwordHash = md5(password + config.jwt.saltkey)
      if (admin.password !== passwordHash) {
        fail(ctx, '密码错误')
        return
      }

      // 生成token
      const session = {
        username: admin.username,
        userrole: admin.userrole || 'user',
        _id: admin._id.toString()
      }
      
      const secret = config.jwt.secret
      const token = 'Bearer ' + jwt.sign(session, secret, { expiresIn: '7d' })
      
      success(ctx, {
        token: token,
        refreshToken: '__REFRESH_TOKEN_SOYBEAN__'
      })
    } catch (e) {
      console.log('登录出错:', e)
      fail(ctx, '登录失败，请稍后重试')
    }
  },

  async getUserInfo(ctx) {
    try {
      // 从token中获取用户信息
      const token = ctx.headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        fail(ctx, '未登录')
        return
      }

      const decoded = jwt.verify(token, config.jwt.secret)
      const { _id, username, userrole } = decoded

      // 从数据库获取最新的用户信息
      const admin = await mongo.col('admin').findOne({ 
        _id: new ObjectId(_id) 
      })

      if (!admin || !admin.pass) {
        fail(ctx, '用户不存在或已被禁用')
        return
      }

      success(ctx, { 
        username: admin.username,
        userrole: admin.userrole || 'user',
        avatar: admin.avatar || 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
        _id: admin._id.toString()
      })
    } catch (e) {
      console.log('获取用户信息出错:', e)
      fail(ctx, '获取用户信息失败')
    }
  }
}
