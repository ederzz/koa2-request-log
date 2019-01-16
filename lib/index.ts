import chalk, { Chalk } from 'chalk'
import * as fs from 'fs'
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
function createLoggerMiddlware(options: Options) {
    if (options.coloredOutput) {
        coloredOutput = options.coloredOutput
    }
    return async function reqLogger(ctx: Context, next: Next) {
        let logStr: string
        try {
            await next()
            logStr = `req route:${ctx.path},http method:${ctx.request.method}`
            printLog(
                logStr,
                chalk.green
            )
            if (options.logFilePath) {
                writeLogIntoFile(logStr, options.logFilePath)
            }
        } catch (err) {
            printLog(
                err.message,
                chalk.red
            )
        }
    }
}

// print log
function printLog(logStr: string, colorWrapper: Chalk): void {
    if (coloredOutput) {
        console.log(colorWrapper(logStr))
    } 
    console.log(logStr)
}

// write log in log file
function writeLogIntoFile(logStr: string, filePath: string): void {
    fs.appendFileSync(filePath, logStr)
}

export default createLoggerMiddlware