import mongo from '#@/lib/mongo.js'
import { success, fail } from '#@/lib/response.js'
import { ObjectId } from 'mongodb'
import md5 from 'md5'
import config from '#@/config/index.js'

export default {
  // 榛樿鏂规硶 GET
  async index(ctx) {
    try {
      let { currentPage, pageSize, search } = ctx.query
      // 鍒嗛〉
      const limit = Number(pageSize || 20)
      currentPage = Number(currentPage || 1)
      const offset = (currentPage - 1) * pageSize

      const sort = {
        _id: -1
      }
      let query = {}
      if (search) {
        query.name = search
      }
      if (id) {
        query.id = id
      }
      const records = await mongo
        .col('admin')
        .find(query)
        .sort(sort)
        .limit(limit)
        .skip(offset)
        .toArray()
      const total = await mongo.col('admin').countDocuments(query)
      success(ctx, {
        limit,
        offset,
        total,
        records
      })
    } catch (error) {
      console.log(error)
      fail(ctx, 'Server error')
    }
  },
  // 杩斿洖鍒楄〃锛屾敮鎸佸垎椤?POST
  async list(ctx) {
    try {
      const { page, query, sort } = ctx.request.body
      let { currentPage, pageSize } = page

      pageSize = Number(pageSize || 20)
      currentPage = Number(currentPage || 1)
      const offset = (currentPage - 1) * pageSize

      const records = await mongo
        .col('admin')
        .find(query)
        .sort(sort)
        .limit(pageSize)
        .skip(offset)
        .toArray()
      const total = await mongo.col('admin').countDocuments(query)
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
    if (document.passwordstr) {
      document.password = md5(document.passwordstr + config.jwt.saltkey)
      document.passwordstr = ''
    }
    const ret = await mongo.col('admin').insertOne(document)
    try {
      success(ctx, { id: ret.insertedId })
    } catch (error) {
      fail(ctx, 'Server error')
    }
  },
  // 鑾峰彇涓€涓俊鎭?GET
  async get(ctx) {
    try {
      const { id } = ctx.params

      const admin = await mongo.col('admin').findOne({ _id: new ObjectId(id) })
      success(ctx, admin)
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

      if (document.passwordstr) {
        document.password = md5(document.passwordstr + config.jwt.saltkey)
        document.passwordstr = ''
      }
      const ret = await mongo
        .col('admin')
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
      const ret = await mongo.col('admin').deleteOne({ _id: new ObjectId(id) })
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
      const ret = await mongo.col('admin').deleteMany({ _id: { $in: ids } })
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
      // 杩欓噷鐢╭uery 浼犻€掓暟鎹瓧鍏哥殑 缂栧彿锛屽彲浠ョ敤涓€涓柟娉曞疄鐜板涓瓧鍏搞€?
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
  }
}



