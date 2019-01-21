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
interface Options {
    stream?: Writable;
    logFilePath?: string;
    logColor?: LogColor;
    dateFormat?: string;
    skip?: (req: Request, res: Response) => boolean;
}
declare function createLoggerMiddleware(options?: Options): (ctx: Context, next: Next) => Promise<null | undefined>;
export default createLoggerMiddleware;
