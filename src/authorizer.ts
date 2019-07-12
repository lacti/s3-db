import { CustomAuthorizerHandler } from "aws-lambda";
import * as IORedis from "ioredis";
import { RedisRepository } from "../lib/repository-redis";
import { Authorizer } from "../lib/simple-authorizer";

const redis = new IORedis({
  host: process.env.REDIS_HOST!,
  password: process.env.REDIS_PASSWORD
});

const authorizer = new Authorizer(
  new RedisRepository({ redis }),
  new RedisRepository({ redis })
);

export const auth: CustomAuthorizerHandler = async event => {
  event.authorizationToken;
};
