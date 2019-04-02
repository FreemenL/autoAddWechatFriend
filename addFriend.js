const Wechat = require('wechat4u')
const qrcode = require('qrcode-terminal')
const fs = require('fs')
let { join } = require('path')
const schedule = require('node-schedule')
const moment = require('moment')
require('bluebird').promisifyAll(fs)
const bot = new Wechat()
bot.start()
bot.on('uuid', uuid => qrcode.generate('https://login.weixin.qq.com/l/' + uuid, { small: true }))
bot.on('login', async () => {
  try {
    let roomName = ''
    for (const key in bot.contacts) {
      if (bot.contacts[key].NickName.indexOf('互助，撸毛群') > -1) roomName = bot.contacts[key].UserName
    }
    bot.batchGetContact([{ UserName: roomName }]).then(res => {
      res[0].MemberList.forEach(user => {
        if (/[潇禹]|[七七]/.test(user.NickName)) {
          console.log(user)
          console.log(`开始加好友:${user.NickName}`)
          console.log(user.UserName)
          bot.addFriend(user.UserName, '哈喽呀').then(res => {
            console.log('这是加好友函数的then')
            console.log(res)
          })
          console.log('加好友函数跑完')
        }
      })
      fs.writeFile('test.json', JSON.stringify(res), (err) => {
        if (err) throw err
        console.log('test write OK!')
      })
    })
  } catch (err) {
    console.log(err)
  }
  bot.getContact().then(res => {
    fs.writeFile('contact.json', JSON.stringify(res), (err) => {
      if (err) throw err
      console.log('contact write OK!')
    })
  })
})
