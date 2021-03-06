const vm = require('vm')

const request = require('request')

const cache = new (require('node-cache'))()

const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const uuid = require('node-uuid')

app.use(bodyParser.json())

app.post(`/${process.env.SECRET_PATH}`, (req, res) => {
  if (req.body.inline_query) {
    // Get the code from the query
    let code = req.body.inline_query.query

    // Prints used in code
    let prints = []

    // Check if a context exists for the user making the request
    let userId = req.body.inline_query.from.id
    const cacheContext = cache.get(userId)

    const sandbox = {
      print: function (data) {
        prints.push(data)
      },
      println: function (data) {
        prints.push(data)
        prints.push('\n')
      }
    }

    var context
    if (!cacheContext) {
      // No previous context, create a new one
      context = new vm.createContext(sandbox)
      if (process.env.MODE === 'debug') console.log(`New context: ${Object.keys(context)}`)
    } else {
      // Load previous context
      cacheContext.print = sandbox.print
      cacheContext.println = sandbox.println
      context = new vm.createContext(cacheContext)
      cache.set(userId, context, parseInt(process.env.CONTEXT_TTL))
      if (process.env.MODE === 'debug') console.log(`Existing context: ${Object.keys(context)}`)
    }

    var scriptError = false
    try {
      // Create a script to be executed
      let script = new vm.Script(code)
      // Execute the script in the context
      script.runInContext(context)

      // Store the context
      cache.set(userId, context, parseInt(process.env.CONTEXT_TTL))
    } catch (e) {
      scriptError = true
    }

    // Results is used to send the request to answerInlineQuery
    let results = [{
      type: 'article',
      id: uuid.v1(),
      title: code,
      input_message_content: {
        message_text: `${code}\n\nResult:\n${prints.join('')}`,
        disable_web_page_preview: true
      }
    }]

    request({
      url: `https://api.telegram.org/bot${process.env.BOT_TOKEN}/answerInlineQuery`,
      method: 'POST',
      json: true,
      body: {
        inline_query_id: req.body.inline_query.id,
        results: !scriptError ? JSON.stringify(results) : '[]',
        cache_time: 0
      }
    }, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        console.log(body)
      } else {
        console.log(error, response.statusCode)
      }
    })
  }

  res.end()
})

if (!process.env.PORT) process.env.PORT = 3000
app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`)
  console.log(`The access path to bot is ${process.env.SECRET_PATH}`)
})
