import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

function makeLimiter(limit: number, window: `${number}${"s" | "m" | "h"}`) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  const redis = Redis.fromEnv();
  return new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(limit, window) });
}

export const agentLimiter = makeLimiter(20, "1h");
export const voiceLimiter = makeLimiter(30, "1h");
