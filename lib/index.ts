import * as moment from 'moment'
import chalk, { Chalk } from 'chalk'
import { Writable } from 'stream'
import { Context, Request, Response } from 'koa'

type LogColor = string | Chalk
type HttpFieldGetter = (ctx: Context) => any 
type HttpHeaderGetter = (ctx: Context, field: string) => any
type DefaultLogFunc = (fields: HttpFields, ctx: Context) => any

interface Next {
    (): Promise<any>
}
interface Opts {
    stream?: Writable, 
    logColor?: LogColor,
    logFmt?: string
    skip?: (req: Request, res: Response) => boolean,
}
// TODO: 使用规范化，定义format输出时间，测试文件，代码优化，添加example，修改README添加内容

interface HttpFields {
    [key: string]: HttpFieldGetter | HttpHeaderGetter
}

class Logger {
    public fields: HttpFields = {}
    private defaultLog: DefaultLogFunc

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
        this.setField('request-at', (_: Context) => {
            return moment()
        })
        this.setField('req', (ctx: Context, field?: string) => {
            return field ? ctx.request.header[field] : '-'
        })
        this.setField('res', (ctx: Context, field?: string) => {
            return field ? ctx.response.header[field] : '-'
        })

        // set default log output
        this.defaultLog = this.format(':request-at :protocol :http-version --> :method :path :status :response-time')
    }

    // set http field to the fields property of the Logger class.
    private setField(name: string, func: HttpFieldGetter) {
        this.fields[name] = func
    }

    // format the log str
    private format(fmt: string) {
        return (fields: any, ctx: Context) => fmt.replace(/:([\w-]{2,})(?:\[([^\]]+)\])?/g, function (_, name, arg) {
            return typeof fields[name] === 'function'
                    ? fields[name](ctx, arg) 
                    : '-'
        })
    }

    // colored log
    private colorStr(logStr: string, logColor?: LogColor): string {
        if (!logColor) {
            return logStr
        }
        if (typeof logColor === 'string') {
            return chalk.hex(logColor)(logStr)
        }
        return logColor(logStr)
    }

    // create a log middleware
    public generate(opts: Opts) {
        const stream: Writable = opts.stream || process.stdout
        const formatLog = opts.logFmt
                            ? this.format(opts.logFmt)
                            : this.defaultLog

        return async (ctx: Context, next: Next) => {
            const start = process.hrtime()
            await next()
            const delta = process.hrtime(start)
            ctx.set('response-time', Math.round(delta[0] * 1000 + delta[1] / 1000000) + 'ms')

            const log = formatLog(this.fields, ctx)
            stream.write(
                this.colorStr(log + '\n', opts.logColor)
            )
        }
    }
}

export default Logger