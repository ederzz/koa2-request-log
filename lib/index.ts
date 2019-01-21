import * as util from 'util'
import * as moment from 'moment'
import chalk, { Chalk } from 'chalk'
import { Writable } from 'stream'
import { Context, Request, Response } from 'koa'

/**
 * TODO:1.自定义moment format函数
 *      3.response content length
 *      4.代码优化 && 测试文件
 *      5.格式化log输出
 */

type LogColor = string | Chalk

interface Next {
    (): Promise<any>
}
interface Options {
    stream?: Writable, // TODO:
    logColor?: LogColor,
    dateFormat?: string,
    skip?: (req: Request, res: Response) => boolean
}

let dateFormat: string = 'YYYY-MM-DD HH-mm-ss'
const errorHexColor: string = '#f9084a' // hex color for error log

// logger generator
function createLoggerMiddleware(options?: Options) {
    if (options && options.dateFormat) {
        dateFormat = options.dateFormat
    }
    return async function reqLogger(ctx: Context, next: Next) {
        let logStr: string
        let requestAt: string = moment().format(dateFormat)
        const start = process.hrtime()

        try {
            await next()
            const {
                request,
                response
            } = ctx

            if (options && options.skip && options.skip(request, response)) {
                // skip this request
                return null
            }
            const delta = process.hrtime(start)
            logStr = request.protocol 
                    + ' '
                    + ctx.req.httpVersion + ' '
                    + request.method + ' '
                    + request.path + ' '
                    + response.status
                    + Math.round(delta[0] * 1000 + delta[1] / 1000000) + ' ms'
                    + '\n'
                    + '--\n'
                    + 'request header: '
                    + util.inspect(request.header,{ compact: false, depth: 6, breakLength: 80 })
                    + '\n'
            if (!options) {
                // default log
                console.log(
                    'request at: ' 
                    + requestAt 
                    + '\n'
                    + logStr
                )
                return
            }
            if (options.dateFormat) {
                requestAt = moment().format(options.dateFormat) 
            }
            logStr = 'request at: ' 
                        + requestAt 
                        + '\n'
                        + logStr
            
            const stream: Writable = options.stream || process.stdout
            stream.write(
                stream === process.stdout 
                    ? colorStr(logStr, options.logColor || null)
                    : logStr
            )
        } catch (err) {
            console.log(
                colorStr(err.message, errorHexColor)
            )
        }
    }
}

// colored log
function colorStr(logStr: string, logColor: LogColor | null): string {
    if (logColor === null) {
        return logStr
    }
    if (typeof logColor === 'string') {
        return chalk.hex(logColor)(logStr)
    }
    return logColor(logStr)
}

export default createLoggerMiddleware