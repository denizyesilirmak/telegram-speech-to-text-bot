const Telegraf = require('telegraf')
const extra = require('telegraf/extra')
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
    https.get(url, async res => {
      const chunks = []
      res.on('data', (d) => {
        chunks.push(d)
      })
      res.on('end', async () => {
        const file = Buffer.concat(chunks)
        const transcription = await transcribe(file)
        resolve(transcription)
      })
    }).on('error', (e) => {
      reject('http get error')
    })
  })
}

const transcribe = async (file) => {
  const audioBytes = file.toString('base64');

  const audio = {
    content: audioBytes,
  }
  const config = {
    encoding: 'OGG_OPUS',
    sampleRateHertz: 16000,
    languageCode: 'tr-TR'
  }
  const request = {
    audio: audio,
    config: config
  }

  const [ results ] = await client.recognize(request)

  return results.results
    .map(result => result.alternatives[0].transcript)
    .join('\n')
}

bot.on('voice', async (ctx) => {
  let file
  try {
    file = await getFile(ctx.message.voice.file_id)
    ctx.reply(file, extra.inReplyTo(ctx.message.message_id))
  } catch (error) {
    console.log(error)
  }
})

bot.startPolling()