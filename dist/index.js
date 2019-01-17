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
const chalk_1 = require("chalk");
let coloredOutput = true;
// logger generator
function createLoggerMiddlware(options) {
    if (options && typeof options.coloredOutput === 'boolean') {
        coloredOutput = options.coloredOutput;
    }
    return function reqLogger(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let logStr;
            try {
                yield next();
                const { request, response } = ctx;
                logStr = `${new Date()}\n${request.protocol} ${request.method} ${request.path} ${response.status}\n--\nrequest header:${util.inspect(request.header, { compact: false, depth: 6, breakLength: 80 })}`;
                printLog(logStr, chalk_1.default.hex('#090'));
                if (options && options.logFilePath) {
                    writeLogIntoFile(logStr, options.logFilePath);
                }
            }
            catch (err) {
                printLog(err.message, chalk_1.default.hex('#f31140'));
            }
        });
    };
}
// print log
function printLog(logStr, colorWrapper) {
    if (coloredOutput) {
        console.log(colorWrapper(logStr));
    }
    else {
        console.log(logStr);
    }
}
// write log in log file
function writeLogIntoFile(logStr, filePath) {
    fs.appendFileSync(filePath, logStr);
}
exports.default = createLoggerMiddlware;
