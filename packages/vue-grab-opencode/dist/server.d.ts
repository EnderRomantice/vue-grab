import { Hono } from 'hono';

interface OpencodeAgentOptions {
    model?: string;
    agent?: string;
    directory?: string;
}
interface AgentContext<T = OpencodeAgentOptions> {
    content: string;
    prompt: string;
    options?: T;
}
declare const createServer: () => Hono;
declare const startServer: (port?: number) => Promise<void>;

export { type AgentContext, type OpencodeAgentOptions, createServer, startServer };
