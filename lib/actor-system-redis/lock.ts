import * as IORedis from "ioredis";
import { ILock } from "../actor-system";

const asRedisName = (name: string) => `mutex:${name}`;

export class RedisLock implements ILock {
  private static readonly Locked = "1";
  private static readonly Unlocked = "0";

  constructor(private readonly redis: IORedis.Redis) {}

  public async tryAcquire(actorName: string) {
    const oldValue = await this.redis.getset(
      asRedisName(actorName),
      RedisLock.Locked
    );
    console.log(`redis-mutex-old-value`, asRedisName(actorName), oldValue);
    return oldValue === null || oldValue === RedisLock.Unlocked;
  }

  public async release(actorName: string) {
    await this.redis.del(asRedisName(actorName));
    return true;
  }
}
