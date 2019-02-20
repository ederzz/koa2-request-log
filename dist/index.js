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
const util = require("util");
const moment = require("moment");
const chalk_1 = require("chalk");
let dateFormat = 'YYYY-MM-DD HH-mm-ss';
const errorHexColor = '#f9084a'; // hex color for error log
// logger generator
function createLoggerMiddleware(options) {
    if (options && options.dateFormat) {
        dateFormat = options.dateFormat;
    }
    return function reqLogger(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let logStr;
            let requestAt = moment().format(dateFormat);
            const start = process.hrtime();
            try {
                yield next();
                const { request, response } = ctx;
                if (options && options.skip && options.skip(request, response)) {
                    // skip this request
                    return null;
                }
                const delta = process.hrtime(start);
                logStr = request.protocol
                    + ' '
                    + ctx.req.httpVersion + ' '
                    + request.method + ' '
                    + request.path + ' '
                    + response.status + ' '
                    + Math.round(delta[0] * 1000 + delta[1] / 1000000) + 'ms'
                    + '\n'
                    + '--\n'
                    + 'request header: '
                    + util.inspect(request.header, { compact: false, depth: 6, breakLength: 80 })
                    + '\n';
                if (!options) {
                    // default log
                    process.stdout.write('request at: '
                        + requestAt
                        + '\n'
                        + logStr);
                    return;
                }
                if (options.dateFormat) {
                    requestAt = moment().format(options.dateFormat);
                }
                logStr = 'request at: '
                    + requestAt
                    + '\n'
                    + logStr;
                const stream = options.stream || process.stdout;
                stream.write(stream === process.stdout
                    ? colorStr(logStr, options.logColor || null)
                    : logStr);
            }
            catch (err) {
                process.stdout.write(colorStr(err.message, errorHexColor));
            }
        });
    };
}
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
exports.default = createLoggerMiddleware;
