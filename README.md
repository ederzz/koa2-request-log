# koa2-request-log
a koa middleware for logging requests.

## Install
```console
$ npm install koa2-request-log --save
```

## Usage
Typescript:
```Typescript
import * as Koa from 'koa'
import logger from 'koa2-request-log'

const app = new Koa()

app.use(logger()) // default setting
app.use(logger({
    logColor: '#000',
    dateFormat: 'YYYY-MM-DD',
    stream: process.stdout, // log at console or you can write to a file
    skip(req, res) {
        return res.status >= 400
    }
})) // could use multiple logger

app.listen(3000, () => {
    console.log('app start')
})
```
Javascript:
```Javascript
const Koa = require('koa')
const logger = require('koa2-request-log').default

const app = new Koa()

app.use(logger())

app.listen(3000, () => {
    console.log('app start')
})
```

## Options param
### logColor
Define the log color when you output the log to the console via the hex string(`eg.#000`) or chalk wrapper(`chalk.rgb(0, 0, 0)`).

### dateFormat
Define the request time format using [momentjs's format](https://momentjs.com/docs/#/parsing/string-format/).

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