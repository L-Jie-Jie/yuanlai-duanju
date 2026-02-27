import KoaJoiRouter from '@koa-better-modules/joi-router'
import loadModule from './loadModule.js'

const router = new KoaJoiRouter()
router.prefix('/api')

const routersAdmin = await loadModule(
  ['auth', 'user', 'admin', 'comment', 'category', 'episode', 'series'],
  '/admin'
)
router.route(routersAdmin)

const routersApp = await loadModule(['init', 'user'], '/app')
router.route(routersApp)

const profilePublic = await loadModule(['profile'])
router.route(profilePublic)

const routersPublic = await loadModule(['public'])
router.route(routersPublic)

const oauthPublic = await loadModule(['oauth'])
router.route(oauthPublic)

export default router
