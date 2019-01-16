import { Context } from 'koa';
interface Next {
    (): Promise<any>;
}
interface Options {
    logFilePath?: string;
    coloredOutput?: boolean;
}
declare function createLoggerMiddlware(options: Options): (ctx: Context, next: Next) => Promise<void>;
export default createLoggerMiddlware;
