const request = require('supertest')
const assert = require('assert')
const split = require('split')
const Koa = require('koa')
const router = require('koa-router')()
const Logger = require('../dist/index').default

let app

describe('koa2-request-log', () => {
    describe('log with options', () => {
        it('log with color: #ff0', function (done) {
            const cb = after(2, function (err, line) {
                if (err) {
                    done(err)
                    return 
                }
                assert(/\u001b\[38;2;255;255;0m.*\u001b\[39m/.test(line))
                done()
            })
            const stream = createTestStream((line) => {
                cb(null, line)
            })
            app = createTestServer({
                stream,
                logColor: 'ff0'
            })
            request(app.listen())
                .get('/normal')
                .expect(200, cb)
        }),
        it('log with custom format', function (done) {
            const cb = after(2, function (err, line) {
                if (err) {
                    done(err)
                    return 
                }
                assert(line === 'GET 200')
                done()
            })
            const stream = createTestStream(line => {
                cb(null, line)
            })
            app = createTestServer({
                stream,
                logFmt: ':method :status'
            })
            request(app.listen())
                .get('/normal')
                .expect(200, cb)
        }),
        it('log with skip option', function (done) {
            const stream = createTestStream(line => {
                assert(false, 'should not log')
            })
            app = require('../test-server')({
                stream,
                skip(_, res) {
                    if (res.status >= 400) {
                        return true
                    }
                    return false
                }
            })
            request(app.listen())
                .get('/server-error')
                .expect(500, done)
        })
    })
})

function createTestStream (callback) {
    return split().on('data', callback)
}

function after (count, callback) {
    let i = 0
    let args = new Array(2)

    return function (err, log) {
        i++
        args[0] = args[0] || err
        args[1] = args[1] || log

        if (count === i) {
            callback.apply(null, args)
        }
    }
}

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
function createTestServer (opts) {
    const app = new Koa()
    const logger = (new Logger()).generate(opts)
    app.use(logger)
    app.use(router.routes())

    return app
}