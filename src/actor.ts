import { ActorSystem } from "@yingyeothon/actor-system";
import { shiftToNextLambda } from "@yingyeothon/actor-system-aws-lambda-support";
import { RedisLock, RedisQueue } from "@yingyeothon/actor-system-redis-support";
import { ConsoleLogger } from "@yingyeothon/logger";
import * as IORedis from "ioredis";
import { details, parseActorFromUrlPath } from "./db";
import envars from "./env";

const logger = new ConsoleLogger("debug");

const redis = new IORedis({
  host: envars.actor.redisHost,
  password: envars.actor.redisPassword
});

const sys = new ActorSystem({
  queue: new RedisQueue({ redis, logger }),
  lock: new RedisLock({ redis, logger }),
  logger
});

export const getDatabaseActorFromActorName = (actorName: string) => {
  logger.debug(`actor-resource`, actorName);
  const { docType, docPath } = parseActorFromUrlPath(actorName);
  logger.debug(`init-actor`, actorName, docType, docPath);
  return sys.spawn<any>(docPath, newActor =>
    newActor
      .on("act", async ({ message }) => {
        logger.debug(`update-key-value`, docType, docPath, message);
        return details[docType].set(docPath, message);
      })
      .on("error", console.error)
      .on(
        "shift",
        shiftToNextLambda({ functionName: envars.actor.bottomHalfLambda })
      )
  );
};

export const readDataFromUrlPath = async (urlPath: string) => {
  const { docType, docPath } = parseActorFromUrlPath(urlPath);
  return details[docType].get(docPath);
};
