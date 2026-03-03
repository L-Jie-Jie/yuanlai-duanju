import KoaJoiRouter from '@koa-better-modules/joi-router'
import fs from 'fs'

const Joi = KoaJoiRouter.Joi

const mergeValidate = (model, action, fn, json, root) => {
  let method = 'get'
  let path = `${root}/${model}`

  switch (action) {
    case 'index':
      method = 'get'
      break
    case 'get':
      method = 'get'
      path = `${path}/:id`
      break
    case 'update':
      method = 'put'
      path = `${path}/:id`
      break
    case 'delete':
      method = 'delete'
      path = `${path}/:id`
      break
    case 'create':
      method = 'post'
      break
    default:
      if (action.indexOf('get') !== 0) {
        method = 'post'
      }
      path = `${path}/${action}`
      break
  }

  let validate = {
    validateOptions: {
      allowUnknown: true
    },
    output: {
      200: {
        body: {
          code: Joi.number().required(),
          message: Joi.string().allow(''),
          data: [Joi.object(), Joi.array()]
        }
      }
    }
  }

  if (json) {
    validate = Object.assign(validate, json)
  }

  const logs = {
    function: `${model}.${action}`,
    uri: `/api${path}`,
    method: method.toUpperCase(),
    check: !!json
  }

  return {
    method,
    path,
    validate,
    handler: fn,
    logs
  }
}

export default async (modules, path = '') => {
  const res = []
  let check = {}

  try {
    const checkFile = './check.js'
    if (fs.existsSync(checkFile)) {
      check = (await import(checkFile)).default
    }
  } catch (error) {
    console.error('Load check config failed:', path)
  }

  for (const name of modules) {
    try {
      const module = (await import(`.${path}/${name}.js`)).default
      const logs = []

      for (const key in module) {
        if (Object.hasOwnProperty.call(module, key)) {
          const route = mergeValidate(
            name,
            key,
            module[key],
            check[`${name}/${key}`],
            path
          )
          logs.push(route.logs)
          res.push(route)
        }
      }

      console.table(logs)
      console.log('Module loaded:', path, name)
    } catch (error) {
      console.error('Module load failed:', path, name, error.message)
    }
  }

  return res
}
