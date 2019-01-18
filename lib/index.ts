import * as fs from 'fs'
import * as util from 'util'
import * as moment from 'moment'
import chalk from 'chalk'
import { Context, Request, Response } from 'koa'

/**
 * TODO:1.自定义moment format函数
 *      2.响应时间
 *      3.response content length
 *      4.代码优化 && 测试文件
 *      5.格式化log输出
 *      6.定义多个log输出
 *      7.使用stream定义输出位置.
 *      8.log color提供多种定义方式
 */
interface Next {
    (): Promise<any>
}
interface Options {
    logFilePath?: string,
    logColor?: string,
    dateFormat?: string,
    skip?: (req: Request, res: Response) => boolean
}

let dateFormat: string = 'YYYY-MM-DD HH-mm-ss'


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
            
            console.log(
                colorStr(logStr, options.logColor || null)
            )
            if (options.logFilePath) {
                writeLogIntoFile(logStr, options.logFilePath)
            }
        } catch (err) {
            console.log(
                colorStr(err.message, '#f9084a')
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

// write log in log file
function writeLogIntoFile(logStr: string, filePath: string): void {
    fs.appendFileSync(filePath, logStr)
}

export default createLoggerMiddleware