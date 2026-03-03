const config = {
  port: 3000,
  app: {
    port: 3000,
    host: 'http://123.57.107.35:3000'
  },
  jwt: {
    secret: 'yuanlai-jwt-secret-2024-please-change-me',
    saltkey: 'yuanlai-salt-key-2024-please-change-me'
  },
  mongodb: {
    host: 'mongodb://root:MongoDByl%40123@localhost:27017',
    db: 'shorttv'
  },
  s3: {
    accountid: '',
    key: 'minioyl',
    secret: 'minioyl@123',
    bucket: 'yuanlaivideo',
    endpoint: 'http://localhost:9000',
    token: '',
    site: 'http://123.57.107.35:9000/yuanlaivideo/'
  },
  mp: {
    appId: '',
    appSecret: ''
  },
  redis: {
    url: 'redis://127.0.0.1:6379'
  }
}

export default config
