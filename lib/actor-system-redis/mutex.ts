import * as IORedis from "ioredis";
import { IMutex } from "../actor-system";

export class RedisMutex implements IMutex {
  private static readonly Locked = "1";
  private static readonly Unlocked = "0";

  constructor(private readonly redis: IORedis.Redis) {}

  public async tryLock(actorName: string) {
    const oldValue = await this.redis.getset(
      this.asRedisName(actorName),
      RedisMutex.Locked,
    );
    console.log(`redis-mutex-old-value`, this.asRedisName(actorName), oldValue);
    return oldValue === null || oldValue === RedisMutex.Unlocked;
  }

  public async release(actorName: string) {
    await this.redis.del(this.asRedisName(actorName));
    return true;
  }

  private readonly asRedisName = (name: string) => `mutex:${name}`;
}
