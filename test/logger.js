const request = require('supertest')
const assert = require('assert')
const sinon = require('sinon')
const fs = require('fs')

let app, log
const stream = fs.createWriteStream('app.log', {
    flags: 'a'
})

describe('koa2-request-log', () => {
    describe('log at console', () => {
        before(() => {
            app = require('../test-server')({
                logColor: '#ff0',
                dateFormat: 'YYYY-MM-DD',
                skip(req, res) {
                    return res.status >= 400
                }
            })
        })
        beforeEach(() => {
            log = sinon.stub(process.stdout, 'write')
        })
        afterEach(() => {
            log.restore()
        })

        it('should log at console', function (done) {
            request(app.listen())
                .get('/normal')
                .expect(200, 'request normal', () => {
                    assert(log.calledOnce, 'console log is not called.')
                    done()
                })
        })

        it('should skip this log', function(done) {
            request(app.listen())
                .get('/client-error')
                .expect(400, 'client error', () => {
                    assert(log.notCalled, 'console log should not be called.')
                    done()
                })
        })
    })

    describe('write log to file', () => {
        before(() => {
            app = require('../test-server')({
                stream
            })
        })
        beforeEach(() => {
            log = sinon.stub(stream, 'write')
        })
        afterEach(() => {
            log.restore()
        })

        it('should write log to file', function (done) {
            request(app.listen())
                .get('/normal')
                .expect(200, 'request normal', () => {
                    assert(log.calledOnce, 'stream\'s write function is not called.')
                    done()
                })
        })
    })
})