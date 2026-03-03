import mongo from '#@/lib/mongo.js'
import { success, fail } from '#@/lib/response.js'
import { ObjectId } from 'mongodb'

export default {
  // 鎴戠殑鏀惰棌锛屽垪琛?
  async favorite(ctx) {
    try {
      const favorite = await mongo.col('series').find().limit(3).toArray()
      const last = await mongo.col('series').find().limit(3).toArray()

      success(ctx, {
        last,
        favorite
      })
    } catch (error) {
      fail(ctx, 'Server error')
    }
  },
  // 鍠滄/鏀惰棌涓€涓墽闆?
  async like(ctx) {
    try {
      const { _id } = ctx.state.user
      const { series } = ctx.request.body
      const doc = {
        series: series,
        user: _id
      }
      await mongo.col('like').updateOne(doc, { $set: doc }, { upsert: true })

      await mongo.col('series').updateOne(
        {
          _id: new ObjectId(series)
        },
        { $inc: { like: 1 } }
      )

      success(ctx, {})
    } catch (error) {
      fail(ctx, 'Server error')
    }
  },
  // 鍙栨秷鍠滄锛屾敹钘?
  async unlike(ctx) {
    try {
      const { _id } = ctx.state.user
      const { series } = ctx.request.body
      const doc = {
        series: series,
        user: _id
      }
      await mongo.col('like').deleteOne(doc)

      await mongo.col('series').updateOne(
        {
          _id: new ObjectId(series)
        },
        { $inc: { like: -1 } }
      )

      success(ctx, {})
    } catch (error) {
      fail(ctx, 'Server error')
    }
  },

  async updateUser(ctx) {
    const { _id } = ctx.state.user
    const { avatar, username } = ctx.request.body

    const ret = await mongo
      .col('user')
      .findOneAndUpdate(
        { _id: new ObjectId(_id) },
        { $set: { avatar, username } },
        { upsert: false, returnDocument: 'after', returnNewDocument: true }
      )
    success(ctx, ret.value)
  }
}

