import * as IORedis from "ioredis";
import { IQueue } from "../actor-system";
import { ICodec, JsonCodec } from "../codec";

const asRedisName = (name: string) => `queue:${name}`;

export class RedisQueue implements IQueue {
  constructor(
    private readonly redis: IORedis.Redis,
    private readonly codec: ICodec<string> = new JsonCodec()
  ) {}

  public size(actorName: string) {
    return this.redis.llen(asRedisName(actorName));
  }

  public push<T>(actorName: string, item: T) {
    return this.redis.rpush(asRedisName(actorName), this.codec.encode(item));
  }

  public async pop<T>(actorName: string) {
    const value = await this.redis.lpop(asRedisName(actorName));
    return this.codec.decode<T>(value);
  }

  public async peek<T>(actorName: string) {
    const value = await this.redis.lindex(asRedisName(actorName), 0);
    return this.codec.decode<T>(value);
  }
}
