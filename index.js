const Telegraf = require('telegraf')
const Telegram = require('telegraf/telegram')
const https = require('https')

const speech = require('@google-cloud/speech');
const fs = require('fs');
const client = new speech.SpeechClient();



require('dotenv').config()

const bot = new Telegraf(process.env.API_KEY)
const telegram = new Telegram(process.env.API_KEY)

const getFile = async (fileId) => {
  let url = await telegram.getFileLink(fileId)
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      res.pipe(client
        .streamingRecognize(request)
        .on('error', err => reject)
        .on('data', data => {
            resolve(data.results[0].alternatives[0].transcript)
        })
      )
      setTimeout(() => {
        reject("timeout")
      }, 5000);
    })
  })
}

const request = {
  config: {
    encoding: 'OGG_OPUS',
    sampleRateHertz: 48000,
    languageCode: 'tr_TR',
  },
  interimResults: false
}


bot.on('voice', async (ctx) => {
  let file
  try {
    file = await getFile(ctx.message.voice.file_id)
    ctx.reply(file)
  } catch (error) {
    console.log(error)
  }

  
})

bot.launch()


