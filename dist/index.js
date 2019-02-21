"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import * as util from 'util'
const moment = require("moment");
const chalk_1 = require("chalk");
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
function colorStr(logStr, logColor) {
    if (logColor === null) {
        return logStr;
    }
    if (typeof logColor === 'string') {
        return chalk_1.default.hex(logColor)(logStr);
    }
    return logColor(logStr);
}
class Logger {
    constructor() {
        this.fields = {};
        this.setField('protocol', (ctx) => {
            return ctx.request.protocol;
        });
        this.setField('http-version', (ctx) => {
            return ctx.req.httpVersion;
        });
        this.setField('method', (ctx) => {
            return ctx.request.method;
        });
        this.setField('path', (ctx) => {
            return ctx.request.path;
        });
        this.setField('status', (ctx) => {
            return ctx.response.status;
        });
        this.setField('response-time', (ctx) => {
            return ctx.response.get('response-time');
        });
        this.setField('request-at', (_, fmt) => {
            return moment().format(fmt);
        });
        this.setField('req', (ctx, field) => {
            return ctx.request.header[field];
        });
        this.setField('res', (ctx, field) => {
            return ctx.response.header[field];
        });
        // set default log output
        this.defaultLog = this.format(':request-at[YYYY-MM-DD HH:mm:ss] :protocol :http-version --> :method :path :status :response-time :req[accept]');
        // header
    }
    setField(name, func) {
        this.fields[name] = func;
    }
    format(fmt) {
        return (fields, ctx) => {
            return fmt.replace(/:([\w-]{2,})(?:\[(^[\]]+)\])?/g, function (_, name, arg) {
                return typeof fields[name] === 'function'
                    ? fields[name](ctx, arg)
                    : '-';
            });
        };
    }
    generate(opts) {
        const stream = opts.stream || process.stdout;
        const formatLog = opts.logFmt
            ? this.format(opts.logFmt)
            : this.defaultLog;
        return (ctx, next) => {
            const start = process.hrtime();
            next();
            const delta = process.hrtime(start);
            ctx.set('response-time', Math.round(delta[0] * 1000 + delta[1] / 1000000) + 'ms');
            const log = formatLog(this.fields, ctx);
            stream.write(colorStr(log + '\n', opts.logColor || null));
        };
    }
}
exports.default = Logger;
