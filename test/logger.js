const request = require('supertest')
const assert = require('assert')
const sinon = require('sinon')
const fs = require('fs')
const split = require('split')

let app, log
const stream = fs.createWriteStream('app.log', {
    flags: 'a'
})

describe('koa2-request-log', () => {
    describe('log with options', () => {
        it('log with color: #ff0', function (done) {
            const cb = after(2, function (err, line) {
                if (err) {
                    done(err)
                    return 
                }
                // TODO:检验错误
                // assert(/\\u001b\[38;2;255;255;0m  \\u001b\[39m/.test(line))
                done()
            })
            const stream = createLineStream((line) => {
                // 校验
                cb(null, line)
            })
            app = require('../test-server')({
                stream,
                logColor: 'ff0'
            })
            request(app.listen())
                .get('/normal')
                .expect(200, cb)
        })
    })
})

function createLineStream (callback) {
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