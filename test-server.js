const Koa = require('koa')
const router = require('koa-router')()
const logger = require('./dist/index').default

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
module.exports = function (ops) {
    const app = new Koa()
    app.use(logger(ops))
    app.use(router.routes())

    return app
}