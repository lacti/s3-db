import * as IORedis from "ioredis";
import { ICodec, JsonCodec } from "../codec";
import { SimpleRepository } from "../repository";

interface IRedisRepositoryArguments {
  redis: IORedis.Redis;
  prefix: string;
  codec: ICodec<string>;
}

export class RedisRepository extends SimpleRepository {
  private readonly redis: IORedis.Redis;
  private readonly prefix: string;
  private readonly codec: ICodec<string>;

  constructor({
    redis,
    prefix,
    codec
  }: Partial<IRedisRepositoryArguments> = {}) {
    super();
    this.redis = redis || new IORedis();
    this.codec = codec || new JsonCodec();
    this.prefix = prefix;
  }

  public async get<T>(key: string) {
    try {
      return this.codec.decode<T>(await this.redis.get(this.asRedisKey(key)));
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  public async set<T>(key: string, value: T) {
    if (value === undefined) {
      return this.delete(key);
    }
    await this.redis.set(this.asRedisKey(key), this.codec.encode(value));
  }

  public async delete(key: string) {
    await this.redis.del(this.asRedisKey(key));
  }

  public async withPrefix(prefix: string) {
    return new RedisRepository({
      redis: this.redis,
      prefix,
      codec: this.codec
    });
  }

  private asRedisKey(key: string) {
    return this.prefix ? `repo:${this.prefix}:${key}` : `repo:${key}`;
  }
}
