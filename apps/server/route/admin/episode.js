import mongo from '#@/lib/mongo.js'
import { success, fail } from '#@/lib/response.js'
import { ObjectId } from 'mongodb'

function normalizeEpisode(value) {
  const episode = Number(value)
  return Number.isFinite(episode) ? episode : null
}

function isValidObjectId(value) {
  return typeof value === 'string' && ObjectId.isValid(value)
}

function buildEpisodeLabel(episode) {
  return episode === 9999 ? '尾集' : `第${episode}集`
}

function buildEpisodeOption(episode, disabled = false) {
  return {
    value: String(episode),
    label: buildEpisodeLabel(episode),
    disabled
  }
}

export default {
  async index(ctx) {
    let { name, id, pageNum, pageSize } = ctx.query

    try {
      pageSize = Number(pageSize || 20)
      pageNum = Number(pageNum || 1)
      const skip = (pageNum - 1) * pageSize
      const sort = { _id: -1 }
      const query = {}

      if (name) query.name = name
      if (id) query.id = id

      const list = await mongo.col('episode').find(query).sort(sort).limit(pageSize).skip(skip).toArray()
      const total = await mongo.col('episode').countDocuments(query)

      success(ctx, { total, list })
    } catch (error) {
      fail(ctx, 'Server error')
    }
  },

  async list(ctx) {
    try {
      const { page, form, sort } = ctx.request.body
      let { currentPage, pageSize } = page

      const sorting = {}
      if (Object.keys(sort).length !== 0) {
        sorting[sort.prop] = sort.asc ? -1 : 1
      } else {
        sorting.episode = 1
      }

      pageSize = Number(pageSize || 20)
      currentPage = Number(currentPage || 1)
      const offset = (currentPage - 1) * pageSize

      const query = {}
      for (const key in form) {
        if (Object.hasOwnProperty.call(form, key)) {
          query[key] = { $regex: form[key] }
        }
      }

      const records = await mongo.col('episode').find(query).sort(sorting).limit(pageSize).skip(offset).toArray()
      const total = await mongo.col('episode').countDocuments(form)

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

  async create(ctx) {
    try {
      const document = ctx.request.body
      document.createdAt = Date.now()
      document.updatedAt = Date.now()
      document.episode = normalizeEpisode(document.episode)

      if (!isValidObjectId(document.series)) {
        fail(ctx, '请选择所属短剧')
        return
      }
      if (document.episode === null) {
        fail(ctx, '集数格式不正确')
        return
      }

      const series = await mongo.col('series').findOne({ _id: new ObjectId(document.series) })
      if (series) {
        document.seriesname = series.name
      }

      const exists = await mongo.col('episode').findOne({
        series: document.series,
        episode: document.episode
      })
      if (exists) {
        fail(ctx, '同一短剧下集数已存在')
        return
      }

      const ret = await mongo.col('episode').insertOne(document)
      success(ctx, { id: ret.insertedId })
    } catch (error) {
      if (error?.code === 11000) {
        fail(ctx, '同一短剧下集数已存在')
        return
      }
      console.log(error)
      fail(ctx, 'Server error')
    }
  },

  async get(ctx) {
    try {
      const { id } = ctx.params
      const episode = await mongo.col('episode').findOne({ _id: new ObjectId(id) })
      success(ctx, episode)
    } catch (error) {
      console.log(error)
      fail(ctx, 'Server error')
    }
  },

  async update(ctx) {
    try {
      const document = ctx.request.body
      document.updatedAt = Date.now()
      document.episode = normalizeEpisode(document.episode)

      const { _id } = document
      delete document._id

      if (!isValidObjectId(document.series)) {
        fail(ctx, '请选择所属短剧')
        return
      }
      if (document.episode === null) {
        fail(ctx, '集数格式不正确')
        return
      }

      const series = await mongo.col('series').findOne({ _id: new ObjectId(document.series) })
      if (series) {
        document.seriesname = series.name
      }

      const exists = await mongo.col('episode').findOne({
        _id: { $ne: new ObjectId(_id) },
        series: document.series,
        episode: document.episode
      })
      if (exists) {
        fail(ctx, '同一短剧下集数已存在')
        return
      }

      const ret = await mongo
        .col('episode')
        .findOneAndUpdate({ _id: new ObjectId(_id) }, { $set: document }, { returnDocument: 'after', returnNewDocument: true })

      if (!ret.value) {
        fail(ctx, 'Server error')
        return
      }
      success(ctx, ret.value)
    } catch (error) {
      if (error?.code === 11000) {
        fail(ctx, '同一短剧下集数已存在')
        return
      }
      console.log(error)
      fail(ctx, 'Server error')
    }
  },

  async delete(ctx) {
    try {
      const { id } = ctx.params
      
      // 注意：这里只删除数据库记录，不删除S3文件
      // S3文件应该通过专门的清理脚本定期清理孤立文件
      // 这样可以防止误删除仍在使用的文件
      const ret = await mongo.col('episode').deleteOne({ _id: new ObjectId(id) })
      if (ret.deletedCount === 0) {
        fail(ctx, '删除失败')
        return
      }
      
      console.log(`已删除分集记录 ${id}，S3文件保留（可通过清理脚本删除孤立文件）`)
      success(ctx, {})
    } catch (error) {
      fail(ctx, 'Server error')
    }
  },

  async deleteMany(ctx) {
    let { ids } = ctx.request.body

    try {
      ids = ids.map((value) => new ObjectId(value))
      
      // 注意：这里只删除数据库记录，不删除S3文件
      // S3文件应该通过专门的清理脚本定期清理孤立文件
      // 这样可以防止误删除仍在使用的文件
      const ret = await mongo.col('episode').deleteMany({ _id: { $in: ids } })
      if (ret.deletedCount === 0) {
        fail(ctx, '删除失败')
        return
      }
      
      console.log(`已删除 ${ret.deletedCount} 个分集记录，S3文件保留（可通过清理脚本删除孤立文件）`)
      success(ctx, {})
    } catch (error) {
      fail(ctx, 'Server error')
    }
  },

  async dict(ctx) {
    try {
      let { id } = ctx.query
      id = Number(id || 0)

      if (id === 0) {
        const categorys = await mongo.col('series').find().sort({ order: 1 }).toArray()
        const data = categorys.map((cat) => ({
          value: cat._id,
          label: cat.name,
          color: cat.pass ? 'success' : 'warning'
        }))
        success(ctx, data)
        return
      }

      if (id === 1) {
        const { series, currentEpisode } = ctx.query
        const current = normalizeEpisode(currentEpisode)
        const data = []

        if (!series) {
          for (let i = 1; i <= 10; i += 1) {
            data.push(buildEpisodeOption(i, false))
          }
          data.push(buildEpisodeOption(9999, false))
          success(ctx, data)
          return
        }

        const episodeDocs = await mongo
          .col('episode')
          .find({ series }, { projection: { episode: 1 } })
          .toArray()

        const usedEpisodeSet = new Set()
        let tailUsed = false

        for (const item of episodeDocs) {
          const ep = normalizeEpisode(item.episode)
          if (ep === null) continue
          if (ep === 9999) {
            tailUsed = true
            continue
          }
          if (ep > 0) usedEpisodeSet.add(ep)
        }

        if (current !== null) {
          if (current === 9999) {
            tailUsed = false
          } else if (current > 0) {
            usedEpisodeSet.delete(current)
          }
        }

        const maxUsedEpisode = usedEpisodeSet.size > 0 ? Math.max(...usedEpisodeSet) : 0
        const maxEpisode = current && current > 0 ? Math.max(maxUsedEpisode, current) : maxUsedEpisode
        const upperBound = Math.max(maxEpisode + 10, 10)

        for (let candidate = 1; candidate <= upperBound; candidate += 1) {
          const used = usedEpisodeSet.has(candidate)
          data.push(buildEpisodeOption(candidate, used))
        }

        data.push(buildEpisodeOption(9999, tailUsed))

        success(ctx, data)
      }
    } catch (error) {
      console.log(error)
      fail(ctx, 'Server error')
    }
  }
}
