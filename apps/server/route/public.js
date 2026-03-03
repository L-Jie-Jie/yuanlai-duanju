import md5 from 'md5'
import moment from 'moment/moment.js'
import mongo from '#@/lib/mongo.js'
import { success, fail, jwtoken } from '#@/lib/response.js'
import util from '#@/lib/util.js'
import config from '#@/config/index.js'
import { readFile } from 'fs/promises'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import S3 from 'aws-sdk/clients/s3.js'
import fs from 'fs'
import path from 'path'
import dayjs from 'dayjs'
import mime from 'mime-types'
import { createHash } from 'crypto'
import ffmpeg from 'fluent-ffmpeg'

let bucketEnsured = false

const ensureS3Config = () => {
  const required = ['endpoint', 'key', 'secret', 'bucket', 'site']
  const missing = required.filter((k) => !config?.s3?.[k])
  if (missing.length > 0) {
    throw new Error(`S3 config missing: ${missing.join(', ')}`)
  }
}

const getPublicReadPolicy = (bucket) =>
  JSON.stringify({
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'PublicReadGetObject',
        Effect: 'Allow',
        Principal: '*',
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${bucket}/*`]
      }
    ]
  })

const ensureBucket = async (s3) => {
  if (bucketEnsured) return
  const Bucket = config.s3.bucket
  let exists = false
  try {
    await s3.headBucket({ Bucket }).promise()
    exists = true
  } catch (error) {
    if (error.code !== 'NotFound' && error.code !== 'NoSuchBucket') {
      throw error
    }
  }

  if (!exists) {
    await s3.createBucket({ Bucket }).promise()
  }
  await s3
    .putBucketPolicy({
      Bucket,
      Policy: getPublicReadPolicy(Bucket)
    })
    .promise()
  bucketEnsured = true
}

const uploadS3 = async (filepath, filename) => {
  ensureS3Config()
  const s3 = new S3({
    endpoint: config.s3.endpoint,
    accessKeyId: config.s3.key,
    secretAccessKey: config.s3.secret,
    signatureVersion: 'v4',
    s3ForcePathStyle: true
  })
  await ensureBucket(s3)
  const uploadParams = { Bucket: config.s3.bucket, Key: filename }
  let url = ''
  try {
    await s3.headObject(uploadParams).promise()
    url = config.s3.site + filename
  } catch (error) {
    const fileStream = fs.createReadStream(filepath)
    fileStream.on('error', function (err) {
      console.log('File Error', err)
    })
    uploadParams.Body = fileStream

    const stored = await s3.upload(uploadParams).promise()
    const objectKey = stored.Key || stored.key || filename
    url = config.s3.site + objectKey
  }
  return url
}

const createAndUploadVideoCover = async (videoPath, screenshotDir, hash, filename) => {
  return new Promise((resolve) => {
    ffmpeg(videoPath)
      .on('end', async function () {
        const screenshotfile = path.join(screenshotDir, `${hash}.png`)
        try {
          await uploadS3(screenshotfile, filename + '.png')
        } catch (error) {
          console.log('upload video cover failed:', error.message)
        } finally {
          if (fs.existsSync(screenshotfile)) {
            fs.unlinkSync(screenshotfile)
          }
          resolve()
        }
      })
      .on('error', function (error) {
        // ffmpeg not installed or runtime failed; keep main video upload available.
        console.log('generate video cover failed:', error.message)
        resolve()
      })
      .screenshots({
        timestamps: [0],
        filename: `${hash}.png`,
        folder: screenshotDir
      })
  })
}

const normalizeMediaValue = (value) => {
  const list = Array.isArray(value) ? value : [value]
  return list
    .filter(Boolean)
    .map((item) => String(item).trim())
    .filter(Boolean)
    .map((item) => {
      if (/^https?:\/\//i.test(item)) return item
      if (item.startsWith('/')) return item
      if (config?.s3?.site) return `${config.s3.site}${item}`
      return item
    })
}

const normalizeEpisodeMedia = (episode) => {
  return {
    ...episode,
    video: normalizeMediaValue(episode?.video),
    cover: normalizeMediaValue(episode?.cover)
  }
}
export default {
  async index(ctx) {
    success(ctx, {
      name: process.env.npm_package_name,
      version: process.env.npm_package_version
    })
  },
  // 上传文件：头像、视频等
  async upload(ctx) {
    try {
      const start = new Date().getTime()
      const exts = ['jpg', 'jpge', 'jpeg', 'png', 'webp', 'mp4']
      const { filepath, mimetype } = ctx.request.files.file
      const fileExtension = mime.extension(mimetype)
      if (!exts.includes(fileExtension)) {
        fail(ctx, '文件类型错误')
        return
      }
      console.log(filepath, fileExtension)
      // 计算文件的 md5
      const buff = fs.readFileSync(filepath)
      const hash = createHash('md5').update(buff).digest('hex')

      let url = ''

      if (fileExtension == 'mp4') {
        // 视频上传（已禁用自动生成封面功能，避免 ffmpeg 依赖）
        const filename = `video/${dayjs().format(
          'YYYYMMDD'
        )}/${hash}.${fileExtension}`
        
        // 注释掉自动生成封面功能，避免 ffmpeg 依赖问题
        // const screenshotDir = path.join(process.cwd(), 'screenshots')
        // fs.mkdirSync(screenshotDir, { recursive: true })
        // void createAndUploadVideoCover(filepath, screenshotDir, hash, filename)
        
        url = await uploadS3(filepath, filename)
      } else {
        // 头像或者图片上传
        const filename = `avatar/${dayjs().format(
          'YYYYMMDD'
        )}/${hash}.${fileExtension}`
        url = await uploadS3(filepath, filename)
      }
      success(ctx, {
        url,
        key: hash
      })
    } catch (error) {
      console.log(error)
      fail(ctx, error.message)
    }
  },
  // 注册匿名用户
  async anonymous(ctx) {
    try {
      const username = 'Visitor' + util.randomString(4, 3)
      const password = 'iloveshorttv'
      const passwordHash = md5(password + config.jwt.saltkey)
      const document = {
        username,
        password: passwordHash,
        avatar: '/static/avatar.jpg',
        pass: true,
        guestname: username,
        guest: true,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime()
      }
      const ret = await mongo.col('user').insertOne(document)
      const data = {
        token: jwt.sign({ _id: ret.insertedId, username }, config.jwt.secret, {
          expiresIn: '365d'
        }),
        user: document
      }

      success(ctx, data)
    } catch (err) {
      console.log(err.message)
      fail(ctx, 'Server error')
    }
  },
  // 用户注册
  async register(ctx) {
    try {
      const { username, password, repassword, mobile, _id } = ctx.request.body

      const user = await mongo.col('user').findOne({ username })

      if (user && user.username === username) {
        fail(ctx, 'The username already exists')
        return
      }
      if (password != repassword) {
        fail(ctx, 'Password and repassword are not the same')
        return
      }

      const passwordHash = md5(password + config.jwt.saltkey)
      const document = {
        username,
        password: passwordHash,
        avatar: '/static/avatar.jpg',
        guest: false,
        pass: true,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime()
      }
      const ret = await mongo
        .col('user')
        .updateOne(
          { _id: new ObjectId(_id) },
          { $set: document },
          { upsert: true }
        )

      const userid = ret.upsertedId || _id
      document['_id'] = userid

      jwtoken(ctx, document)
    } catch (err) {
      console.log(err.message)
      fail(ctx, 'Server error')
    }
  },

  // 用户登录
  async login(ctx) {
    try {
      const { username, password } = ctx.request.body
      
      // 支持用户名或手机号登录
      const res = await mongo.col('user').findOne({ 
        $or: [
          { username, pass: true },
          { phone: username, pass: true }
        ]
      })

      if (!res) {
        fail(ctx, 'The user does not exist')
        return
      }
      if (res.password !== md5(password + config.jwt.saltkey)) {
        fail(ctx, 'Wrong password')
        return
      }
      delete res.password

      jwtoken(ctx, res)
    } catch (e) {
      console.log(e)
      fail(ctx, 'Server error')
    }
  },
  
  async home(ctx) {
    // 辅助函数：为短剧列表添加集数统计
    const enrichSeriesWithEpisodeCount = async (seriesList) => {
      const enriched = []
      for (const series of seriesList) {
        const episodeCount = await mongo.col('episode').countDocuments({
          series: series._id.toString(),
          pass: true
        })
        enriched.push({
          ...series,
          episodeCount: episodeCount || 0
        })
      }
      return enriched
    }

    // 获取轮播图推荐的短剧（showInBanner为true且pass为true）
    const bannerRaw = await mongo
      .col('series')
      .find({
        showInBanner: true,
        pass: true
      })
      .sort({ updatedAt: -1 })
      .limit(5)
      .toArray()
    const banner = await enrichSeriesWithEpisodeCount(bannerRaw)

    // 如果没有设置轮播图，则使用推荐的短剧
    const recommendRaw = banner.length > 0 ? bannerRaw : await mongo
      .col('series')
      .find({
        pass: true
      })
      .sort({ updatedAt: -1 })
      .limit(10)
      .toArray()
    const recommend = await enrichSeriesWithEpisodeCount(recommendRaw)

    const category = await mongo
      .col('category')
      .find({
        pass: true
      })
      .sort({ order: 1 })
      .toArray()
    const categorys = []
    for (const cat of category) {
      const seriesRaw = await mongo
        .col('series')
        .find({
          category: cat._id.toString(),
          pass: true
        })
        .sort({ updatedAt: -1 })
        .limit(10)
        .toArray()
      if (seriesRaw.length > 0) {
        const seriesWithCount = await enrichSeriesWithEpisodeCount(seriesRaw)
        categorys.push({
          _id: cat._id,
          name: cat.name,
          series: seriesWithCount
        })
      }
    }

    const releaseRaw = await mongo
      .col('series')
      .find({
        pass: true
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray()
    const release = await enrichSeriesWithEpisodeCount(releaseRaw)
    
    const data = { recommend, categorys, release, banner }
    success(ctx, data)
  },

  // 随机短视频
  async short(ctx) {
    const episodes = await mongo
      .col('episode')
      .aggregate([
        {
          $match: {
            'video.0': { $exists: true },
            'cover.0': { $exists: true }
          }
        },
        {
          $limit: 10
        },
        {
          $lookup: {
            from: 'like',
            localField: 'series',
            foreignField: 'series',
            as: 'likeList',
            pipeline: [
              { $match: { user: { $eq: '65731d824b4efadf4b82a93d' } } }
            ]
          }
        },
        {
          $addFields: {
            isLike: { $toBool: { $size: '$likeList' } }
          }
        },
        {
          $project: {
            likeList: 0
          }
        }
      ])
      .toArray()

    try {
      success(
        ctx,
        episodes.map((episode) => normalizeEpisodeMedia(episode))
      )
    } catch (error) {
      fail(ctx, 'Server error')
    }
  },
  // 获取某一个剧集的所有信息
  async series(ctx) {
    const { id } = ctx.request.body

    const episodes = await mongo
      .col('episode')
      .find({
        series: id
      })
      .sort({ episode: 1 })
      .toArray()

    try {
      success(
        ctx,
        episodes.map((episode) => normalizeEpisodeMedia(episode))
      )
    } catch (error) {
      fail(ctx, 'Server error')
    }
  },
  
  // 搜索短剧
  async search(ctx) {
    try {
      const { keyword } = ctx.request.body
      
      if (!keyword || keyword.trim() === '') {
        success(ctx, [])
        return
      }

      const searchRegex = new RegExp(keyword.trim(), 'i')
      
      const results = await mongo
        .col('series')
        .find({
          $or: [
            { name: searchRegex },
            { title: searchRegex },
            { description: searchRegex },
            { msg: searchRegex }
          ],
          pass: true
        })
        .limit(20)
        .toArray()

      success(ctx, results)
    } catch (error) {
      console.log('Search error:', error)
      fail(ctx, 'Server error')
    }
  }
}
