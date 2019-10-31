import { ExecaChildProcess } from 'execa';

export function init(path: string): ExecaChildProcess
export function initSync(path: string)

export function node(path: string, opts: object): ExecaChildProcess

export function lite(target: string, path: string, opts: object): ExecaChildProcess

export function version(): string

export function genValidator(): string