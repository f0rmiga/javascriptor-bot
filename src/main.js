const vm = require('vm')
const util = require('util')

const express = require('express')
const app = express()
const bodyParser = require('body-parser')

app.use(bodyParser.json())

app.post('/eval', (req, res) => {
  console.log(req.body)

  let script = new vm.Script('print(20 + 30)')

  let sandbox = {
    print: function (data) {
      // res.write(data)
    }
  }
  script.runInNewContext(sandbox)

  res.end()
})

if (!process.env.PORT) process.env.PORT = 3000
app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`)
})
