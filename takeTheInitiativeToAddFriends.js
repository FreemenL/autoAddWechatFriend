const { Wechaty } = require('wechaty')
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
    dataFilePath = `${join(__dirname, `./takeTheInitiativeToAddFriends/${loginUsername}.json`)}`
    fs.accessAsync(`./takeTheInitiativeToAddFriends`).then(res => {
      fs.readFileAsync(dataFilePath).catch(() => fs.writeFile(dataFilePath, '[]', e => console.log(e)))
    }).catch(() => {
      fs.mkdirAsync(`./takeTheInitiativeToAddFriends`).then(() => {
        fs.readFileAsync(dataFilePath).catch(() => fs.writeFile(dataFilePath, '[]', e => console.log(e)))
      })
    })
    fs.writeFile('loginUser.json', JSON.stringify(user), (err) => {
      if (err) throw err
      console.log('loginUser write OK!')
    })
    const room = await bot.Room.find({ topic: '红包分享专用' })
    room.memberAll({ name: '雪霁' }).then(res => {
      res[0].sync().then(res => {
        console.log(res)
      })
      if (res[0] && res[0].id) {
        console.log(1)
        try {
          bot.Friendship.add(res[0], 'hello').then(res => {
            console.log('添加成功')
          }).catch(console.log)
        } catch (err) {
          console.log(err)
        }
      }
    })
    // res.forEach(val => {
    //   if (val.payload.name.indexOf('喵喵') > -1) {
    //     try {
    //       bot.Friendship.add(val.payload, 'hello').then(res => {
    //         console.log('添加成功')
    //       }).catch(console.log)
    //     } catch (err) {
    //       console.log(err)
    //     }
    //   }
    // })
    fs.writeFile('room.json', JSON.stringify(room), (err) => {
      if (err) throw err
      console.log('loginUser write OK!')
    })
    // console.log(room.payload.memberIdList)
    // console.log(room.payload.memberIdList.length)
    // console.log(room.payload.memberIdList[0])
  }).on('message', async msg => {
    const contact = msg.from()
    const text = msg.text()
    const room = msg.room()
    if (room) {
      console.log(contact.friend())
      if (!contact.payload.friend) {
        try {
          bot.Friendship.add(contact, 'hello').then(res => {
            console.log('添加成功')
          }).catch(console.log)
        } catch (err) {
          console.log(err)
        }
      }
      console.log()
      // const topic = await room.topic()
      // console.log(`Room: ${topic} Contact: ${contact.name()} Text: ${text}`)
    }
  })
})()

