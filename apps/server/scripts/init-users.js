import mongo from '../lib/mongo.js'
import md5 from 'md5'
import config from '../config/index.js'

async function initUsers() {
  try {
    console.log('开始初始化用户数据...')
    
    // 初始化数据库连接
    await mongo.init()
    console.log('数据库连接成功')
    
    // 后台管理员数据
    const adminUsers = [
      {
        username: 'laizhiyuan',
        passwordstr: 'Lzy@1104',
        userrole: 'super',
        avatar: '/static/avatar.jpg',
        pass: true,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime()
      },
      {
        username: 'lijunjie',
        passwordstr: 'Ljj@0712',
        userrole: 'admin',
        avatar: '/static/avatar.jpg',
        pass: true,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime()
      },
      {
        username: 'User',
        passwordstr: 'User@123',
        userrole: 'user',
        avatar: '/static/avatar.jpg',
        pass: true,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime()
      }
    ]

    // 插入后台管理员
    for (const admin of adminUsers) {
      const exists = await mongo.col('admin').findOne({ username: admin.username })
      if (exists) {
        console.log(`管理员 ${admin.username} 已存在，跳过`)
        continue
      }
      
      const password = md5(admin.passwordstr + config.jwt.saltkey)
      delete admin.passwordstr
      admin.password = password
      
      await mongo.col('admin').insertOne(admin)
      console.log(`✓ 成功创建管理员: ${admin.username} (角色: ${admin.userrole})`)
    }

    // C端用户数据
    const appUser = {
      username: '18796279775',
      password: 'lijunjie2003',
      avatar: '/static/avatar.jpg',
      guest: false,
      pass: true,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime()
    }

    const existsUser = await mongo.col('user').findOne({ username: appUser.username })
    if (existsUser) {
      console.log(`C端用户 ${appUser.username} 已存在，跳过`)
    } else {
      const passwordHash = md5(appUser.password + config.jwt.saltkey)
      appUser.password = passwordHash
      
      await mongo.col('user').insertOne(appUser)
      console.log(`✓ 成功创建C端用户: ${appUser.username}`)
    }

    console.log('\n用户数据初始化完成！')
    console.log('\n后台管理员账号：')
    console.log('  超级管理员: laizhiyuan / Lzy@1104')
    console.log('  管理员: lijunjie / Ljj@0712')
    console.log('  普通用户: User / User@123')
    console.log('\nC端用户账号：')
    console.log('  18796279775 / lijunjie2003')
    
    await mongo.close()
    process.exit(0)
  } catch (error) {
    console.error('初始化用户失败:', error)
    await mongo.close()
    process.exit(1)
  }
}

initUsers()

