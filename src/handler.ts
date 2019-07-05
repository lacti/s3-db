import { APIGatewayProxyHandler } from "aws-lambda";
import * as IORedis from "ioredis";
import "source-map-support/register";
import { actorOnAWSLambda } from "../lib/actor-system-on-aws-lambda";
import { setupStageWithRedis } from "../lib/actor-system-redis";
import { SimpleKV } from "../lib/repository";
import { RedisRepository } from "../lib/repository-redis";

interface IKeyValue {
  key: string;
  value: string;
}

const redis = new IORedis({
  host: process.env.REDIS_HOST!,
  password: process.env.REDIS_PASSWORD,
});
const kv = new SimpleKV(new RedisRepository<any>("", redis));

const onMessage = actorOnAWSLambda(setupStageWithRedis<IKeyValue>(redis));

const sleep = (millis: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, millis));

export const put = onMessage(async (item) => {
  const result = await kv.insertOrUpdate(item.key, item.value);
  console.log(`request-iou`, result);
  await sleep(2 * 1000);
  console.log(`after-sleep-2-secs`);
});

export const get: APIGatewayProxyHandler = async () => {
  const result = await kv.read();
  console.log(result);
  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};

/**
 * TODO
 *  - Lambda timeout
 *  - Lock TTL
 *  - Lock owner
 *  - String queue, Actor codec
 *  - Rewrite API
 *  - API GW / Process Lambda
 */
