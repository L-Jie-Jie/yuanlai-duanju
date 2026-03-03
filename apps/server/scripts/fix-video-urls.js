import mongo from '../lib/mongo.js'

async function fixVideoUrls() {
  try {
    await mongo.init()
    
    console.log('开始修复视频URL...')
    
    // 修复episode集合中的视频URL
    const episodes = await mongo.col('episode').find({}).toArray()
    console.log(`找到 ${episodes.length} 个分集`)
    
    let updatedCount = 0
    for (const episode of episodes) {
      let needUpdate = false
      const updates = {}
      
      // 修复video字段
      if (Array.isArray(episode.video)) {
        const fixedVideo = episode.video.map(url => {
          if (typeof url === 'string' && url.includes('127.0.0.1')) {
            needUpdate = true
            return url.replace('127.0.0.1', 'localhost')
          }
          return url
        })
        if (needUpdate) {
          updates.video = fixedVideo
        }
      }
      
      // 修复cover字段
      if (Array.isArray(episode.cover)) {
        const fixedCover = episode.cover.map(url => {
          if (typeof url === 'string' && url.includes('127.0.0.1')) {
            needUpdate = true
            return url.replace('127.0.0.1', 'localhost')
          }
          return url
        })
        if (needUpdate) {
          updates.cover = fixedCover
        }
      }
      
      if (needUpdate) {
        await mongo.col('episode').updateOne(
          { _id: episode._id },
          { $set: updates }
        )
        updatedCount++
        console.log(`已更新分集 ${episode.episode} (${episode._id})`)
      }
    }
    
    console.log(`\n修复完成！共更新了 ${updatedCount} 个分集`)
    
    await mongo.close()
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

fixVideoUrls()

