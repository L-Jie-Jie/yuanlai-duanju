import Koa from 'koa'
import jwt from 'koa-jwt'
import cors from '@koa/cors'
import bodyParser from 'koa-bodyparser'
import logger from 'koa-logger'
import { koaBody } from 'koa-body'

import config from './config/index.js'
import mongo from './lib/mongo.js'
import router from './route/index.js'

const app = new Koa()

app.use(cors())
app.use(
  koaBody({
    multipart: true,
    formidable: {
      maxFileSize: 1000 * 1024 * 1024,
      keepExtensions: true
    },
    jsonLimit: '10mb',
    formLimit: '10mb',
    textLimit: '10mb'
  })
)
app.use(bodyParser())
app.use(logger())

app.use(
  jwt({ secret: config.jwt.secret, debug: true }).unless({
    path: [
      '/api/admin/auth/signin',
      '/api/admin/auth/init',
      /\/api\/public\/*/,
      /\/api\/oauth\/*/
    ]
  })
)

app.use(router.middleware())

console.log('Current env:', process.env.PLATFORM)
await mongo.init()

app.listen(config.app.port, () => {
  console.log('The server is running at http://localhost:' + config.app.port)
})

if (process.env.PLATFORM !== 'DEV') {
  process.send && process.send('ready')
  process.on('SIGINT', async function () {
    try {
      console.log('Stopping Koa server...')
      await mongo.close()
      process.exit(0)
    } catch (error) {
      process.exit(1)
    }
  })
}
