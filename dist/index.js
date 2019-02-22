"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const chalk_1 = require("chalk");
function defaultSkip() {
    return false;
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
        this.setField('request-at', (_) => {
            return moment();
        });
        this.setField('req', (ctx, field) => {
            return field ? ctx.request.header[field] : '-';
        });
        this.setField('res', (ctx, field) => {
            return field ? ctx.response.header[field] : '-';
        });
        // set default log output
        this.defaultLog = this.format(':request-at :protocol :http-version --> :method :path :status :response-time');
    }
    // set http field to the fields property of the Logger class.
    setField(name, func) {
        this.fields[name] = func;
    }
    // format the log str
    format(fmt) {
        return (fields, ctx) => fmt.replace(/:([\w-]{2,})(?:\[([^\]]+)\])?/g, function (_, name, arg) {
            return typeof fields[name] === 'function'
                ? fields[name](ctx, arg)
                : '-';
        });
    }
    // colored log
    colorStr(logStr, logColor) {
        if (!logColor) {
            return logStr;
        }
        if (typeof logColor === 'string') {
            return chalk_1.default.hex(logColor)(logStr);
        }
        return logColor(logStr);
    }
    // create a log middleware
    generate(opts) {
        const stream = opts
            && opts.stream
            && opts.stream
            || process.stdout;
        const formatLog = opts
            && opts.logFmt
            && this.format(opts.logFmt)
            || this.defaultLog;
        const skip = opts
            && opts.skip
            || defaultSkip;
        return (ctx, next) => __awaiter(this, void 0, void 0, function* () {
            const start = process.hrtime();
            yield next();
            if (skip(ctx.request, ctx.response)) {
                return null;
            }
            const delta = process.hrtime(start);
            ctx.set('response-time', Math.round(delta[0] * 1000 + delta[1] / 1000000) + 'ms');
            const log = formatLog(this.fields, ctx);
            stream.write(this.colorStr(log + '\n', opts && opts.logColor));
        });
    }
}
exports.default = Logger;
