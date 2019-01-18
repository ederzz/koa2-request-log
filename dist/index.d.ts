import { Context, Request, Response } from 'koa';
/**
 * TODO:1.自定义moment format函数
 *      2.响应时间
 *      3.response content length
 *      4.代码优化 && 测试文件
 *      5.格式化log输出
 *      6.定义多个log输出
 *      7.使用stream定义输出位置.
 *      8.log color提供多种定义方式
 */
interface Next {
    (): Promise<any>;
}
interface Options {
    logFilePath?: string;
    logColor?: string;
    dateFormat?: string;
    skip?: (req: Request, res: Response) => boolean;
}
declare function createLoggerMiddleware(options?: Options): (ctx: Context, next: Next) => Promise<null | undefined>;
export default createLoggerMiddleware;
