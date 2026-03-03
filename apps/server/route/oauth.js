import mongo from '#@/lib/mongo.js'
import { fail, jwtoken } from '#@/lib/response.js'
import { MiniProgram } from 'wechat-jssdk'
import config from '#@/config/index.js'
import { ObjectId } from 'mongodb'

const upsertOauth = async ({ type, _id, openid, session }) => {
  await mongo.col('oauth').updateOne(
    { user: _id, type, openid },
    { $set: { ...session, user: _id, type } },
    { upsert: true }
  )
}

const createUser = async ({ username, avatar = '/static/avatar.jpg' }) => {
  const ret = await mongo.col('user').insertOne({
    username,
    avatar,
    guest: false,
    pass: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  })
  return ret.insertedId
}

const findOrCreateUserByOauth = async ({ type, openid, fallbackUser }) => {
  const exists = await mongo.col('oauth').findOne({ type, openid })
  if (exists) {
    return exists.user
  }
  const newUserId = await createUser(fallbackUser)
  await mongo.col('oauth').insertOne({ type, openid, user: newUserId })
  return newUserId
}

export default {
  // 小程序统一登录接口（支持微信和抖音）
  async miniapp(ctx) {
    try {
      const { platform, code, encryptedData, iv, phoneCode } = ctx.request.body
      let { _id } = ctx.query
      
      if (!platform || !code) {
        return fail(ctx, 'Missing required parameters')
      }

      let session, phoneNumber, openid, type
      
      // 根据平台调用不同的 API
      if (platform === 'weixin') {
        type = 'wechatmp'
        // 微信小程序登录
        const miniProgram = new MiniProgram({
          miniProgram: {
            appId: config.mp.appId,
            appSecret: config.mp.appSecret
          }
        })
        
        session = await miniProgram.getSession(code)
        if (!session || !session.openid) {
          return fail(ctx, 'WeChat login failed')
        }
        openid = session.openid
        
        // 解密手机号（如果有）
        if (encryptedData && iv) {
          try {
            const phoneData = await miniProgram.decryptData(encryptedData, iv, session.session_key)
            phoneNumber = phoneData.phoneNumber
          } catch (error) {
            console.error('Decrypt phone error:', error)
          }
        }
      } else if (platform === 'toutiao') {
        type = 'douyin'
        // 抖音小程序登录
        // TODO: 实现抖音登录逻辑
        // 需要安装抖音 SDK 或自行实现
        return fail(ctx, 'Douyin login not implemented yet')
      } else {
        return fail(ctx, 'Unsupported platform')
      }

      // 查找或创建用户
      if (_id) {
        await upsertOauth({ type, _id, openid, session })
      } else {
        _id = await findOrCreateUserByOauth({
          type,
          openid,
          fallbackUser: { 
            username: phoneNumber ? `用户${phoneNumber.slice(-4)}` : `${platform}User`,
            phone: phoneNumber
          }
        })
      }

      const ret = await mongo.col('user').findOneAndUpdate(
        { _id: new ObjectId(_id) },
        { 
          $set: { 
            openid, 
            guest: false,
            ...(phoneNumber && { phone: phoneNumber })
          } 
        },
        { returnDocument: 'after' }
      )
      
      jwtoken(ctx, ret.value)
    } catch (error) {
      console.error('Miniapp login error:', error)
      fail(ctx, 'Login failed')
    }
  },

  async wechatmp(ctx) {
    try {
      const { code } = ctx.request.body
      let { _id } = ctx.query
      const type = 'wechatmp'

      const miniProgram = new MiniProgram({
        miniProgram: {
          appId: config.mp.appId,
          appSecret: config.mp.appSecret
        }
      })

      const session = await miniProgram.getSession(code)
      if (!session || !session.openid) {
        fail(ctx, 'WeChat login failed')
        return
      }

      if (_id) {
        await upsertOauth({ type, _id, openid: session.openid, session })
      } else {
        _id = await findOrCreateUserByOauth({
          type,
          openid: session.openid,
          fallbackUser: { username: 'WechatUser' }
        })
      }

      const ret = await mongo.col('user').findOneAndUpdate(
        { _id: new ObjectId(_id) },
        { $set: { openid: session.openid, guest: false } },
        { returnDocument: 'after', returnNewDocument: true }
      )
      jwtoken(ctx, ret.value)
    } catch (error) {
      fail(ctx, 'Server error')
    }
  },

  async google(ctx) {
    try {
      let { _id } = ctx.query
      const session = ctx.request.body
      const type = 'google'
      if (!session.openid) return fail(ctx, 'Parameter error')

      if (_id) {
        await upsertOauth({ type, _id, openid: session.openid, session })
      } else {
        _id = await findOrCreateUserByOauth({
          type,
          openid: session.openid,
          fallbackUser: {
            username: session.nickname || 'GoogleUser',
            avatar: session.headimgurl || '/static/avatar.jpg'
          }
        })
      }

      const ret = await mongo.col('user').findOneAndUpdate(
        { _id: new ObjectId(_id) },
        {
          $set: {
            username: session.nickname || 'GoogleUser',
            avatar: session.headimgurl || '/static/avatar.jpg',
            guest: false
          }
        },
        { returnDocument: 'after', returnNewDocument: true }
      )
      jwtoken(ctx, ret.value)
    } catch (error) {
      fail(ctx, 'Server error')
    }
  },

  async facebook(ctx) {
    try {
      let { _id } = ctx.query
      const session = ctx.request.body
      const type = 'facebook'
      if (!session.openid) return fail(ctx, 'Parameter error')

      if (_id) {
        await upsertOauth({ type, _id, openid: session.openid, session })
      } else {
        _id = await findOrCreateUserByOauth({
          type,
          openid: session.openid,
          fallbackUser: {
            username: session.nickname || 'FacebookUser',
            avatar: session.headimgurl || '/static/avatar.jpg'
          }
        })
      }

      const ret = await mongo.col('user').findOneAndUpdate(
        { _id: new ObjectId(_id) },
        {
          $set: {
            username: session.nickname || 'FacebookUser',
            avatar: session.headimgurl || '/static/avatar.jpg',
            guest: false
          }
        },
        { returnDocument: 'after', returnNewDocument: true }
      )
      jwtoken(ctx, ret.value)
    } catch (error) {
      fail(ctx, 'Server error')
    }
  },

  async apple(ctx) {
    try {
      let { _id } = ctx.query
      const session = ctx.request.body
      const type = 'apple'
      const openid = session.openid || session.user
      if (!openid) return fail(ctx, 'Parameter error')

      if (_id) {
        await upsertOauth({ type, _id, openid, session })
      } else {
        _id = await findOrCreateUserByOauth({
          type,
          openid,
          fallbackUser: {
            username: session?.fullName?.nickName || 'AppleUser',
            avatar: '/static/avatar.jpg'
          }
        })
      }

      const ret = await mongo.col('user').findOneAndUpdate(
        { _id: new ObjectId(_id) },
        {
          $set: {
            username: session?.fullName?.nickName || 'AppleUser',
            guest: false
          }
        },
        { returnDocument: 'after', returnNewDocument: true }
      )
      jwtoken(ctx, ret.value)
    } catch (error) {
      fail(ctx, 'Server error')
    }
  }
}
