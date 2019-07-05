import * as IORedis from "ioredis";
import { ICodec, JsonCodec } from "../codec";
import { IRepository } from "../repository";

export class RedisRepository<T> implements IRepository<T> {
  constructor(
    private readonly repositoryName: string,
    private readonly redis: IORedis.Redis = new IORedis(),
    private readonly codec: ICodec<T, string> = new JsonCodec<T>(),
  ) {}

  public async get(key: string) {
    try {
      return this.codec.decode(await this.redis.get(this.asRedisKey(key)));
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  public async set(key: string, value: T) {
    if (value === undefined) {
      return this.delete(key);
    }
    await this.redis.set(this.asRedisKey(key), this.codec.encode(value));
  }

  public async delete(key: string) {
    await this.redis.del(this.asRedisKey(key));
  }

  private asRedisKey(key: string) {
    return `repo:${this.repositoryName}:${key}`;
  }
}
