import * as fs from 'fs'
import * as util from 'util'
import chalk, { Chalk } from 'chalk'
import { Context } from 'koa'

interface Next {
    (): Promise<any>
}
interface Options {
    logFilePath?: string,
    coloredOutput?: boolean
}

let coloredOutput: boolean = true


// logger generator
function createLoggerMiddlware(options?: Options) {
    if (options && typeof options.coloredOutput === 'boolean') {
        coloredOutput = options.coloredOutput
    }
    return async function reqLogger(ctx: Context, next: Next) {
        let logStr: string
        try {
            await next()
            const {
                request,
                response
            } = ctx
            logStr = `${new Date()}\n${request.protocol} ${request.method} ${request.path} ${response.status}\n--\nrequest header:${util.inspect(request.header,{ compact: false, depth: 6, breakLength: 80 })}`
            printLog(
                logStr,
                chalk.hex('#090')
            )
            if (options && options.logFilePath) {
                writeLogIntoFile(logStr, options.logFilePath)
            }
        } catch (err) {
            printLog(
                err.message,
                chalk.hex('#f31140')
            )
        }
    }
}

// print log
function printLog(logStr: string, colorWrapper: Chalk): void {
    if (coloredOutput) {
        console.log(colorWrapper(logStr))
    } else {
        console.log(logStr)
    }
}

// write log in log file
function writeLogIntoFile(logStr: string, filePath: string): void {
    fs.appendFileSync(filePath, logStr)
}

export default createLoggerMiddlware