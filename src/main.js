const vm = require('vm')

const request = require('request')

const express = require('express')
const app = express()
const bodyParser = require('body-parser')

app.use(bodyParser.json())

app.post(`/${process.env.SECRET_PATH}`, (req, res) => {
  if (req.body.inline_query) {
    // let code = req.body.message.text
		//
    // let script = new vm.Script(code)
		//
    // let sandbox = {
    //   print: function (data) {
    //     res.write(data)
    //   }
    // }
    // script.runInNewContext(sandbox)

    request({
      url: `https://api.telegram.org/bot${process.env.BOT_TOKEN}/answerInlineQuery`,
      method: 'POST',
      json: true,
      body: {
        inline_query_id: req.body.inline_query.id,
        results: '[]'
      }
    }, function (error, response, body) {
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
