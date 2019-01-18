import * as util from 'util'
import * as moment from 'moment'
import chalk from 'chalk'
import { Writable } from 'stream'
import { Context, Request, Response } from 'koa'

/**
 * TODO:1.自定义moment format函数
 *      2.响应时间
 *      3.response content length
 *      4.代码优化 && 测试文件
 *      5.格式化log输出
 *      7.使用stream定义输出位置.
 *      8.log color提供多种定义方式
 *      9.存储文件是否需要颜色
 */
interface Next {
    (): Promise<any>
}
interface Options {
    stream?: Writable, // TODO:
    logFilePath?: string,
    logColor?: string,
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
            logStr = request.protocol 
                    + ' '
                    + ctx.req.httpVersion + ' '
                    + request.method + ' '
                    + request.path + ' '
                    + response.status
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
            stream.write(colorStr(logStr, options.logColor || null))
        } catch (err) {
            console.log(
                colorStr(err.message, errorHexColor)
            )
        }
    }
}

// colored log
function colorStr(logStr: string, hexColor: string | null): string {
    if (hexColor) {
        return chalk.hex(hexColor)(logStr)
    } else {
        return logStr
    }
}

export default createLoggerMiddleware