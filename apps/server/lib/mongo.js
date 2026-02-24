import { MongoClient } from 'mongodb'

import config from '../config/index.js'

class Mongo {
  async init() {
    var option = {
      maxPoolSize: 50,
      wtimeoutMS: 500,
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
    if (!this.db) {
      this.client = await MongoClient.connect(config.mongodb.host, option)
      this.db = this.client.db(config.mongodb.db)
      await this.ensureIndexes()
      console.log(`mongodb杩炴帴鎴愬姛`)
    }
  }

  async ensureIndexes() {
    try {
      await this.db.collection('episode').createIndex(
        { series: 1, episode: 1 },
        {
          unique: true,
          name: 'uniq_series_episode',
          partialFilterExpression: {
            series: { $exists: true, $type: 'string', $gt: '' },
            episode: { $exists: true, $type: 'number' }
          }
        }
      )
    } catch (error) {
      if (error?.code === 11000) {
        console.warn('[mongo] unique index uniq_series_episode skipped: existing duplicate data found')
        return
      }
      if (error?.codeName === 'IndexOptionsConflict') {
        console.warn('[mongo] index uniq_series_episode exists with different options')
        return
      }
      if (error?.codeName === 'IndexKeySpecsConflict') {
        console.warn('[mongo] index uniq_series_episode already exists')
        return
      }
      throw error
    }
  }

  async close() {
    if (this.client) {
      await this.client.close()
      this.client = null
      this.db = null
    }
  }

  col(dbName) {
    return this.db.collection(dbName)
  }

  async getSession() {
    const seesion = await this.db.startSession()
    seesion.startTransaction({
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority' }
    })
    return seesion
  }
}

const mongo = new Mongo()
export default mongo
