const vm = require('vm')

const request = require('request')

const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const uuid = require('node-uuid')

app.use(bodyParser.json())

app.post(`/${process.env.SECRET_PATH}`, (req, res) => {
  if (req.body.inline_query) {
    let code = req.body.inline_query.query

    let results = []

    try {
      let script = new vm.Script(code)
      let sandbox = {
        print: function (data) {
          results.push({
            type: 'document',
            id: uuid.v1(),
            title: 'Result',
            input_message_content: {
              message_text: data,
              disable_web_page_preview: true
            }
          })
        }
      }
      script.runInNewContext(sandbox)
    } catch (e) {}

    request({
      url: `https://api.telegram.org/bot${process.env.BOT_TOKEN}/answerInlineQuery`,
      method: 'POST',
      json: true,
      body: {
        inline_query_id: req.body.inline_query.id,
        results: JSON.stringify(results)
      }
    }, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        console.log(body)
      }
    })
  } else {

  }

  res.end()
})

if (!process.env.PORT) process.env.PORT = 3000
app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`)
  console.log(`The access path to bot is ${process.env.SECRET_PATH}`)
})
