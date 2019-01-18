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
const fs = require("fs");
const util = require("util");
const moment = require("moment");
const chalk_1 = require("chalk");
let dateFormat = 'YYYY-MM-DD HH-mm-ss';
// logger generator
function createLoggerMiddleware(options) {
    if (options && options.dateFormat) {
        dateFormat = options.dateFormat;
    }
    return function reqLogger(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let logStr;
            let requestAt = moment().format(dateFormat);
            try {
                yield next();
                const { request, response } = ctx;
                if (options && options.skip && options.skip(request, response)) {
                    // skip this request
                    return null;
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
                    + util.inspect(request.header, { compact: false, depth: 6, breakLength: 80 });
                if (!options) {
                    // default log
                    console.log('request at: '
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
                console.log(colorStr(logStr, options.logColor || null));
                if (options.logFilePath) {
                    writeLogIntoFile(logStr, options.logFilePath);
                }
            }
            catch (err) {
                console.log(colorStr(err.message, '#f9084a'));
            }
        });
    };
}
// colored log
function colorStr(logStr, hexColor) {
    if (hexColor) {
        return chalk_1.default.hex(hexColor)(logStr);
    }
    else {
        return logStr;
    }
}
// write log in log file
function writeLogIntoFile(logStr, filePath) {
    fs.appendFileSync(filePath, logStr);
}
exports.default = createLoggerMiddleware;
