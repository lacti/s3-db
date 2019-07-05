import * as IORedis from "ioredis";
import { Director, setupStage } from "../actor-system";
import { RedisMutex } from "./mutex";
import { RedisQueue } from "./queue";

export const setupStageWithRedis = <T>(
  redis: IORedis.Redis = new IORedis(),
): Director<T> =>
  setupStage<T>({
    mutex: new RedisMutex(redis),
    queue: new RedisQueue(redis),
  });
