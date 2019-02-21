// import * as util from 'util'
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
interface Opts {
    stream?: Writable, // TODO:
    logColor?: LogColor,
    // dateFormat?: string,
    skip?: (req: Request, res: Response) => boolean,
    logFmt?: string
}

// let dateFormat: string = 'YYYY-MM-DD HH-mm-ss'
// const errorHexColor: string = '#f9084a' // hex color for error log

// // logger generator
// function createLogger(options?: Opts): Function {
//     if (options && options.dateFormat) {
//         dateFormat = options.dateFormat
//     }
//     return async function logger(ctx: Context, next: Next) {
//         let logStr: string
//         let requestAt: string = moment().format(dateFormat)
//         const start = process.hrtime()

//         try {
//             await next()
//             const {
//                 request,
//                 response
//             } = ctx

//             if (options && options.skip && options.skip(request, response)) {
//                 // skip this request
//                 return null
//             }
//             const delta = process.hrtime(start)
//             logStr = request.protocol 
//                     + ' '
//                     + ctx.req.httpVersion + ' '
//                     + request.method + ' '
//                     + request.path + ' '
//                     + response.status + ' '
//                     + Math.round(delta[0] * 1000 + delta[1] / 1000000) + 'ms'
//                     + '\n'
//                     + '--\n'
//                     + 'request header: '
//                     + util.inspect(request.header,{ compact: false, depth: 6, breakLength: 80 })
//                     + '\n'

//             if (!options) {
//                 // default log
//                 process.stdout.write(
//                     'request at: ' 
//                     + requestAt 
//                     + '\n'
//                     + logStr
//                 )
//                 return
//             }
//             if (options.dateFormat) {
//                 requestAt = moment().format(options.dateFormat) 
//             }
//             logStr = 'request at: ' 
//                         + requestAt 
//                         + '\n'
//                         + logStr
            
//             const stream: Writable = options.stream || process.stdout
//             stream.write(
//                 stream === process.stdout 
//                     ? colorStr(logStr, options.logColor || null)
//                     : logStr
//             )
//         } catch (err) {
//             process.stdout.write(
//                 colorStr(err.message, errorHexColor)
//             )
//         }
//     }
// }

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

class Logger {
    public fields: any = {}
    private defaultLog: Function

    constructor() {
        this.setField('protocol', (ctx: Context) => {
            return ctx.request.protocol
        })
        this.setField('http-version', (ctx: Context) => {
            return ctx.req.httpVersion
        })
        this.setField('method', (ctx: Context) => {
            return ctx.request.method
        })
        this.setField('path', (ctx: Context) => {
            return ctx.request.path
        })
        this.setField('status', (ctx: Context) => {
            return ctx.response.status
        })
        this.setField('response-time', (ctx: Context) => {
            return ctx.response.get('response-time')
        })
        this.setField('request-at', (_: Context, fmt: string) => {
            return moment().format(fmt)
        })
        this.setField('req', (ctx: Context, field: string) => {
            return ctx.request.header[field]
        })
        this.setField('res', (ctx: Context, field: string) => {
            return ctx.response.header[field]
        })

        // set default log output
        this.defaultLog = this.format(':request-at[YYYY-MM-DD HH:mm:ss] :protocol :http-version --> :method :path :status :response-time :req[accept]')
        // header
    }

    private setField(name: string, func: Function) {
        this.fields[name] = func
    }
    // TODO:报错

    private format(fmt: string) {
        
        return (fields: any, ctx: Context) => {
            return fmt.replace(/:([\w-]{2,})(?:\[(^[\]]+)\])?/g, function (_, name, arg) {
                return typeof fields[name] === 'function'
                        ? fields[name](ctx, arg) 
                        : '-'
            })
        }
    }

    generate(opts: Opts) {

        const stream: Writable = opts.stream || process.stdout
        const formatLog = opts.logFmt
                            ? this.format(opts.logFmt)
                            : this.defaultLog

        return (ctx: Context, next: Next) => {
            const start = process.hrtime()
            next()
            const delta = process.hrtime(start)
            ctx.set('response-time', Math.round(delta[0] * 1000 + delta[1] / 1000000) + 'ms')

            const log = formatLog(this.fields, ctx)
            stream.write(
                colorStr(log + '\n', opts.logColor || null)
            )
        }
    }
}

export default Logger