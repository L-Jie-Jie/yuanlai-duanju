import mongo from '#@/lib/mongo.js'
import { success, fail } from '#@/lib/response.js'
import { ObjectId } from 'mongodb'

export default {
  // 榛樿鏂规硶 GET
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
        .col('category')
        .find(query)
        .sort(sort)
        .limit(pageSize)
        .skip(skip)
        .toArray()
      const total = await mongo.col('category').countDocuments(query)
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
        sorting['order'] = 1
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
        .col('category')
        .find(query)
        .sort(sorting)
        .limit(pageSize)
        .skip(offset)
        .toArray()
      const total = await mongo.col('category').countDocuments(form)
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
    const ret = await mongo.col('category').insertOne(document)
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

      const category = await mongo
        .col('category')
        .findOne({ _id: new ObjectId(id) })
      success(ctx, category)
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
        .col('category')
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
      const ret = await mongo
        .col('category')
        .deleteOne({ _id: new ObjectId(id) })
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
      const ret = await mongo.col('category').deleteMany({ _id: { $in: ids } })
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



