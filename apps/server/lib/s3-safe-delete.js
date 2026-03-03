import S3 from 'aws-sdk/clients/s3.js'
import config from '#@/config/index.js'
import mongo from '#@/lib/mongo.js'

/**
 * 删除S3文件的安全函数
 * 只有在数据库中没有任何记录引用该文件时才删除
 */
export async function safeDeleteS3File(fileKey) {
  try {
    await mongo.init()
    
    // 构建完整URL
    const fullUrl = `${config.s3.site}${fileKey}`
    
    // 检查是否有episode引用此文件
    const episodeCount = await mongo.col('episode').countDocuments({
      $or: [
        { video: fullUrl },
        { video: { $in: [fullUrl] } },
        { cover: fullUrl },
        { cover: { $in: [fullUrl] } }
      ]
    })
    
    if (episodeCount > 0) {
      console.log(`⚠️  文件 ${fileKey} 仍被 ${episodeCount} 个分集引用，拒绝删除`)
      return { success: false, reason: 'file_in_use', count: episodeCount }
    }
    
    // 检查是否有series引用此文件
    const seriesCount = await mongo.col('series').countDocuments({
      $or: [
        { cover: fullUrl },
        { cover: { $in: [fullUrl] } }
      ]
    })
    
    if (seriesCount > 0) {
      console.log(`⚠️  文件 ${fileKey} 仍被 ${seriesCount} 个短剧引用，拒绝删除`)
      return { success: false, reason: 'file_in_use', count: seriesCount }
    }
    
    // 安全删除
    const s3 = new S3({
      endpoint: config.s3.endpoint,
      accessKeyId: config.s3.key,
      secretAccessKey: config.s3.secret,
      signatureVersion: 'v4',
      s3ForcePathStyle: true
    })
    
    await s3.deleteObject({
      Bucket: config.s3.bucket,
      Key: fileKey
    }).promise()
    
    console.log(`✅ 成功删除文件 ${fileKey}`)
    return { success: true }
    
  } catch (error) {
    console.error(`❌ 删除文件 ${fileKey} 失败:`, error.message)
    return { success: false, reason: 'error', error: error.message }
  }
}

/**
 * 批量删除S3文件（带保护）
 */
export async function safeDeleteS3Files(fileKeys) {
  const results = []
  for (const key of fileKeys) {
    const result = await safeDeleteS3File(key)
    results.push({ key, ...result })
  }
  return results
}

/**
 * 清理孤立文件（数据库中没有引用的文件）
 */
export async function cleanOrphanFiles(dryRun = true) {
  try {
    await mongo.init()
    
    const s3 = new S3({
      endpoint: config.s3.endpoint,
      accessKeyId: config.s3.key,
      secretAccessKey: config.s3.secret,
      signatureVersion: 'v4',
      s3ForcePathStyle: true
    })
    
    // 获取所有视频文件
    const s3Files = await s3.listObjectsV2({
      Bucket: config.s3.bucket,
      Prefix: 'video/'
    }).promise()
    
    const orphanFiles = []
    
    for (const file of s3Files.Contents || []) {
      if (!file.Key.endsWith('.mp4')) continue
      
      const fullUrl = `${config.s3.site}${file.Key}`
      
      // 检查是否被引用
      const refCount = await mongo.col('episode').countDocuments({
        $or: [
          { video: fullUrl },
          { video: { $in: [fullUrl] } }
        ]
      })
      
      if (refCount === 0) {
        orphanFiles.push(file.Key)
      }
    }
    
    console.log(`\n发现 ${orphanFiles.length} 个孤立文件：`)
    orphanFiles.forEach(key => console.log(`  - ${key}`))
    
    if (dryRun) {
      console.log('\n这是预览模式，没有实际删除文件')
      console.log('如需删除，请运行: node scripts/clean-orphan-files.js --delete')
    } else {
      console.log('\n开始删除孤立文件...')
      for (const key of orphanFiles) {
        await s3.deleteObject({
          Bucket: config.s3.bucket,
          Key: key
        }).promise()
        console.log(`✅ 已删除 ${key}`)
      }
    }
    
    await mongo.close()
    return orphanFiles
    
  } catch (error) {
    console.error('清理孤立文件失败:', error)
    throw error
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const shouldDelete = process.argv.includes('--delete')
  cleanOrphanFiles(!shouldDelete)
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err)
      process.exit(1)
    })
}

