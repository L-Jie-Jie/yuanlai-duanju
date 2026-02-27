import mongo from '../lib/mongo.js'

async function showCurrentStatus() {
  try {
    await mongo.init()
    
    console.log('=== 当前数据库状态 ===\n')
    
    const episodes = await mongo.col('episode').find({}).sort({ episode: 1 }).toArray()
    
    console.log(`共有 ${episodes.length} 个分集：\n`)
    
    episodes.forEach((ep, index) => {
      console.log(`分集 ${ep.episode}:`)
      console.log(`  ID: ${ep._id}`)
      console.log(`  短剧ID: ${ep.series}`)
      console.log(`  视频URL: ${Array.isArray(ep.video) ? ep.video[0] : ep.video}`)
      console.log(`  封面URL: ${Array.isArray(ep.cover) ? ep.cover[0] : ep.cover}`)
      console.log('')
    })
    
    console.log('\n=== 建议操作 ===\n')
    console.log('由于所有分集都指向同一个视频文件，建议：')
    console.log('1. 在后台管理系统中，为每个分集重新上传对应的视频')
    console.log('2. 或者，如果这些分集确实应该使用同一个视频，则当前状态是正常的')
    console.log('\n访问后台管理系统：http://localhost:3000/admin')
    console.log('进入"分集管理"页面，编辑每个分集并上传正确的视频文件')
    
    await mongo.close()
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

showCurrentStatus()

