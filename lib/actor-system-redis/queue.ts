import * as IORedis from "ioredis";
import { IQueue } from "../actor-system";
import { ICodec, JsonCodec } from "../codec";

export class RedisQueue<T> implements IQueue<T> {
  constructor(
    private readonly redis: IORedis.Redis,
    private readonly codec: ICodec<T, string> = new JsonCodec<T>(),
  ) {}

  public size(actorName: string) {
    return this.redis.llen(this.asRedisName(actorName));
  }

  public push(actorName: string, item: T) {
    return this.redis.rpush(
      this.asRedisName(actorName),
      this.codec.encode(item),
    );
  }

  public async pop(actorName: string) {
    const value = await this.redis.lpop(this.asRedisName(actorName));
    return this.codec.decode(value);
  }

  public async peek(actorName: string) {
    const value = await this.redis.lindex(this.asRedisName(actorName), 0);
    return this.codec.decode(value);
  }
  private readonly asRedisName = (name: string) => `queue:${name}`;
}
