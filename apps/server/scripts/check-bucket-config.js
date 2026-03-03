import S3 from 'aws-sdk/clients/s3.js'
import config from '../config/index.js'

async function checkBucketLifecycle() {
  try {
    const s3 = new S3({
      endpoint: config.s3.endpoint,
      accessKeyId: config.s3.key,
      secretAccessKey: config.s3.secret,
      signatureVersion: 'v4',
      s3ForcePathStyle: true
    })
    
    console.log('检查MinIO桶的生命周期策略...\n')
    
    try {
      const lifecycle = await s3.getBucketLifecycleConfiguration({
        Bucket: config.s3.bucket
      }).promise()
      
      console.log('发现生命周期策略：')
      console.log(JSON.stringify(lifecycle, null, 2))
    } catch (error) {
      if (error.code === 'NoSuchLifecycleConfiguration') {
        console.log('✅ 没有配置生命周期策略（文件不会自动删除）')
      } else {
        console.log('检查生命周期策略时出错：', error.message)
      }
    }
    
    console.log('\n检查桶的版本控制...\n')
    try {
      const versioning = await s3.getBucketVersioning({
        Bucket: config.s3.bucket
      }).promise()
      
      console.log('版本控制状态：', versioning.Status || '未启用')
    } catch (error) {
      console.log('检查版本控制时出错：', error.message)
    }
    
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

checkBucketLifecycle()

