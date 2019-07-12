import { APIGatewayProxyHandler } from "aws-lambda";
import * as IORedis from "ioredis";
import "source-map-support/register";

import { ActorSystem } from "../lib/actor-system";
import {
  handleActorAPIEvent,
  handleActorLambdaEvent,
  shiftToNextLambda
} from "../lib/actor-system-on-aws-lambda";
import { RedisLock, RedisQueue } from "../lib/actor-system-redis";
import { RedisRepository } from "../lib/repository-redis";

const sleep = (millis: number) =>
  new Promise<void>(resolve => setTimeout(resolve, millis));

const redis = new IORedis({
  host: process.env.REDIS_HOST!,
  password: process.env.REDIS_PASSWORD
});
const sys = new ActorSystem({
  queue: new RedisQueue(redis),
  lock: new RedisLock(redis)
});

const repo = new RedisRepository({ redis });
const newActorByPath = (path: string) =>
  sys.find<IKeyValue>(path) ||
  sys
    .spawn<IKeyValue>(path)
    .on("act", async ({ key, value }) => {
      console.log(`update-key-value`, path, key, value);
      await repo.getMapDocument(path).insertOrUpdate(key, value);
      console.log(`before-wait-2-seconds`);
      await sleep(2000);
      console.log(`after-wait-2-seconds`);
    })
    .on("error", console.error)
    .on(
      "shift",
      shiftToNextLambda({ functionName: process.env.ACTOR_LAMBDA_NAME! })
    );

interface IKeyValue {
  key: string;
  value: string;
}

export const put: APIGatewayProxyHandler = handleActorAPIEvent(newActorByPath);
export const actorLambda = handleActorLambdaEvent(newActorByPath);

export const get: APIGatewayProxyHandler = async event => {
  const result = await repo.getMapDocument(event.path).read();
  console.log(`get-key-value`, event.path, result);
  return {
    statusCode: 200,
    body: JSON.stringify(result)
  };
};
