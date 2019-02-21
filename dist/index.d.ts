/// <reference types="node" />
import { Chalk } from 'chalk';
import { Writable } from 'stream';
import { Context, Request, Response } from 'koa';
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
    colorStr(logStr: string, logColor: LogColor | null): string;
}
export default Logger;
