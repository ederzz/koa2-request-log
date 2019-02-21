"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const chalk_1 = require("chalk");
// TODO: ts类型规范化，使用规范化，定义format输出时间，测试文件，代码优化，多余tsconfig内容，测试res返回，添加example，修改README添加内容
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
        this.setField('request-at', (_) => {
            return moment();
        });
        this.setField('req', (ctx, field) => {
            return ctx.request.header[field];
        });
        this.setField('res', (ctx, field) => {
            return ctx.response.header[field];
        });
        // set default log output
        this.defaultLog = this.format(':request-at :protocol :http-version --> :method :path :status :response-time :req[accept]');
    }
    setField(name, func) {
        this.fields[name] = func;
    }
    format(fmt) {
        return (fields, ctx) => {
            return fmt.replace(/:([\w-]{2,})(?:\[([^\]]+)\])?/g, function (_, name, arg) {
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
            stream.write(this.colorStr(log + '\n', opts.logColor || null));
        };
    }
    // colored log
    colorStr(logStr, logColor) {
        if (logColor === null) {
            return logStr;
        }
        if (typeof logColor === 'string') {
            return chalk_1.default.hex(logColor)(logStr);
        }
        return logColor(logStr);
    }
}
exports.default = Logger;
