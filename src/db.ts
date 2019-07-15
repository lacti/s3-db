import { ActorSystem, ConsoleLogger } from "@yingyeothon/actor-system";
import {
  handleActorAPIEvent,
  handleActorLambdaEvent,
  shiftToNextLambda
} from "@yingyeothon/actor-system-aws-lambda-support";
import { RedisLock, RedisQueue } from "@yingyeothon/actor-system-redis-support";
import { RedisRepository } from "@yingyeothon/repository-redis";
import { APIGatewayProxyHandler } from "aws-lambda";
import * as IORedis from "ioredis";
import "source-map-support/register";

const sleep = (millis: number) =>
  new Promise<void>(resolve => setTimeout(resolve, millis));

const redis = new IORedis({
  host: process.env.REDIS_HOST!,
  password: process.env.REDIS_PASSWORD
});
const logger = new ConsoleLogger("debug");
const sys = new ActorSystem({
  queue: new RedisQueue({ redis, logger }),
  lock: new RedisLock({ redis, logger }),
  logger
});

const repo = new RedisRepository({ redis });
const newActorByPath = (path: string) =>
  sys
    .spawn<IKeyValue>(path)
    .on("act", async ({ message: { key, value } }) => {
      console.log(`update-key-value`, path, key, value);
      await repo.getMapDocument(path).insertOrUpdate(key, value);
      console.log(`before-wait-2-seconds`);
      await sleep(2000);
      console.log(`after-wait-2-seconds`);
    })
    .on("error", console.error)
    .on(
      "shift",
      shiftToNextLambda({ functionName: process.env.BOTTOM_HALF_LAMBDA! })
    );

interface IKeyValue {
  key: string;
  value: string;
}

export const topHalf: APIGatewayProxyHandler = handleActorAPIEvent({
  spawn: newActorByPath,
  functionTimeout: 4 * 1000
});
export const bottomHalf = handleActorLambdaEvent({
  spawn: newActorByPath,
  functionTimeout: (15 * 60 - 3) * 1000
});

export const get: APIGatewayProxyHandler = async event => {
  const result = await repo.getMapDocument(event.path).read();
  console.log(`get-key-value`, event.path, result);
  return {
    statusCode: 200,
    body: JSON.stringify(result)
  };
};
