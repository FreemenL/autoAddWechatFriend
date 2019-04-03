const { Wechaty, Room, Contact, MediaMessage, Friendship } = require('wechaty')
const qrcode = require('qrcode-terminal')
const fs = require('fs')
let { join } = require('path')
const schedule = require('node-schedule')
const moment = require('moment')
require('bluebird').promisifyAll(fs)
const bot = new Wechaty({ name: '安心' })
let loginUsername = ''
let dataFilePath = '';
(async () => {
  await bot.start()
  bot.on('scan', (url, code) => {
    const loginUrl = url.replace(/\/qrcode\//, '/l/')
    require('qrcode-terminal').generate(loginUrl)
  }).on('login', async user => {
    console.log('登录成功')
    loginUsername = user.payload.name
    dataFilePath = `${join(__dirname, `./passiveAddFriend/${loginUsername}.json`)}`
    fs.accessAsync(`./passiveAddFriend`).then(res => fs.readFileAsync(dataFilePath).catch(() => fs.writeFile(dataFilePath, '[]', e => console.log(e)))).catch(() => {
      fs.mkdirAsync(`./passiveAddFriend`)
    })
    fs.writeFile('loginUser.json', JSON.stringify(user), (err) => {
      if (err) throw err
      console.log('loginUser write OK!')
    })
  }).on('friendship', async friendship => {
    try {
      if (friendship.type() === Friendship.Type.Receive) {
        let date = moment().add('1', 'days').add('15', 'hours')
        schedule.scheduleJob(date, async () => {
          console.log('The world is going to end today.')
          let contact = friendship.contact()
          await friendship.accept()
          contact.addTime = moment().format('YYYY-MM-DD HH:mm:ss')
          let addFriendsArr = JSON.parse(await fs.readFileAsync(dataFilePath))
          addFriendsArr.push(contact)
          fs.writeFile(dataFilePath, JSON.stringify(addFriendsArr)).then(() => console.log('addFriendsArr write ok'))
        }, 600000)
        console.log(`-------------------------`)
        console.log(`添加人：${friendship.contact().name} 好友请求：${friendship.hello()} `)
        console.log(`请求时间：${moment().format('YYYY-MM-DD HH:mm:ss')}`)
        console.log(`预计添加时间：${moment().format('YYYY-MM-DD HH:mm:ss')}`)
        console.log(`-------------------------`)
      }
    } catch (err) {
      console.log('加好友的时候出错了')
    }
  })
})()

