/// <reference types="node" />
import { Chalk } from 'chalk';
import { Writable } from 'stream';
import { Context, Request, Response } from 'koa';
/**
 * TODO:1.自定义moment format函数
 *      3.response content length
 *      4.代码优化 && 测试文件
 *      5.格式化log输出
 */
declare type LogColor = string | Chalk;
interface Next {
    (): Promise<any>;
}
interface Opts {
    stream?: Writable;
    logColor?: LogColor;
    skip?: (req: Request, res: Response) => boolean;
    logFmt?: string;
}
declare class Logger {
    fields: any;
    private defaultLog;
    constructor();
    private setField;
    private format;
    generate(opts: Opts): (ctx: Context, next: Next) => void;
}
export default Logger;
