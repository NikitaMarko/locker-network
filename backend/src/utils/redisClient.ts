import net from "net";
import tls from "tls";

import { env } from "../config/env";

type RedisValue = string | number | null | RedisValue[];

type ParsedRedisConfig = {
    host: string;
    port: number;
    password?: string;
    db?: number;
    useTls: boolean;
};

type RespParseResult =
    | { value: RedisValue; nextOffset: number }
    | { error: Error; nextOffset: number }
    | null;

function parseRedisConfig(): ParsedRedisConfig {
    if (!env.REDIS_URL) {
        throw new Error("REDIS_URL is not configured");
    }

    const url = new URL(env.REDIS_URL);
    if (url.protocol !== "redis:" && url.protocol !== "rediss:") {
        throw new Error(`Unsupported Redis protocol: ${url.protocol}`);
    }

    const dbPath = url.pathname.replace("/", "");
    return {
        host: url.hostname || "127.0.0.1",
        port: Number(url.port || (url.protocol === "rediss:" ? 6380 : 6379)),
        password: url.password || undefined,
        db: dbPath ? Number(dbPath) : undefined,
        useTls: url.protocol === "rediss:",
    };
}

function encodeRedisCommand(args: Array<string | number>) {
    const parts = [`*${args.length}\r\n`];

    for (const arg of args) {
        const value = String(arg);
        parts.push(`$${Buffer.byteLength(value)}\r\n${value}\r\n`);
    }

    return parts.join("");
}

function readLine(buffer: Buffer, offset: number) {
    const lineEnd = buffer.indexOf("\r\n", offset);
    if (lineEnd === -1) {
        return null;
    }

    return {
        line: buffer.toString("utf8", offset, lineEnd),
        nextOffset: lineEnd + 2,
    };
}

function parseRespValue(buffer: Buffer, offset = 0): RespParseResult {
    if (offset >= buffer.length) {
        return null;
    }

    const prefix = String.fromCharCode(buffer.readUInt8(offset));
    const lineResult = readLine(buffer, offset + 1);
    if (!lineResult) {
        return null;
    }

    if (prefix === "+" || prefix === ":" || prefix === "-") {
        if (prefix === "-") {
            return {
                error: new Error(lineResult.line),
                nextOffset: lineResult.nextOffset,
            };
        }

        return {
            value: prefix === ":" ? Number(lineResult.line) : lineResult.line,
            nextOffset: lineResult.nextOffset,
        };
    }

    if (prefix === "$") {
        const length = Number(lineResult.line);
        if (length === -1) {
            return {
                value: null,
                nextOffset: lineResult.nextOffset,
            };
        }

        const bodyEnd = lineResult.nextOffset + length;
        if (buffer.length < bodyEnd + 2) {
            return null;
        }

        return {
            value: buffer.toString("utf8", lineResult.nextOffset, bodyEnd),
            nextOffset: bodyEnd + 2,
        };
    }

    if (prefix === "*") {
        const itemCount = Number(lineResult.line);
        if (itemCount === -1) {
            return {
                value: null,
                nextOffset: lineResult.nextOffset,
            };
        }

        const items: RedisValue[] = [];
        let currentOffset = lineResult.nextOffset;

        for (let i = 0; i < itemCount; i += 1) {
            const item = parseRespValue(buffer, currentOffset);
            if (!item) {
                return null;
            }

            if ("error" in item) {
                return item;
            }

            items.push(item.value);
            currentOffset = item.nextOffset;
        }

        return {
            value: items,
            nextOffset: currentOffset,
        };
    }

    throw new Error(`Unsupported RESP prefix: ${prefix}`);
}

async function sendRedisCommand(args: Array<string | number>): Promise<RedisValue> {
    const config = parseRedisConfig();
    const setupCommands: Array<Array<string | number>> = [];

    if (config.password) {
        setupCommands.push(["AUTH", config.password]);
    }

    if (Number.isInteger(config.db) && (config.db ?? 0) > 0) {
        setupCommands.push(["SELECT", config.db as number]);
    }

    const allCommands = [...setupCommands, args];
    const payload = allCommands.map(encodeRedisCommand).join("");

    return new Promise<RedisValue>((resolve, reject) => {
        const socket = config.useTls
            ? tls.connect({ host: config.host, port: config.port })
            : net.createConnection({ host: config.host, port: config.port });
        const readyEvent = config.useTls ? "secureConnect" : "connect";

        let buffer = Buffer.alloc(0);
        let handledResponses = 0;

        const cleanup = () => {
            socket.removeAllListeners();
            socket.end();
            socket.destroy();
        };

        socket.once("error", (error) => {
            cleanup();
            reject(error);
        });

        socket.on("data", (chunk) => {
            const normalizedChunk = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
            buffer = Buffer.concat([buffer, normalizedChunk]);

            while (handledResponses < allCommands.length) {
                const parsed = parseRespValue(buffer);
                if (!parsed) {
                    return;
                }

                buffer = buffer.subarray(parsed.nextOffset);
                handledResponses += 1;

                if ("error" in parsed) {
                    cleanup();
                    reject(parsed.error);
                    return;
                }

                if (handledResponses === allCommands.length) {
                    cleanup();
                    resolve(parsed.value);
                    return;
                }
            }
        });

        socket.once(readyEvent, () => {
            socket.write(payload);
        });
    });
}

export async function redisGet(key: string): Promise<string | null> {
    const result = await sendRedisCommand(["GET", key]);
    return typeof result === "string" ? result : null;
}

export async function redisSet(key: string, value: string): Promise<void> {
    await sendRedisCommand(["SET", key, value]);
}

export async function redisDelete(key: string): Promise<void> {
    await sendRedisCommand(["DEL", key]);
}

export async function redisEval(script: string, keys: string[], args: string[]): Promise<RedisValue> {
    await sendRedisCommand(["EVAL", script, keys.length, ...keys, ...args]);
    return null;
}

export async function redisScan(cursor: string, pattern: string, count = 100): Promise<[string, string[]]> {
    const result = await sendRedisCommand(["SCAN", cursor, "MATCH", pattern, "COUNT", count]);
    if (!Array.isArray(result) || result.length !== 2 || !Array.isArray(result[1])) {
        throw new Error("Unexpected Redis SCAN response");
    }

    return [
        String(result[0]),
        result[1].map((item) => String(item)),
    ];
}
