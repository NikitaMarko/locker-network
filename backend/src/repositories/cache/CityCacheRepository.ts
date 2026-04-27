import { CityCacheDto } from "../../contracts/cache.dto";
import { env } from "../../config/env";
import { redisEval, redisGet, redisScan } from "../../utils/redisClient";

interface ICityCacheRepository {
    findById(cityId: string): Promise<CityCacheDto | null>;
    findAll(): Promise<CityCacheDto[]>;
    upsert(projection: CityCacheDto): Promise<void>;
    delete(cityId: string, version: number): Promise<void>;
}

const CITY_CACHE_PREFIX = env.REDIS_CITY_CACHE_PREFIX;
const CITY_CACHE_TTL_SECONDS = env.REDIS_CITY_CACHE_TTL_SECONDS;

function getCityCacheKey(cityId: string) {
    return `${CITY_CACHE_PREFIX}${cityId}`;
}

class CityCacheRepository implements ICityCacheRepository {
    async findById(cityId: string): Promise<CityCacheDto | null> {
        const cached = await redisGet(getCityCacheKey(cityId));
        return cached ? JSON.parse(cached) as CityCacheDto : null;
    }

    async findAll(): Promise<CityCacheDto[]> {
        const items: CityCacheDto[] = [];
        let cursor = "0";

        do {
            const [nextCursor, keys] = await redisScan(cursor, `${CITY_CACHE_PREFIX}*`);
            const cityItems = await Promise.all(
                keys.map(async (key) => {
                    const cached = await redisGet(key);
                    return cached ? JSON.parse(cached) as CityCacheDto : null;
                })
            );

            items.push(...cityItems.filter((item): item is CityCacheDto => item !== null));
            cursor = nextCursor;
        } while (cursor !== "0");

        return items;
    }

    async upsert(projection: CityCacheDto): Promise<void> {
        const script = [
            "local current = redis.call('GET', KEYS[1])",
            "if current then",
            "  local decoded = cjson.decode(current)",
            "end",
            "redis.call('SET', KEYS[1], ARGV[1], 'EX', ARGV[2])",
            "return 1",
        ].join("\n");

        await redisEval(script, [getCityCacheKey(projection.cityId)], [
            JSON.stringify(projection),
            String(CITY_CACHE_TTL_SECONDS),
        ]);
    }

    async delete(cityId: string, version: number): Promise<void> {
        const script = [
            "local current = redis.call('GET', KEYS[1])",
            "if not current then return 0 end",
            "local decoded = cjson.decode(current)",
            "redis.call('DEL', KEYS[1])",
            "return 1",
        ].join("\n");

        await redisEval(script, [getCityCacheKey(cityId)], [String(version)]);
    }
}

export const cityCacheRepository = new CityCacheRepository();
