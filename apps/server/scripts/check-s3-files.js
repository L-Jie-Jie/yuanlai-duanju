import S3 from 'aws-sdk/clients/s3.js'
import config from '../config/index.js'
import mongo from '../lib/mongo.js'

async function checkS3Files() {
  try {
    await mongo.init()
    
    // 初始化S3客户端
    const s3 = new S3({
      endpoint: config.s3.endpoint,
      accessKeyId: config.s3.key,
      secretAccessKey: config.s3.secret,
      signatureVersion: 'v4',
      s3ForcePathStyle: true
    })
    
    console.log('正在检查MinIO桶中的文件...\n')
    
    // 列出桶中的所有文件
    const params = {
      Bucket: config.s3.bucket,
      Prefix: 'video/'
    }
    
    const s3Files = await s3.listObjectsV2(params).promise()
    
    console.log(`MinIO桶中共有 ${s3Files.Contents?.length || 0} 个视频文件：`)
    if (s3Files.Contents) {
      s3Files.Contents.forEach((file, index) => {
        console.log(`${index + 1}. ${file.Key} (大小: ${(file.Size / 1024 / 1024).toFixed(2)} MB)`)
      })
    }
    
    console.log('\n正在检查数据库中的视频记录...\n')
    
    // 获取数据库中的所有episode
    const episodes = await mongo.col('episode').find({}).toArray()
    
    console.log(`数据库中共有 ${episodes.length} 个分集记录：`)
    episodes.forEach((ep, index) => {
      console.log(`${index + 1}. Episode ${ep.episode} - Series: ${ep.series}`)
      console.log(`   视频URL: ${Array.isArray(ep.video) ? ep.video[0] : ep.video}`)
    })
    
    // 检查不匹配的情况
    console.log('\n\n=== 分析结果 ===')
    
    const s3VideoKeys = new Set(s3Files.Contents?.map(f => f.Key) || [])
    const dbVideoUrls = episodes.map(ep => {
      const url = Array.isArray(ep.video) ? ep.video[0] : ep.video
      if (url && url.includes('/fastshort/')) {
        return url.split('/fastshort/')[1]
      }
      return null
    }).filter(Boolean)
    
    console.log('\n数据库中引用但MinIO中不存在的文件：')
    let missingCount = 0
    dbVideoUrls.forEach(url => {
      if (!s3VideoKeys.has(url)) {
        console.log(`  ❌ ${url}`)
        missingCount++
      }
    })
    if (missingCount === 0) {
      console.log('  ✅ 所有数据库引用的文件都存在')
    }
    
    console.log('\nMinIO中存在但数据库未引用的文件：')
    let orphanCount = 0
    s3VideoKeys.forEach(key => {
      if (!dbVideoUrls.includes(key) && key.endsWith('.mp4')) {
        console.log(`  ⚠️  ${key}`)
        orphanCount++
      }
    })
    if (orphanCount === 0) {
      console.log('  ✅ 没有孤立文件')
    }
    
    await mongo.close()
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

checkS3Files()

