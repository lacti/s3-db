import {
  handleActorAPIEvent,
  handleActorLambdaEvent
} from "@yingyeothon/actor-system-aws-lambda-support";
import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { getDatabaseActorFromUrlPath, readDataFromUrlPath } from "./actor";

export const topHalf: APIGatewayProxyHandler = handleActorAPIEvent({
  spawn: getDatabaseActorFromUrlPath,
  functionTimeout: 5 * 1000
});

export const get: APIGatewayProxyHandler = async event => {
  const data = await readDataFromUrlPath(event.path);
  return {
    statusCode: 200,
    body: JSON.stringify(data)
  };
};

export const bottomHalf = handleActorLambdaEvent({
  spawn: getDatabaseActorFromUrlPath,
  functionTimeout: (900 - 3) * 1000
});
