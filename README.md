# koa2-request-log
A koa middleware for logging http requests.

## Install
```console
$ npm install koa2-request-log --save
```

## Usage
Typescript:
```Typescript
import * as Koa from 'koa'
import Logger from 'koa2-request-log'

const app = new Koa()
const logger = (new Logger()).generate() // default setting
const loggerWithOpts = (new Logger()).generate({
    logColor: '#000',
    stream: process.stdout, // log at console or you can write to a file
    logFmt: ':method :path :status',
    skip(req, res) {
        return res.status >= 400
    }
})

app.use(logger) 
app.use(loggerWithOpts) // could use multiple logger

app.listen(3000, () => {
    console.log('app start')
})
```
Javascript:
```Javascript
const Koa = require('koa')
const Logger = require('koa2-request-log').default

const app = new Koa()
const logger = (new Logger()).generate() 
const loggerWithOpts = (new Logger()).generate({
    logColor: '#000',
    stream: process.stdout,
    logFmt: ':method :path :status',
    skip(req, res) {
        return res.status >= 400
    }
})
app.use(logger)
app.use(loggerWithOpts)

app.listen(3000, () => {
    console.log('app start')
})
```

## Options param
### logColor
Define the log color when you output the log to the console via the hex string(`eg.#000`) or chalk wrapper(`chalk.rgb(0, 0, 0)`).

### stream
Using `node stream` to define the log output location.e.g.`process.stdout`.
Output the log to a file:
```Javascript
const fs = require('fs')
const stream = fs.createWriteStream(path.join(__dirname, 'log/app.log'), {
    flags: 'a'
})

app.use(logger({
    stream
}))
```

### skip
Function to determine if log is skipped,defaults to false.The function could get the koa request object and koa response object as params: `skip(req, res)`.

### logFmt
You can customize the log output format.Like:`:method --> :path`,then the `:method` and `:path` will be replaced.

#### :protocol
The Http protocol of the request.

#### :http-version
The Http version of the request.

#### :method
The Http method of the request.

#### :path
The Http path of the request.

#### :status
The Http status of response.

#### :response-time
The Http response time of response.

#### :request-at
Request initiation time.

#### :req
Get Http request header.

#### :res
Get Http response header.