/// <reference types="node" />
import { Chalk } from 'chalk';
import { Writable } from 'stream';
import { Context, Request, Response } from 'koa';
declare type LogColor = string | Chalk;
declare type HttpFieldGetter = (ctx: Context) => any;
declare type HttpHeaderGetter = (ctx: Context, field: string) => any;
interface Next {
    (): Promise<any>;
}
interface Opts {
    stream?: Writable;
    logColor?: LogColor;
    logFmt?: string;
    skip?: (req: Request, res: Response) => boolean;
}
interface HttpFields {
    [key: string]: HttpFieldGetter | HttpHeaderGetter;
}
declare class Logger {
    fields: HttpFields;
    private defaultLog;
    constructor();
    private setField;
    private format;
    private colorStr;
    generate(opts?: Opts): (ctx: Context, next: Next) => Promise<null | undefined>;
}
export default Logger;
