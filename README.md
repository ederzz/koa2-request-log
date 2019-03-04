# koa2-request-log [![TypeScript](https://badges.frapsoft.com/typescript/love/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/) [![npm version](https://img.shields.io/badge/npm-v1.0.1-brightgreen.svg)](https://www.npmjs.com/package/koa2-request-log)
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
}) // log with some options

app.use(logger) 
app.use(loggerWithOpts) // could use multiple loggers

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
Define the log color via the hex string(`eg.#000`) or chalk wrapper(`chalk.rgb(0, 0, 0)`).

### stream
Using `node writable stream` to define the log output location.e.g.`process.stdout`.  
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
Customize the log output format.For example:`:method --> :path`.

## logFmt fields
#### :protocol
The protocol of the request.`e.g.http`.

#### :http-version
Http version of the request.`e.g.1.1`.

#### :method
Http method of the request.`e.g.GET`.

#### :path
Http path of the request.`e.g./user`.

#### :status
Http status of response.`e.g.200`.

#### :response-time
Http response time of response.`e.g.200ms`.

#### :request-at
Request initiation time.`e.g.Sat Feb 23 2019 11:57:30 GMT+0800`.

#### :req[header]
Get Http request header.e.g.`:req[host]` --> localhost:3002.

#### :res[header]
Get Http response header.e.g.`:res[content-length]` --> 4.