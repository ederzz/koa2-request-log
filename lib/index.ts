import * as moment from 'moment'
import chalk, { Chalk } from 'chalk'
import { Writable } from 'stream'
import { Context, Request, Response } from 'koa'

type LogColor = string | Chalk
interface Next {
    (): Promise<any>
}
interface Opts {
    stream?: Writable, 
    logColor?: LogColor,
    skip?: (req: Request, res: Response) => boolean,
    logFmt?: string
}
// TODO: ts类型规范化，使用规范化，定义format输出时间，测试文件，代码优化，多余tsconfig内容，测试res返回，添加example，修改README添加内容，添加更多字段

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
        this.setField('request-at', (_: Context) => {
            return moment()
        })
        this.setField('req', (ctx: Context, field: string) => {
            return ctx.request.header[field]
        })
        this.setField('res', (ctx: Context, field: string) => {
            return ctx.response.header[field]
        })

        // set default log output
        this.defaultLog = this.format(':request-at :protocol :http-version --> :method :path :status :response-time')
    }

    private setField(name: string, func: Function) {
        this.fields[name] = func
    }

    private format(fmt: string) {
        return (fields: any, ctx: Context) => {
            return fmt.replace(/:([\w-]{2,})(?:\[([^\]]+)\])?/g, function (_, name, arg) {
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
                this.colorStr(log + '\n', opts.logColor || null)
            )
        }
    }

    // colored log
    colorStr(logStr: string, logColor: LogColor | null): string {
        if (logColor === null) {
            return logStr
        }
        if (typeof logColor === 'string') {
            return chalk.hex(logColor)(logStr)
        }
        return logColor(logStr)
    }
}

export default Logger