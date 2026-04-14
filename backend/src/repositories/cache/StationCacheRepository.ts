import { StationCacheDto } from "../../contracts/cache.dto";
import { env } from "../../config/env";
import { redisEval, redisGet, redisScan } from "../../utils/redisClient";

interface IStationCacheRepository {
    findById(stationId: string): Promise<StationCacheDto | null>;
    findAll(): Promise<StationCacheDto[]>;
    upsert(projection: StationCacheDto): Promise<void>;
    delete(stationId: string, version: number): Promise<void>;
}

const STATION_CACHE_PREFIX = env.REDIS_STATION_CACHE_PREFIX;
const STATION_CACHE_TTL_SECONDS = env.REDIS_STATION_CACHE_TTL_SECONDS;

function getStationCacheKey(stationId: string) {
    return `${STATION_CACHE_PREFIX}${stationId}`;
}

class StationCacheRepository implements IStationCacheRepository {
    async findById(stationId: string): Promise<StationCacheDto | null> {
        const cached = await redisGet(getStationCacheKey(stationId));
        return cached ? JSON.parse(cached) as StationCacheDto : null;
    }

    async findAll(): Promise<StationCacheDto[]> {
        const items: StationCacheDto[] = [];
        let cursor = "0";

        do {
            const [nextCursor, keys] = await redisScan(cursor, `${STATION_CACHE_PREFIX}*`);
            const stationItems = await Promise.all(
                keys.map(async (key) => {
                    const cached = await redisGet(key);
                    return cached ? JSON.parse(cached) as StationCacheDto : null;
                })
            );

            items.push(...stationItems.filter((item): item is StationCacheDto => item !== null));
            cursor = nextCursor;
        } while (cursor !== "0");

        return items;
    }

    async upsert(projection: StationCacheDto): Promise<void> {
        const script = [
            "local current = redis.call('GET', KEYS[1])",
            "if current then",
            "  local decoded = cjson.decode(current)",
            "  local currentVersion = tonumber(decoded.version or -1)",
            "  if currentVersion >= tonumber(ARGV[2]) then return 0 end",
            "end",
            "redis.call('SET', KEYS[1], ARGV[1], 'EX', ARGV[3])",
            "return 1",
        ].join("\n");

        await redisEval(script, [getStationCacheKey(projection.stationId)], [
            JSON.stringify(projection),
            String(projection.version),
            String(STATION_CACHE_TTL_SECONDS),
        ]);
    }

    async delete(stationId: string, version: number): Promise<void> {
        const script = [
            "local current = redis.call('GET', KEYS[1])",
            "if not current then return 0 end",
            "local decoded = cjson.decode(current)",
            "local currentVersion = tonumber(decoded.version or -1)",
            "if currentVersion > tonumber(ARGV[1]) then return 0 end",
            "redis.call('DEL', KEYS[1])",
            "return 1",
        ].join("\n");

        await redisEval(script, [getStationCacheKey(stationId)], [String(version)]);
    }
}

export const stationCacheRepository = new StationCacheRepository();
