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
