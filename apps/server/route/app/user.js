import mongo from '#@/lib/mongo.js'
import { success, fail } from '#@/lib/response.js'
import { ObjectId } from 'mongodb'
import redis from '#@/lib/redis.js'
import util from '#@/lib/util.js'

export default {
  // 榛樿鏂规硶 GET
  async index(ctx) {
    const { name, id, pageNum, pageSize } = ctx.query

    try {
      pageSize = Number(pageSize || 20)
      pageNum = Number(pageNum || 1)
      const skip = (pageNum - 1) * pageSize
      const sort = {
        _id: -1
      }
      let query = {}
      if (name) {
        query.name = name
      }
      if (id) {
        query.id = id
      }
      const list = await mongo
        .col('user')
        .find(query)
        .sort(sort)
        .limit(pageSize)
        .skip(skip)
        .toArray()
      const total = await mongo.col('user').countDocuments(query)
      success(ctx, {
        total,
        list
      })
    } catch (error) {
      fail(ctx, 'Server error')
    }
  },
  // 杩斿洖鍒楄〃锛屾敮鎸佸垎椤?POST
  async list(ctx) {
    try {
      const { page, form, sort } = ctx.request.body
      let { currentPage, pageSize } = page

      const sorting = {}
      if (Object.keys(sort).length !== 0) {
        sorting[sort.prop] = sort.asc ? -1 : 1
      } else {
        sorting['updatedAt'] = -1
      }

      pageSize = Number(pageSize || 20)
      currentPage = Number(currentPage || 1)
      const offset = (currentPage - 1) * pageSize

      const query = {}
      for (const key in form) {
        if (Object.hasOwnProperty.call(form, key)) {
          const element = form[key]
          query[key] = { $regex: element }
        }
      }

      const records = await mongo
        .col('user')
        .find(query)
        .sort(sorting)
        .limit(pageSize)
        .skip(offset)
        .toArray()
      const total = await mongo.col('user').countDocuments(form)
      success(ctx, {
        currentPage,
        pageSize,
        total,
        records
      })
    } catch (error) {
      console.log(error)
      fail(ctx, 'Server error')
    }
  },
  // 澧炲姞 POST
  async create(ctx) {
    const document = ctx.request.body
    document.createdAt = new Date().getTime()
    document.updatedAt = new Date().getTime()
    const ret = await mongo.col('user').insertOne(document)
    try {
      success(ctx, { id: ret.insertedId })
    } catch (error) {
      fail(ctx, 'Server error')
    }
  },
  // 鑾峰彇涓€涓俊鎭?GET
  async get(ctx) {
    try {
      const { id } = ctx.params

      const user = await mongo.col('user').findOne({ _id: new ObjectId(id) })
      success(ctx, user)
    } catch (error) {
      console.log(error)
      fail(ctx, 'Server error')
    }
  },
  // 鏇存柊 PUT
  async update(ctx) {
    try {
      const document = ctx.request.body
      document.updatedAt = new Date().getTime()

      const { _id } = document
      delete document._id

      const ret = await mongo
        .col('user')
        .findOneAndUpdate(
          { _id: new ObjectId(_id) },
          { $set: document },
          { returnDocument: 'after', returnNewDocument: true }
        )

      if (!ret.value) {
        fail(ctx, 'Server error')
        return
      }
      success(ctx, ret.value)
    } catch (error) {
      console.log(error)
      fail(ctx, 'Server error')
    }
  },
  // 鍒犻櫎 DELETE
  async delete(ctx) {
    try {
      const { id } = ctx.params
      const ret = await mongo.col('user').deleteOne({ _id: new ObjectId(id) })
      if (ret.deletedCount === 0) {
        fail(ctx, '鍒犻櫎澶辫触')
        return
      }
      success(ctx, {})
    } catch (error) {
      fail(ctx, 'Server error')
    }
  },
  // 鎵归噺鍒犻櫎
  async deleteMany(ctx) {
    let { ids } = ctx.request.body

    try {
      ids = ids.map((id) => new ObjectId(id))
      const ret = await mongo.col('user').deleteMany({ _id: { $in: ids } })
      if (ret.deletedCount === 0) {
        fail(ctx, '鍒犻櫎澶辫触')
        return
      }
      success(ctx, {})
    } catch (error) {
      fail(ctx, 'Server error')
    }
  },
  // 鏁版嵁瀛楀吀
  async dict(ctx) {
    try {
      // 杩欓噷鐢╭uery 浼犻€掓暟鎹瓧鍏哥殑 缂栧彿锛屽彲浠ョ敤涓€涓柟娉曞疄鐜板涓瓧鍏搞€?
      let { id } = ctx.query
      id = Number(id || 0)

      const data = [
        [
          { value: true, label: 'Enabled', color: 'success' },
          { value: false, label: '鍏抽棴', color: 'warning' }
        ]
      ]
      success(ctx, data[id])
    } catch (error) {
      console.log(error)
      fail(ctx, 'Server error')
    }
  },
  // 发送验证码
  async sendCode(ctx) {
    try {
      const { phone } = ctx.request.body

      // 验证手机号格式
      if (!util.isMobile(phone)) {
        fail(ctx, '请输入正确的手机号')
        return
      }

      // 检查手机号是否已注册
      const existUser = await mongo.col('user').findOne({ phone })
      if (existUser) {
        fail(ctx, '该手机号已注册')
        return
      }

      // 生成6位数字验证码
      const code = util.randomString(6, 3)

      // 将验证码存入Redis，有效期5分钟
      await redis.client.setEx(`sms:${phone}`, 300, code)

      // TODO: 这里应该调用短信服务发送验证码
      // 开发环境下直接返回验证码（生产环境需要删除）
      console.log(`验证码: ${code}`)

      success(ctx, { 
        message: '验证码已发送',
        // 开发环境返回验证码，生产环境删除此行
        code: process.env.NODE_ENV === 'development' ? code : undefined
      })
    } catch (error) {
      console.log(error)
      fail(ctx, '发送验证码失败')
    }
  },
  // 手机号注册
  async register(ctx) {
    try {
      const { phone, password, code } = ctx.request.body

      // 验证必填字段
      if (!phone || !password || !code) {
        fail(ctx, '请填写完整信息')
        return
      }

      // 验证手机号格式
      if (!util.isMobile(phone)) {
        fail(ctx, '请输入正确的手机号')
        return
      }

      // 验证密码长度
      if (password.length < 6) {
        fail(ctx, '密码长度不能少于6位')
        return
      }

      // 检查手机号是否已注册
      const existUser = await mongo.col('user').findOne({ phone })
      if (existUser) {
        fail(ctx, '该手机号已注册')
        return
      }

      // 验证验证码
      const savedCode = await redis.client.get(`sms:${phone}`)
      if (!savedCode) {
        fail(ctx, '验证码已过期，请重新获取')
        return
      }
      if (savedCode !== code) {
        fail(ctx, '验证码错误')
        return
      }

      // 创建用户
      const document = {
        phone,
        username: phone, // 默认用户名为手机号
        password,
        pass: true, // 默认启用
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime()
      }

      const ret = await mongo.col('user').insertOne(document)

      // 删除已使用的验证码
      await redis.client.del(`sms:${phone}`)

      success(ctx, { 
        id: ret.insertedId,
        message: '注册成功'
      })
    } catch (error) {
      console.log(error)
      fail(ctx, '注册失败')
    }
  }
}
