import mongo from '../lib/mongo.js'

async function checkEpisodes() {
  try {
    await mongo.init()
    
    const episodes = await mongo.col('episode').find({}).limit(3).toArray()
    
    console.log('Total episodes found:', episodes.length)
    console.log('\nSample episodes:')
    episodes.forEach((ep, index) => {
      console.log(`\nEpisode ${index + 1}:`)
      console.log('  _id:', ep._id)
      console.log('  title:', ep.title)
      console.log('  episode:', ep.episode)
      console.log('  video:', ep.video)
      console.log('  cover:', ep.cover)
      console.log('  series:', ep.series)
    })
    
    await mongo.close()
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

checkEpisodes()

