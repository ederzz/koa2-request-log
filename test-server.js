const Koa = require('koa')
const router = require('koa-router')()
const Logger = require('./dist/index').default

router
.get('/normal', (ctx) => {
    ctx.body = 'request normal'
})
.get('/client-error', (ctx) => {
    ctx.response.status = 400
    ctx.body = 'client error'
})
.get('/server-error', (ctx) => {
    ctx.response.status = 500
    ctx.body = 'server error'
})

// return koa server for test
module.exports = function (opts) {
    const app = new Koa()
    const logger = (new Logger()).generate(opts)
    app.use(logger)
    app.use(router.routes())

    return app
}