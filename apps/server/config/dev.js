const config = {
  port: Number(process.env.PORT || 3000),
  app: {
    port: Number(process.env.PORT || 3000),
    host: process.env.APP_HOST || 'http://localhost:3000'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev',
    saltkey: process.env.JWT_SALTKEY || process.env.JWT_SECRET || 'dev'
  },
  mongodb: {
    host: process.env.MONGODB_HOST || 'mongodb://localhost',
    db: process.env.MONGODB_DB || 'shorttv'
  },
  s3: {
    accountid: process.env.S3_ACCOUNTID || '',
    key: process.env.S3_KEY || 'minioadmin',
    secret: process.env.S3_SECRET || 'minioadmin',
    bucket: process.env.S3_BUCKET || 'fastshort',
    endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
    token: process.env.S3_TOKEN || '',
    site: process.env.S3_SITE || 'http://localhost:9000/fastshort/'
  },
  mp: {
    appId: process.env.MP_APP_ID || '',
    appSecret: process.env.MP_APP_SECRET || ''
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
  }
}

export default config
